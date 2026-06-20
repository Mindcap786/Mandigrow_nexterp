const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const en = {
  "title": "Day Book",
  "subtitle": "Daily Transaction Register (Tally & SAP standard)",
  "verified": "Double-Entry Verified (Tally Standard)",
  "imbalanced": "Audit Alert: Imbalance",
  "engine_version": "Elite Precision Engine v2.0",
  "cash_book": "Cash Book",
  "all_ledger": "All Ledger",
  "pick_date": "Pick a Date",
  "download_pdf": "Download PDF",
  "sales_summary": "Sales Summary",
  "paid_sales": "Cash Sales (Collected)",
  "udhar": "Udhaar (Credit)",
  "purchase_insights": "Purchase Insights",
  "paid_buy": "Paid Purchase",
  "outstanding": "Outstanding (Udhaar)",
  "liquid_assets": "Liquid Assets (Cash/Bank)",
  "inflow": "Inflow",
  "outflow": "Outflow",
  "galla": "Galla: ",
  "bank": "Bank: ",
  "daily_expenses": "Daily Expenses",
  "total_volume_for": "Total volume for",
  "expenses_desc": "Total volume of operational expenses paid out today (Labor, Transport, Petty Cash).",
  "no_transactions": "No transactions for this date",
  "report_title": "Day Book Report",
  "report_footer": "MandiPro ERP - Financial Intelligence",
  "table": {
    "time": "Time",
    "ref": "Reference #",
    "scenario": "Context & Particulars (Party Name)",
    "type": "Type",
    "debit": "Debit ₹",
    "credit": "Credit ₹",
    "debit_sub": "(Goods Sold / Money Paid)",
    "credit_sub": "(Goods Received / Money Collected)",
    "total_volume": "Total volume as of {{date}}"
  },
  "descriptions": {
    "cash_paid_to": "Cash paid to {{name}}",
    "items_received": "Items received from {{name}}",
    "cash_received": "Cash received from {{name}}",
    "items_sold": "Items sold to {{name}}",
    "expense": "Expense: {{desc}}",
    "advance_paid_purchase": "Advance Paid for Purchase {{label}}",
    "advance_paid_from": "Advance paid from {{name}}",
    "advance_paid_to": "Advance paid from {{source}} to {{name}}",
    "no_description": "No description available",
    "unknown": "Unknown",
    "settlement_account": "Settlement Account",
    "direct_buyer": "Direct Buyer",
    "money_received": "Money Received",
    "udhaar_no_payment": "Udhaar (No Payment)",
    "items_sold_label": "Items Sold"
  },
  "scenarios": {
    "purchase_full": "1. Purchase - Full Paid",
    "purchase_udhaar": "2. Purchase - Full Udhaar",
    "purchase_partial": "3. Purchase - Partial Paid",
    "sale_full": "4. Sale - Full Paid",
    "sale_udhaar": "5. Sale - Full Udhaar",
    "sale_partial": "6. Sale - Partial Paid",
    "other": "Other Transactions",
    "receipt": "Collection Receipt",
    "payment": "Payment Made",
    "sale_payment": "Sale Payment",
    "sale_entry": "Sale Entry"
  },
  "debit_symbol": "D",
  "credit_symbol": "C",
  "labels": {
    "received_receipt": "Received Receipt",
    "sale_payment": "Sale Payment",
    "paid_receipt": "Paid Receipt",
    "expense_receipt": "Expense Receipt",
    "purchase_payment": "Purchase Payment",
    "sale": "Sale",
    "purchase": "Purchase",
    "reversed": "REVERSED"
  }
};

