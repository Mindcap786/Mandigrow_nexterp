const fs = require('fs');

const srcFile = 'components/purchase/purchase-invoice-template.tsx';
const destFile = 'components/local-invoices/LocalPurchaseInvoice.tsx';

let content = fs.readFileSync(srcFile, 'utf8');

// Replace imports
content = content.replace(
    'import { toWords } from "@/lib/number-to-words"',
    `import type { LangCode } from "./utils/fonts"
import { FONT_FAMILIES, FONT_URLS, TEXT_DIRECTION } from "./utils/fonts"
import { getTranslation, getPartyName, getItemName } from "./translations"
import { amountInWords } from "./utils/amount-in-words"`
);

// Update Props
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

// Update function signature
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

// Party Name resolution
content = content.replace(
    "const farmerName = lot.farmer?.name || lot.contact?.name || 'Unknown Supplier'",
    "const englishFarmerName = lot.farmer?.name || lot.contact?.name || 'Unknown Supplier';\n    const farmerName = getPartyName(englishFarmerName, contactLocalName, partyTranslation);"
);

// Item Name resolution helper
content = content.replace(
    "const itemName = formatCommodityName(lot.item?.name, lot.custom_attributes || lot.item?.custom_attributes)",
    `const resolveItemName = (l: any) => {
        const rawName = formatCommodityName(l.item?.name || lot.item?.name || 'Item', l.custom_attributes || l.item?.custom_attributes || lot.custom_attributes);
        const translated = itemTranslations[l.item?.name || lot.item?.name || ''] || itemTranslations[rawName];
        return getItemName(rawName, translated, itemTranslations);
    };`
);

// Replace hardcoded labels with T()
const replacements = [
    // Header
    ['<h2\\n*\\s*data-invoice-title\\n*\\s*className="text-2xl font-black uppercase tracking-\\[0.2em\\] leading-\\[1.08\\] text-black"\\n*\\s*>\\n*\\s*Purchase\\n*\\s*</h2>\\n*\\s*<h2 className="text-2xl font-black uppercase tracking-\\[0.2em\\] leading-\\[1.08\\] text-black -mt-1">\\n*\\s*Bill\\n*\\s*</h2>',
     '<h2 data-invoice-title className="text-2xl md:text-3xl font-black uppercase tracking-[0.28em] leading-[1.08] text-black text-center" style={{ fontFamily }}>\n{T("PURCHASE_BILL")}\n</h2>'],
     
    ['<p className="text-\\[10px\\] font-black uppercase text-gray-400 tracking-\\[0.2em\\]">Purchased From</p>',
     '<p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Purchased From</p>'],
     
    // Table Headers
    ['<th className="py-2 text-\\[10px\\] font-black uppercase tracking-\\[0.2em\\] text-black text-left">Item Details</th>',
     '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-left" style={{ fontFamily }}>{T("ITEM_DETAILS")}</th>'],
    ['<th className="py-2 text-\\[10px\\] font-black uppercase tracking-\\[0.2em\\] text-black text-center">Quantity</th>',
     '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-center" style={{ fontFamily }}>{T("QTY")}</th>'],
    ['<th className="py-2 text-\\[10px\\] font-black uppercase tracking-\\[0.2em\\] text-black text-right">Rate</th>',
     '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right" style={{ fontFamily }}>{T("RATE")}</th>'],
    ['<th className="py-2 text-\\[10px\\] font-black uppercase tracking-\\[0.2em\\] text-black text-right">Amount</th>',
     '<th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black text-right" style={{ fontFamily }}>{T("AMOUNT")}</th>'],

    // Table item name loop
    ['{formatCommodityName\\(l.item\\?\\.name \\|\\| lot.item\\?\\.name, l.custom_attributes \\|\\| l.item\\?\\.custom_attributes \\|\\| lot.custom_attributes\\)}',
     '{resolveItemName(l)}'],
     
    // Settlement Area
    ['<span className="font-bold text-slate-500 uppercase">Gross Value</span>',
     '<span className="font-bold text-slate-500 uppercase" style={{ fontFamily }}>{T("GROSS_VALUE")}</span>'],
    ['<span className="font-bold text-orange-600 uppercase">Less / Cutting</span>',
     '<span className="font-bold text-orange-600 uppercase" style={{ fontFamily }}>{T("LESS_CUTTING")}</span>'],
    ['<span className="font-black text-slate-800 uppercase tracking-tight">Net Goods Value</span>',
     '<span className="font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily }}>{T("NET_GOODS_VALUE")}</span>'],
    ['<span className="font-bold text-purple-600 uppercase">\\n*\\s*Commission\\n*\\s*</span>',
     '<span className="font-bold text-purple-600 uppercase" style={{ fontFamily }}>{T("COMMISSION")}</span>'],
    ['<span className="text-emerald-600 font-bold uppercase tracking-widest">Amount Paid</span>',
     '<span className="text-emerald-600 font-bold uppercase tracking-widest" style={{ fontFamily }}>{T("AMOUNT_PAID")}</span>'],
    ['<span className="text-\\[11px\\] font-black uppercase tracking-widest text-slate-600">\\n*\\s*Total Payable\\n*\\s*</span>',
     '<span className="text-[11px] font-black uppercase tracking-widest text-slate-600" style={{ fontFamily }}>{T("TOTAL_PAYABLE")}</span>'],

    // In Words
    ['toWords\\(Math.round\\(finalPayable\\)\\)',
     'amountInWords(Math.round(finalPayable), lang)'],

    // Add fontUrl link
    ['<div\\n*\\s*id="purchase-invoice-print"',
     '<div\\n      id="purchase-invoice-print-local"\\n      dir="ltr"\\n      style={{ fontFamily }}\\n'],
    ['<DocumentWatermark',
     '<link rel="stylesheet" href={fontUrl} />\\n\\n      <DocumentWatermark']
];

replacements.forEach(([searchRegex, replacement]) => {
    content = content.replace(new RegExp(searchRegex), replacement);
});

fs.writeFileSync(destFile, content);
console.log('Created LocalPurchaseInvoice.tsx');
