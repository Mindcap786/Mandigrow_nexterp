const fs = require('fs');

const destFile = 'components/local-invoices/LocalPurchaseInvoice.tsx';
let content = fs.readFileSync(destFile, 'utf8');

// 1. Imports
content = content.replace(
    'import { toWords } from "@/lib/number-to-words"',
    `import type { LangCode } from "./utils/fonts"
import { FONT_FAMILIES, FONT_URLS, TEXT_DIRECTION } from "./utils/fonts"
import { getTranslation, getPartyName, getItemName } from "./translations"
import { amountInWords } from "./utils/amount-in-words"`
);

// 2. Interface
content = content.replace(
    /interface PurchaseInvoiceTemplateProps {[\s\S]*?}/,
    `interface LocalPurchaseInvoiceProps {
    lot: any
    arrival: any
    organization: any
    arrivalLots?: any[]
    lang: LangCode
    itemTranslations?: Record<string, string>
    partyTranslation?: string | null
    contactLocalName?: string | null
}`
);

// 3. Signature & Setup
content = content.replace(
    /export default function PurchaseBillInvoice\([\s\S]*?\) {/,
    `export default function LocalPurchaseInvoice({
    lot,
    arrival,
    organization,
    arrivalLots = [],
    lang,
    itemTranslations = {},
    partyTranslation = null,
    contactLocalName = null
}: LocalPurchaseInvoiceProps) {
    const T = getTranslation(lang);
    const fontFamily = FONT_FAMILIES[lang];
    const fontUrl = FONT_URLS[lang];
    const dir = TEXT_DIRECTION[lang];`
);

// 4. Farmer and Item extraction
content = content.replace(
    "const farmerName = lot.farmer?.name || lot.contact?.name || 'Unknown Supplier'",
    "const englishFarmerName = lot.farmer?.name || lot.contact?.name || 'Unknown Supplier';\n    const farmerName = getPartyName(englishFarmerName, contactLocalName, partyTranslation);"
);

content = content.replace(
    "const itemName = formatCommodityName(lot.item?.name, lot.custom_attributes || lot.item?.custom_attributes)",
    `const resolveItemName = (l: any) => {
        const rawName = formatCommodityName(l.item?.name || lot.item?.name || 'Item', l.custom_attributes || l.item?.custom_attributes || lot.custom_attributes);
        const translated = itemTranslations[l.item?.name || lot.item?.name || ''] || itemTranslations[rawName];
        return getItemName(rawName, translated, itemTranslations);
    };`
);

// 5. Container & Font Link
content = content.replace(
    '<div id="purchase-invoice-print" className="bg-white text-black p-4 sm:p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-[10mm] relative overflow-hidden print:overflow-visible">',
    `<div id="purchase-invoice-print-local" dir="ltr" style={{ fontFamily }} className="bg-white text-black p-4 sm:p-6 max-w-[800px] mx-auto shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-[10mm] relative overflow-hidden print:overflow-visible">\n\n            {/* Load font */}\n            <link rel="stylesheet" href={fontUrl} />`
);

// 6. Title
content = content.replace(
    '<h2\n                        data-invoice-title\n                        className="text-2xl font-black uppercase tracking-[0.2em] leading-[1.08] text-black"\n                    >\n                        Purchase\n                    </h2>\n                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] leading-[1.08] text-black -mt-1">\n                        Bill\n                    </h2>',
    '<h2 data-invoice-title className="text-2xl md:text-3xl font-black uppercase tracking-[0.28em] leading-[1.08] text-black text-center" style={{ fontFamily }}>\n                        {T.PURCHASE_BILL}\n                    </h2>'
);

// 7. Table Headers
content = content.replace(
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left">Item Details</th>',
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left" style={{ fontFamily }}>{T.ITEM_DETAILS}</th>'
);
content = content.replace(
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center">Quantity</th>',
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center" style={{ fontFamily }}>{T.QTY}</th>'
);
content = content.replace(
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Rate</th>',
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right" style={{ fontFamily }}>{T.RATE}</th>'
);
content = content.replace(
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right">Amount</th>',
    '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right" style={{ fontFamily }}>{T.AMOUNT}</th>'
);

// 8. Item Name
content = content.replace(
    '{formatCommodityName(l.item?.name || lot.item?.name, l.custom_attributes || l.item?.custom_attributes || lot.custom_attributes)}',
    '{resolveItemName(l)}'
);

// 9. Settlement labels
content = content.replace(
    '<span className="font-bold text-slate-500 uppercase">Gross Value</span>',
    '<span className="font-bold text-slate-500 uppercase" style={{ fontFamily }}>{T.GROSS_VALUE}</span>'
);
content = content.replace(
    '<span className="font-bold text-orange-600 uppercase">Less / Cutting</span>',
    '<span className="font-bold text-orange-600 uppercase" style={{ fontFamily }}>{T.LESS_CUTTING}</span>'
);
content = content.replace(
    '<span className="font-black text-slate-800 uppercase tracking-tight">Net Goods Value</span>',
    '<span className="font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily }}>{T.NET_GOODS_VALUE}</span>'
);
content = content.replace(
    '<span className="font-bold text-purple-600 uppercase">\n                                    Commission\n                                </span>',
    '<span className="font-bold text-purple-600 uppercase" style={{ fontFamily }}>{T.COMMISSION}</span>'
);
content = content.replace(
    '<span className="text-emerald-600 font-bold uppercase tracking-widest">Amount Paid</span>',
    '<span className="text-emerald-600 font-bold uppercase tracking-widest" style={{ fontFamily }}>{T.AMOUNT_PAID}</span>'
);
content = content.replace(
    '<span className="text-[11px] font-black uppercase tracking-widest text-slate-600">\n                                Total Payable\n                            </span>',
    '<span className="text-[11px] font-black uppercase tracking-widest text-slate-600" style={{ fontFamily }}>{T.TOTAL_PAYABLE}</span>'
);

// 10. Amount In Words
content = content.replace(
    'toWords(Math.round(finalPayable))',
    'amountInWords(Math.round(finalPayable), lang)'
);

fs.writeFileSync(destFile, content);
console.log('Successfully updated LocalPurchaseInvoice.tsx');