const hi = {
  ...en,
  "title": "डे बुक",
  "subtitle": "दैनिक लेनदेन रजिस्टर (टैली और एसएपी मानक)",
  "verified": "डबल-एंट्री सत्यापित (टैली मानक)",
  "imbalanced": "ऑडिट अलर्ट: असंतुलन",
  "engine_version": "एलीट प्रिसिजन इंजन v2.0",
  "cash_book": "नकद बही",
  "all_ledger": "सभी लेज़र",
  "pick_date": "तिथि चुनें",
  "download_pdf": "पीडीएफ डाउनलोड करें",
  "sales_summary": "बिक्री सारांश",
  "paid_sales": "नकद बिक्री (एकत्रित)",
  "udhar": "उधार (क्रेडिट)",
  "purchase_insights": "खरीद जानकारी",
  "paid_buy": "नकद खरीद",
  "outstanding": "बकाया (उधार)",
  "liquid_assets": "तरल संपत्ति (नकद/बैंक)",
  "inflow": "आवक (Inflow)",
  "outflow": "जावक (Outflow)",
  "galla": "गल्ला: ",
  "bank": "बैंक: ",
  "daily_expenses": "दैनिक खर्च",
  "total_volume_for": "कुल मात्रा",
  "expenses_desc": "आज भुगतान किए गए परिचालन खर्चों की कुल मात्रा (श्रम, परिवहन, खुदरा नकद)।",
  "no_transactions": "इस तिथि के लिए कोई लेनदेन नहीं",
  "report_title": "डे बुक रिपोर्ट",
  "table": {
    "time": "समय",
    "ref": "संदर्भ #",
    "scenario": "संदर्भ और विवरण (पार्टी का नाम)",
    "type": "प्रकार",
    "debit": "डेबिट ₹",
    "credit": "क्रेडिट ₹",
    "debit_sub": "(बेचा गया माल / भुगतान किया गया पैसा)",
    "credit_sub": "(प्राप्त माल / एकत्रित धन)",
    "total_volume": "{{date}} के अनुसार कुल मात्रा"
  }
};

const mr = {
  ...en,
  "title": "डे बुक",
  "subtitle": "दैनिक व्यवहार नोंदवही (Tally आणि SAP मानक)",
  "verified": "डबल-एंट्री सत्यापित (Tally मानक)",
  "imbalanced": "ऑडिट अलर्ट: असमतोल",
  "cash_book": "कॅश बुक",
  "all_ledger": "सर्व लेजर",
  "pick_date": "तारीख निवडा",
  "download_pdf": "पीडीएफ डाउनलोड करा",
  "sales_summary": "विक्री सारांश",
  "paid_sales": "रोख विक्री",
  "udhar": "उधार (क्रेडिट)",
  "purchase_insights": "खरेदी माहिती",
  "paid_buy": "रोख खरेदी",
  "outstanding": "थकबाकी (उधार)",
  "liquid_assets": "रोख मालमत्ता (कॅश/बँक)",
  "inflow": "इनफ्लो",
  "outflow": "आऊटफ्लो",
  "daily_expenses": "दैनंदिन खर्च",
  "table": {
    "time": "वेळ",
    "ref": "संदर्भ #",
    "scenario": "तपशील (पार्टीचे नाव)",
    "type": "प्रकार",
    "debit": "नावे ₹",
    "credit": "जमा ₹",
    "debit_sub": "(माल विकला / पैसे दिले)",
    "credit_sub": "(माल मिळाला / पैसे घेतले)",
    "total_volume": "{{date}} नुसार एकूण रक्कम"
  }
};

const gu = {
  ...en,
  "title": "ડે બુક",
  "subtitle": "દૈનિક વ્યવહાર રજિસ્ટર (Tally અને SAP સ્ટાન્ડર્ડ)",
  "verified": "ડબલ-એન્ટ્રી ચકાસાયેલ",
  "cash_book": "કેશ બુક",
  "all_ledger": "તમામ લેજર",
  "pick_date": "તારીખ પસંદ કરો",
  "sales_summary": "વેચાણ સારાંશ",
  "paid_sales": "રોકડ વેચાણ",
  "udhar": "ઉધાર",
  "purchase_insights": "ખરીદી માહિતી",
  "paid_buy": "રોકડ ખરીદી",
  "outstanding": "બાકી (ઉધાર)",
  "liquid_assets": "પ્રવાહી સંપત્તિ",
  "inflow": "આવક",
  "outflow": "જાવક",
  "daily_expenses": "દૈનિક ખર્ચ"
};

const ta = {
  ...en,
  "title": "டே புக்",
  "subtitle": "தினசரி பரிவர்த்தனை பதிவேடு (டேலி & SAP தரநிலை)",
  "verified": "சரிபார்க்கப்பட்டது (டேலி தரநிலை)",
  "cash_book": "ரொக்கப் புத்தகம்",
  "all_ledger": "அனைத்து பேரேடு",
  "pick_date": "தேதியைத் தேர்வுசெய்க",
  "sales_summary": "விற்பனை சுருக்கம்",
  "paid_sales": "ரொக்க விற்பனை",
  "udhar": "கடன் விற்பனை",
  "purchase_insights": "கொள்முதல் தரவு",
  "paid_buy": "ரொக்க கொள்முதல்",
  "outstanding": "கடன் கொள்முதல்",
  "liquid_assets": "ரொக்கம் / வங்கி நிலை",
  "inflow": "வரவு",
  "outflow": "செலவு",
  "daily_expenses": "தினசரி செலவுகள்",
  "table": {
    "time": "நேரம்",
    "ref": "குறிப்பு #",
    "scenario": "விவரங்கள் (நபர் பெயர்)",
    "type": "வகை",
    "debit": "பற்று ₹",
    "credit": "வரவு ₹",
    "debit_sub": "(பொருட்கள் விற்கப்பட்டன / பணம் செலுத்தப்பட்டது)",
    "credit_sub": "(பொருட்கள் பெறப்பட்டன / பணம் வசூலிக்கப்பட்டது)",
    "total_volume": "{{date}} நிலவரப்படி மொத்தத் தொகை"
  }
};

