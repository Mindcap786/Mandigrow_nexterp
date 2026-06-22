import { format } from "date-fns";
import { ESCPOS } from "./bluetooth-printer";

export function generateSaleReceiptESCPOS(sale: any, organization: any, width: number = 48) {
  const esc = new ESCPOS();
  esc.init();

  const orgName = organization?.name || 'Store';
  const billNo = sale.contact_bill_no || sale.bill_no || sale.id || 'N/A';
  const dateStr = sale.transaction_date ? format(new Date(sale.transaction_date), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy');
  
  // Header
  esc.align('center').bold(true).textLine(orgName).bold(false);
  esc.textLine("Tax Invoice / Bill");
  esc.line(width, '-');

  // Details
  esc.align('left');
  esc.row(`Bill No: ${billNo}`, `Date: ${dateStr}`, width);
  const buyerName = sale.contact?.name || sale.buyer_name || sale.buyer?.name;
  if (buyerName) {
    esc.row('Buyer:', buyerName.substring(0, width - 8), width);
  }
  
  const amountReceived = Math.max(
      Number(sale.amount_received || 0),
      Number(sale.paid_amount || 0),
      Number(sale.payment_summary?.amount_received || 0)
  );
  const paymentMode = sale.payment_mode || (amountReceived > 0 ? 'Cash/Digital' : 'Credit');
  esc.row('Mode:', paymentMode, width);
  esc.line(width, '-');

  // Table Header
  // width: Item (flex), Qty (4), Rate (6), Amt (8)
  const qtyW = 4;
  const rateW = 6;
  const amtW = 8;
  const itemW = width - qtyW - rateW - amtW - 3; // 3 spaces between cols

  const padR = (str: string, len: number) => (str + ' '.repeat(len)).substring(0, len);
  const padL = (str: string, len: number) => (' '.repeat(len) + str).slice(-len);

  esc.bold(true);
  esc.textLine(padR('Item', itemW) + ' ' + padL('Qty', qtyW) + ' ' + padL('Rate', rateW) + ' ' + padL('Amt', amtW));
  esc.bold(false);
  esc.line(width, '-');

  // Items
  const items = sale.sale_items || [];
  let subtotal = 0;
  for (const c of items) {
      const itemName = (c.item_name || c.lot?.item?.name || 'Item').substring(0, itemW);
      const qty = Number(c.qty || 0).toString();
      const rate = Number(c.rate || 0).toString();
      const amt = Number(c.amount || (Number(c.qty) * Number(c.rate))).toFixed(0);
      subtotal += Number(amt);

      esc.textLine(padR(itemName, itemW) + ' ' + padL(qty, qtyW) + ' ' + padL(rate, rateW) + ' ' + padL(amt, amtW));
      
      const gstRate = Number(c.gst_rate || 0);
      const gstAmt = Number(c.gst_amount || 0);
      if (gstRate > 0) {
          const isIncl = String(c.sale_gst_type || 'Exclusive').trim().toLowerCase() === 'inclusive' || c.gst_inclusive;
          const typeStr = isIncl ? 'Incl.' : '+';
          const gstStr = `${typeStr} GST ${gstRate}% (Rs.${gstAmt.toFixed(2)})`;
          esc.textLine(padR('  ' + gstStr, width));
      }
  }
  esc.line(width, '-');

  // Totals
  const totalGst = (Number(sale.cgst_amount || sale.cgst || 0) + Number(sale.sgst_amount || sale.sgst || 0) + Number(sale.igst_amount || sale.igst || 0)) || Number(sale.gst_total || 0);
  
  esc.row('Subtotal', subtotal.toFixed(2), width);
  if (totalGst > 0) esc.row('Tax', totalGst.toFixed(2), width);
  if (Number(sale.market_fee || 0) > 0) esc.row('Market Fee', Number(sale.market_fee).toFixed(2), width);
  if (Number(sale.nirashrit || 0) > 0) esc.row('Nirashrit', Number(sale.nirashrit).toFixed(2), width);
  if (Number(sale.misc_fee || 0) > 0) esc.row('Misc Fee', Number(sale.misc_fee).toFixed(2), width);
  if (Number(sale.extra_charges || 0) > 0) esc.row('Extra Charges', Number(sale.extra_charges).toFixed(2), width);
  if (Number(sale.crate_total || 0) > 0) esc.row('Crate Charges', Number(sale.crate_total).toFixed(2), width);
  if (Number(sale.discount_amount || 0) > 0) esc.row('Discount', '-' + Number(sale.discount_amount).toFixed(2), width);

  const grandTotal = Number(
      sale.total_amount_inc_tax || sale.grand_total ||
      (
          subtotal +
          Number(sale.market_fee || 0) +
          Number(sale.misc_fee || 0) +
          (totalGst) -
          Number(sale.discount_amount || 0)
      )
  );

  esc.line(width, '-');
  esc.bold(true).row('GRAND TOTAL', grandTotal.toFixed(2), width).bold(false);
  esc.line(width, '-');

  if (amountReceived > 0) {
      esc.row('Amount Paid', amountReceived.toFixed(2), width);
      const balance = grandTotal - amountReceived;
      if (balance > 0) {
          esc.row('Balance Due', balance.toFixed(2), width);
      }
  }

  // Footer
  esc.feed(2);
  esc.align('center').textLine("Thank you for your business!");
  if (organization?.phone) {
      esc.textLine(organization.phone);
  }
  esc.feed(4); // Feed enough to tear
  esc.cut();

  return esc.getBuffer();
}

export function generatePurchaseReceiptESCPOS(lot: any, arrival: any, organization: any, arrivalLots: any[] = [], width: number = 48) {
  const esc = new ESCPOS();
  esc.init();

  const padR = (str: string, len: number) => (str + ' '.repeat(len)).substring(0, len);
  const padL = (str: string, len: number) => (' '.repeat(len) + str).slice(-len);
  const toNumber = (v: any) => Number(v) || 0;

  const orgName = organization?.name || 'Store';
  const billNo = arrival?.contact_bill_no || arrival?.bill_no || lot?.lot_code || 'N/A';
  const arrivalDate = arrival?.arrival_date || lot?.created_at;
  const dateStr = arrivalDate ? format(new Date(arrivalDate), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy');
  const farmerName = lot?.farmer?.name || lot?.contact?.name || 'Unknown Supplier';

  esc.align('center').bold(true).textLine(orgName).bold(false);
  esc.textLine("Purchase Bill");
  esc.line(width, '-');

  esc.align('left');
  esc.row(`Bill No: ${billNo}`, `Date: ${dateStr}`, width);
  esc.row('Supplier:', farmerName.substring(0, width - 10), width);
  esc.line(width, '-');

  const qtyW = 4;
  const rateW = 6;
  const amtW = 8;
  const itemW = width - qtyW - rateW - amtW - 3; 

  esc.bold(true);
  esc.textLine(padR('Item', itemW) + ' ' + padL('Qty', qtyW) + ' ' + padL('Rate', rateW) + ' ' + padL('Amt', amtW));
  esc.bold(false);
  esc.line(width, '-');

  const lotsToProcess = arrivalLots.length > 0 ? arrivalLots : [lot];
  let totalGrossGoodsValue = 0;
  let totalLessAmount = 0;
  let totalCommission = 0;
  let totalLotExpenses = 0;
  let totalAdvance = 0;
  let totalPaidAmount = 0;
  let totalOtherCharges = 0;
  let totalArrivalExpenseShare = 0;

  for (const l of lotsToProcess) {
      if (!l) continue;
      const gQty = toNumber(l.gross_quantity) || toNumber(l.initial_qty);
      const isSettled = !!l.settlement_at;
      let lLessQty = 0;
      const lLessUnits = toNumber(l.less_units);
      const lLessPercent = toNumber(l.less_percent);
      if (lLessUnits > 0) lLessQty = lLessUnits;
      else if (lLessPercent > 0) lLessQty = gQty * (lLessPercent / 100);
      
      const rate = toNumber(l.supplier_rate);
      const gGoodsVal = gQty * rate;
      const lLessAmount = lLessQty * rate;
      const nGoodsVal = Math.max(0, gGoodsVal - lLessAmount - toNumber(l.farmer_charges || 0));

      totalGrossGoodsValue += gGoodsVal;
      totalLessAmount += lLessAmount;
      totalCommission += isSettled ? toNumber(l.settlement_commission) : (nGoodsVal * toNumber(l.commission_percent)) / 100;
      totalLotExpenses += isSettled ? toNumber(l.settlement_expenses) : (toNumber(l.packing_cost) + toNumber(l.loading_cost));
      totalAdvance += toNumber(l.advance);
      totalPaidAmount += toNumber(l.paid_amount);
      totalOtherCharges += toNumber(l.other_charges || 0);
      totalArrivalExpenseShare += toNumber(l.farmer_charges || 0);

      const itemName = (l.item?.name || lot?.item?.name || 'Item').substring(0, itemW);
      const lGoodsValFinal = isSettled ? toNumber(l.settlement_goods_value) : (gQty * rate);

      esc.textLine(padR(itemName, itemW) + ' ' + padL(Math.round(gQty).toString(), qtyW) + ' ' + padL(Math.round(rate).toString(), rateW) + ' ' + padL(Math.round(lGoodsValFinal).toString(), amtW));
      
      const gstRate = toNumber(l.purchase_gst_rate || 0);
      const gstAmt = toNumber(l.purchase_gst_amount || 0);
      if (gstRate > 0) {
          const typeStr = String(l.purchase_gst_type || 'Exclusive').trim().toLowerCase() === 'inclusive' ? 'Incl.' : '+';
          const gstStr = `${typeStr} GST ${gstRate}% (Rs.${gstAmt.toFixed(2)})`;
          esc.textLine(padR('  ' + gstStr, width));
      }
  }
  esc.line(width, '-');

  if (totalAdvance === 0 && arrival?.advance) totalAdvance = toNumber(arrival.advance);
  if (totalPaidAmount === 0 && arrival?.paid_amount) totalPaidAmount = toNumber(arrival.paid_amount);

  const tripExpenses = toNumber(arrival?.hire_charges) + toNumber(arrival?.hamali_expenses) + toNumber(arrival?.other_expenses);
  const combinedExpenses = totalLotExpenses + tripExpenses;
  const totalNetGoodsValue = Math.max(0, totalGrossGoodsValue - totalLessAmount - totalArrivalExpenseShare);

  const isChequeMode = (arrival?.advance_payment_mode || '').toLowerCase() === 'cheque';
  const isChequeCleared = !isChequeMode ? true : (arrival?.is_cheque_cleared === true);
  const effectiveAdvance = isChequeCleared ? totalAdvance : 0;
  const effectivePaidAmount = isChequeCleared ? totalPaidAmount : 0;
  const combinedPaid = effectiveAdvance === effectivePaidAmount ? effectiveAdvance : effectiveAdvance + effectivePaidAmount;

  const arrivalType = arrival?.arrival_type || (lot?.mandi_owned ? 'direct' : 'commission');

  esc.row('Gross Value', Math.round(totalGrossGoodsValue).toString(), width);
  if (totalLessAmount > 0) esc.row('Less/Cutting', '-' + Math.round(totalLessAmount).toString(), width);
  esc.row('Net Goods Val', Math.round(totalNetGoodsValue).toString(), width);

  if (totalArrivalExpenseShare > 0) esc.row('Farmer Charges', '-' + Math.round(totalArrivalExpenseShare).toString(), width);
  if (totalCommission > 0) esc.row('Commission', '-' + Math.round(totalCommission).toString(), width);
  if (combinedExpenses > 0) esc.row('Expenses', (arrivalType === 'direct' ? '+' : '-') + Math.round(combinedExpenses).toString(), width);
  if (totalOtherCharges > 0) esc.row('Other Charges', '-' + Math.round(totalOtherCharges).toString(), width);
  if (combinedPaid > 0) esc.row('Amount Paid', '-' + Math.round(combinedPaid).toString(), width);

  const finalPayable = arrivalType === 'direct' 
        ? Math.max(0, totalNetGoodsValue + combinedExpenses - combinedPaid - totalOtherCharges) 
        : Math.max(0, totalNetGoodsValue - totalCommission - combinedExpenses - combinedPaid - totalOtherCharges);

  esc.line(width, '-');
  esc.bold(true).row('TOTAL PAYABLE', Math.round(finalPayable).toString(), width).bold(false);
  esc.line(width, '-');

  esc.feed(2);
  esc.align('center').textLine("Thank you!");
  esc.feed(4);
  esc.cut();

  return esc.getBuffer();
}

// ─── Bilingual Printer: Local Language Sale Receipt ───────────────────────────
// Sends raw UTF-8 text — fast path for printers with built-in Indian language fonts.
// Labels come from the translations object, item names from itemTranslations.
export function generateLocalLangSaleReceiptESCPOS(
  sale: any,
  organization: any,
  lang: string,
  itemTranslations: Record<string, string> = {},
  partyTranslation: string | null = null,
  width: number = 48
) {
  const esc = new ESCPOS();
  esc.init();
  esc.enableUtf8(); // Switch printer to UTF-8 mode

  const orgName = organization?.name || 'Store';
  const billNo = sale.contact_bill_no || sale.bill_no || sale.id || 'N/A';
  const dateStr = sale.transaction_date
    ? format(new Date(sale.transaction_date), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');

  // Import translations synchronously (they're already loaded)
  // We use the same t() key lookup but push as UTF-8 bytes
  const L = {
    taxInvoice: lang === 'te' ? 'పన్ను రసీదు / బిల్లు' : lang === 'hi' ? 'कर चालान / बिल' : lang === 'kn' ? 'ತೆರಿಗೆ ರಸೀದಿ / ಬಿಲ್' : lang === 'mr' ? 'कर पावती / बिल' : 'Tax Invoice / Bill',
    billNo:    lang === 'te' ? 'బిల్లు నం' : lang === 'hi' ? 'बिल नं' : lang === 'kn' ? 'ಬಿಲ್ ನಂ' : lang === 'mr' ? 'बिल क्र' : 'Bill No',
    date:      lang === 'te' ? 'తేది' : lang === 'hi' ? 'तारीख' : lang === 'kn' ? 'ದಿನಾಂಕ' : lang === 'mr' ? 'तारीख' : 'Date',
    buyer:     lang === 'te' ? 'కొనుగోలుదారు' : lang === 'hi' ? 'खरीदार' : lang === 'kn' ? 'ಖರೀದಿದಾರ' : lang === 'mr' ? 'खरेदीदार' : 'Buyer',
    mode:      lang === 'te' ? 'చెల్లింపు విధానం' : lang === 'hi' ? 'भुगतान मोड' : lang === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ' : lang === 'mr' ? 'पेमेंट मोड' : 'Mode',
    item:      lang === 'te' ? 'వస్తువు' : lang === 'hi' ? 'वस्तु' : lang === 'kn' ? 'ವಸ್ತು' : lang === 'mr' ? 'वस्तू' : 'Item',
    qty:       lang === 'te' ? 'పరిమాణం' : lang === 'hi' ? 'मात्रा' : lang === 'kn' ? 'ಪ್ರಮಾಣ' : lang === 'mr' ? 'प्रमाण' : 'Qty',
    rate:      lang === 'te' ? 'ధర' : lang === 'hi' ? 'दर' : lang === 'kn' ? 'ದರ' : lang === 'mr' ? 'दर' : 'Rate',
    amt:       lang === 'te' ? 'మొత్తం' : lang === 'hi' ? 'राशि' : lang === 'kn' ? 'ಮೊತ್ತ' : lang === 'mr' ? 'रक्कम' : 'Amt',
    subtotal:  lang === 'te' ? 'ఉప మొత్తం' : lang === 'hi' ? 'उप-कुल' : lang === 'kn' ? 'ಉಪ ಮೊತ್ತ' : lang === 'mr' ? 'उप-एकूण' : 'Subtotal',
    total:     lang === 'te' ? 'మొత్తం' : lang === 'hi' ? 'कुल' : lang === 'kn' ? 'ಒಟ್ಟು' : lang === 'mr' ? 'एकूण' : 'TOTAL',
    amtPaid:   lang === 'te' ? 'చెల్లించిన మొత్తం' : lang === 'hi' ? 'भुगतान राशि' : lang === 'kn' ? 'ಪಾವತಿ ಮೊತ್ತ' : lang === 'mr' ? 'भरलेली रक्कम' : 'Amount Paid',
    balance:   lang === 'te' ? 'బాకీ' : lang === 'hi' ? 'बकाया' : lang === 'kn' ? 'ಬಾಕಿ' : lang === 'mr' ? 'बाकी' : 'Balance Due',
    thankYou:  lang === 'te' ? 'ధన్యవాదాలు' : lang === 'hi' ? 'धन्यवाद' : lang === 'kn' ? 'ಧನ್ಯವಾದಗಳು' : lang === 'mr' ? 'धन्यवाद' : 'Thank you!',
  };

  // Header
  esc.align('center').bold(true).utf8TextLine(orgName).bold(false);
  esc.utf8TextLine(L.taxInvoice);
  esc.line(width, '-');

  // Bill details
  esc.align('left');
  const billNoStr = `${L.billNo}: ${billNo}`;
  const dateStr2 = `${L.date}: ${dateStr}`;
  esc.utf8TextLine(billNoStr.padEnd(width - dateStr2.length) + dateStr2);

  const buyerName = partyTranslation || sale.contact?.name || sale.buyer_name || sale.buyer?.name;
  if (buyerName) {
    esc.utf8TextLine(`${L.buyer}: ${buyerName}`);
  }
  const paymentMode = sale.payment_mode || 'Cash';
  esc.utf8TextLine(`${L.mode}: ${paymentMode}`);
  esc.line(width, '-');

  // Items (keep item columns simple for multilingual)
  esc.bold(true).utf8TextLine(`${L.item} | ${L.qty} | ${L.rate} | ${L.amt}`).bold(false);
  esc.line(width, '-');

  const items = sale.sale_items || [];
  let subtotal = 0;
  for (const c of items) {
    const rawName = c.item_name || c.lot?.item?.name || 'Item';
    const itemName = itemTranslations[rawName] || c.lot?.item?.local_name || rawName;
    const qty = Number(c.qty || 0);
    const rate = Number(c.rate || 0);
    const amt = Number(c.amount || qty * rate);
    subtotal += amt;
    esc.utf8TextLine(`${itemName}`);
    esc.utf8TextLine(`  ${qty} x ${rate} = ${amt.toFixed(0)}`);
  }
  esc.line(width, '-');

  // Totals
  const totalGst = (Number(sale.cgst_amount || 0) + Number(sale.sgst_amount || 0) + Number(sale.igst_amount || 0)) || Number(sale.gst_total || 0);
  const grandTotal = Number(sale.total_amount_inc_tax || sale.grand_total || subtotal);
  const amountReceived = Math.max(Number(sale.amount_received || 0), Number(sale.paid_amount || 0));

  esc.utf8TextLine(`${L.subtotal}: ${subtotal.toFixed(2)}`);
  if (totalGst > 0) esc.utf8TextLine(`GST: ${totalGst.toFixed(2)}`);
  if (Number(sale.market_fee || 0) > 0) esc.utf8TextLine(`Market Fee: ${Number(sale.market_fee).toFixed(2)}`);
  if (Number(sale.discount_amount || 0) > 0) esc.utf8TextLine(`Discount: -${Number(sale.discount_amount).toFixed(2)}`);

  esc.line(width, '-');
  esc.bold(true).utf8TextLine(`${L.total}: Rs. ${grandTotal.toFixed(2)}`).bold(false);
  esc.line(width, '-');

  if (amountReceived > 0) {
    esc.utf8TextLine(`${L.amtPaid}: Rs. ${amountReceived.toFixed(2)}`);
    if (amountReceived < grandTotal) {
      esc.utf8TextLine(`${L.balance}: Rs. ${(grandTotal - amountReceived).toFixed(2)}`);
    }
  }

  esc.feed(2);
  esc.align('center').utf8TextLine(L.thankYou);
  if (organization?.phone) esc.textLine(organization.phone);
  esc.feed(4);
  esc.cut();

  return esc.getBuffer();
}

// ─── Bilingual Printer: Local Language Purchase Receipt ───────────────────────
export function generateLocalLangPurchaseReceiptESCPOS(
  lot: any,
  arrival: any,
  organization: any,
  arrivalLots: any[] = [],
  lang: string,
  itemTranslations: Record<string, string> = {},
  partyTranslation: string | null = null,
  width: number = 48
) {
  const esc = new ESCPOS();
  esc.init();
  esc.enableUtf8();

  const toNumber = (v: any) => Number(v) || 0;

  const L = {
    purchaseBill: lang === 'te' ? 'కొనుగోలు బిల్లు' : lang === 'hi' ? 'खरीद बिल' : lang === 'kn' ? 'ಖರೀದಿ ಬಿಲ್' : lang === 'mr' ? 'खरेदी बिल' : 'Purchase Bill',
    billNo:       lang === 'te' ? 'బిల్లు నం' : lang === 'hi' ? 'बिल नं' : lang === 'kn' ? 'ಬಿಲ್ ನಂ' : lang === 'mr' ? 'बिल क्र' : 'Bill No',
    date:         lang === 'te' ? 'తేది' : lang === 'hi' ? 'तारीख' : lang === 'kn' ? 'ದಿನಾಂಕ' : lang === 'mr' ? 'तारीख' : 'Date',
    supplier:     lang === 'te' ? 'రైతు / సరఫరాదారు' : lang === 'hi' ? 'किसान / आपूर्तिकर्ता' : lang === 'kn' ? 'ರೈತ / ಪೂರೈಕೆದಾರ' : lang === 'mr' ? 'शेतकरी / पुरवठादार' : 'Supplier',
    grossVal:     lang === 'te' ? 'స్థూల విలువ' : lang === 'hi' ? 'सकल मूल्य' : lang === 'kn' ? 'ಒಟ್ಟು ಮೌಲ್ಯ' : lang === 'mr' ? 'एकूण मूल्य' : 'Gross Value',
    commission:   lang === 'te' ? 'కమీషన్' : lang === 'hi' ? 'कमीशन' : lang === 'kn' ? 'ಕಮಿಷನ್' : lang === 'mr' ? 'कमिशन' : 'Commission',
    expenses:     lang === 'te' ? 'ఖర్చులు' : lang === 'hi' ? 'खर्च' : lang === 'kn' ? 'ವೆಚ್ಚ' : lang === 'mr' ? 'खर्च' : 'Expenses',
    totalPayable: lang === 'te' ? 'చెల్లించాల్సిన మొత్తం' : lang === 'hi' ? 'कुल देय' : lang === 'kn' ? 'ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ' : lang === 'mr' ? 'एकूण देय' : 'Total Payable',
    thankYou:     lang === 'te' ? 'ధన్యవాదాలు' : lang === 'hi' ? 'धन्यवाद' : lang === 'kn' ? 'ಧನ್ಯವಾದಗಳು' : lang === 'mr' ? 'धन्यवाद' : 'Thank you!',
  };

  const orgName = organization?.name || 'Store';
  const billNo = arrival?.contact_bill_no || arrival?.bill_no || lot?.lot_code || 'N/A';
  const arrivalDate = arrival?.arrival_date || lot?.created_at;
  const dateStr = arrivalDate ? format(new Date(arrivalDate), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy');
  const farmerName = partyTranslation || lot?.farmer?.name || lot?.contact?.name || 'Supplier';

  esc.align('center').bold(true).utf8TextLine(orgName).bold(false);
  esc.utf8TextLine(L.purchaseBill);
  esc.line(width, '-');

  esc.align('left');
  esc.utf8TextLine(`${L.billNo}: ${billNo}    ${L.date}: ${dateStr}`);
  esc.utf8TextLine(`${L.supplier}: ${farmerName}`);
  esc.line(width, '-');

  const lotsToProcess = arrivalLots.length > 0 ? arrivalLots : [lot];
  let totalGrossGoodsValue = 0, totalLessAmount = 0, totalCommission = 0;
  let totalLotExpenses = 0, totalAdvance = 0, totalPaidAmount = 0;
  let totalOtherCharges = 0, totalArrivalExpenseShare = 0;

  for (const l of lotsToProcess) {
    if (!l) continue;
    const gQty = toNumber(l.gross_quantity) || toNumber(l.initial_qty);
    const isSettled = !!l.settlement_at;
    let lLessQty = 0;
    const lLessUnits = toNumber(l.less_units);
    const lLessPercent = toNumber(l.less_percent);
    if (lLessUnits > 0) lLessQty = lLessUnits;
    else if (lLessPercent > 0) lLessQty = gQty * (lLessPercent / 100);

    const rate = toNumber(l.supplier_rate);
    const gGoodsVal = gQty * rate;
    const lLessAmount = lLessQty * rate;
    const nGoodsVal = Math.max(0, gGoodsVal - lLessAmount - toNumber(l.farmer_charges || 0));

    totalGrossGoodsValue += gGoodsVal;
    totalLessAmount += lLessAmount;
    totalCommission += isSettled ? toNumber(l.settlement_commission) : (nGoodsVal * toNumber(l.commission_percent)) / 100;
    totalLotExpenses += isSettled ? toNumber(l.settlement_expenses) : (toNumber(l.packing_cost) + toNumber(l.loading_cost));
    totalAdvance += toNumber(l.advance);
    totalPaidAmount += toNumber(l.paid_amount);
    totalOtherCharges += toNumber(l.other_charges || 0);
    totalArrivalExpenseShare += toNumber(l.farmer_charges || 0);

    const rawItemName = l.item?.name || lot?.item?.name || 'Item';
    const itemName = itemTranslations[rawItemName] || rawItemName;
    const lGoodsValFinal = isSettled ? toNumber(l.settlement_goods_value) : gGoodsVal;
    esc.utf8TextLine(`${itemName}`);
    esc.utf8TextLine(`  ${Math.round(gQty)} x ${Math.round(rate)} = ${Math.round(lGoodsValFinal)}`);
  }
  esc.line(width, '-');

  if (totalAdvance === 0 && arrival?.advance) totalAdvance = toNumber(arrival.advance);
  if (totalPaidAmount === 0 && arrival?.paid_amount) totalPaidAmount = toNumber(arrival.paid_amount);

  const tripExpenses = toNumber(arrival?.hire_charges) + toNumber(arrival?.hamali_expenses) + toNumber(arrival?.other_expenses);
  const combinedExpenses = totalLotExpenses + tripExpenses;
  const totalNetGoodsValue = Math.max(0, totalGrossGoodsValue - totalLessAmount - totalArrivalExpenseShare);
  const combinedPaid = totalAdvance === totalPaidAmount ? totalAdvance : totalAdvance + totalPaidAmount;
  const arrivalType = arrival?.arrival_type || 'commission';

  esc.utf8TextLine(`${L.grossVal}: ${Math.round(totalGrossGoodsValue)}`);
  if (totalCommission > 0) esc.utf8TextLine(`${L.commission}: -${Math.round(totalCommission)}`);
  if (combinedExpenses > 0) esc.utf8TextLine(`${L.expenses}: ${arrivalType === 'direct' ? '+' : '-'}${Math.round(combinedExpenses)}`);
  if (combinedPaid > 0) esc.utf8TextLine(`Amount Paid: -${Math.round(combinedPaid)}`);

  const finalPayable = arrivalType === 'direct'
    ? Math.max(0, totalNetGoodsValue + combinedExpenses - combinedPaid - totalOtherCharges)
    : Math.max(0, totalNetGoodsValue - totalCommission - combinedExpenses - combinedPaid - totalOtherCharges);

  esc.line(width, '-');
  esc.bold(true).utf8TextLine(`${L.totalPayable}: Rs. ${Math.round(finalPayable)}`).bold(false);
  esc.line(width, '-');

  esc.feed(2);
  esc.align('center').utf8TextLine(L.thankYou);
  esc.feed(4);
  esc.cut();

  return esc.getBuffer();
}
