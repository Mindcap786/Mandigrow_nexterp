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
  }
  esc.line(width, '-');

  // Totals
  const totalGst = (Number(sale.cgst_amount || sale.cgst || 0) + Number(sale.sgst_amount || sale.sgst || 0) + Number(sale.igst_amount || sale.igst || 0)) || Number(sale.gst_total || 0);
  
  esc.row('Subtotal', subtotal.toFixed(2), width);
  if (totalGst > 0) esc.row('Tax', totalGst.toFixed(2), width);
  if (Number(sale.market_fee || 0) > 0) esc.row('Market Fee', Number(sale.market_fee).toFixed(2), width);
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

  if (totalCommission > 0) esc.row('Commission', '-' + Math.round(totalCommission).toString(), width);
  if (combinedExpenses > 0) esc.row('Expenses', (arrivalType === 'direct' ? '+' : '-') + Math.round(combinedExpenses).toString(), width);
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
