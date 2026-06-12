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
  if (sale.buyer?.name) {
    esc.row('Buyer:', sale.buyer.name.substring(0, width - 8), width);
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