const kn = {
  ...en,
  "title": "ಡೇ ಬುಕ್",
  "subtitle": "ದೈನಂದಿನ ವಹಿವಾಟು ರಿಜಿಸ್ಟರ್",
  "cash_book": "ನಗದು ಪುಸ್ತಕ",
  "all_ledger": "ಎಲ್ಲಾ ಲೆಡ್ಜರ್",
  "sales_summary": "ಮಾರಾಟದ ಸಾರಾಂಶ",
  "paid_sales": "ನಗದು ಮಾರಾಟ",
  "udhar": "ಉದ್ರಿ (ಕ್ರೆಡಿಟ್)",
  "purchase_insights": "ಖರೀದಿ ಮಾಹಿತಿ",
  "paid_buy": "ನಗದು ಖರೀದಿ",
  "outstanding": "ಬಾಕಿ",
  "liquid_assets": "ನಗದು/ಬ್ಯಾಂಕ್",
  "inflow": "ಒಳಹರಿವು",
  "outflow": "ಹೊರಹರಿವು",
  "daily_expenses": "ದೈನಂದಿನ ವೆಚ್ಚಗಳು"
};

const ml = {
  ...en,
  "title": "ഡേ ബുക്ക്",
  "subtitle": "പ്രതിദിന ഇടപാട് രജിസ്റ്റർ",
  "cash_book": "ക്യാഷ് ബുക്ക്",
  "all_ledger": "എല്ലാ ലെഡ്ജറും",
  "sales_summary": "വിൽപ്പന സംഗ്രഹം",
  "paid_sales": "ക്യാഷ് സെയിൽസ്",
  "udhar": "ക്രെഡിറ്റ്",
  "purchase_insights": "പർച്ചേസ് സംഗ്രഹം",
  "paid_buy": "ക്യാഷ് പർച്ചേസ്",
  "outstanding": "കുടിശ്ശിക",
  "liquid_assets": "ക്യാഷ്/ബാങ്ക്",
  "inflow": "വരവ്",
  "outflow": "ചെലവ്",
  "daily_expenses": "പ്രതിദിന ചെലവുകൾ"
};

const ur = {
  ...en,
  "title": "ڈے بک",
  "subtitle": "یومیہ لین دین کا رجسٹر",
  "cash_book": "کیش بک",
  "all_ledger": "تمام لیجر",
  "sales_summary": "فروخت کا خلاصہ",
  "paid_sales": "نقد فروخت",
  "udhar": "ادھار",
  "purchase_insights": "خریداری کی تفصیلات",
  "paid_buy": "نقد خریداری",
  "outstanding": "بقایا",
  "liquid_assets": "نقد/بینک",
  "inflow": "آمدن",
  "outflow": "اخراجات",
  "daily_expenses": "روزمرہ کے اخراجات"
};

const translations = { en, hi, mr, gu, ta, kn, ml, ur };

for (const [lang, daybookData] of Object.entries(translations)) {
  const targetFile = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(targetFile)) {
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    // Do a deep merge for daybook to ensure sub-objects like table, descriptions, scenarios are kept intact where possible
    const existingDaybook = data.daybook || {};
    data.daybook = {
      ...existingDaybook,
      ...daybookData,
      table: { ...(existingDaybook.table || {}), ...(daybookData.table || {}) },
      descriptions: { ...(existingDaybook.descriptions || {}), ...(daybookData.descriptions || {}) },
      scenarios: { ...(existingDaybook.scenarios || {}), ...(daybookData.scenarios || {}) },
      labels: { ...(existingDaybook.labels || {}), ...(daybookData.labels || {}) }
    };
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated daybook for ${lang}`);
  }
}
