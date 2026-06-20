const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const translations = {
  hi: {
    "dashboard": "डैशबोर्ड",
    "purchase": "खरीद",
    "sales": "बिक्री और बिलिंग",
    "inventory": "स्टॉक की स्थिति",
    "payments_receipts": "भुगतान और रसीदें",
    "trading_pl": "व्यापार लाभ/हानि",
    "finance": "वित्त",
    "master_data": "मास्टर डेटा",
    "settings": "सेटिंग्स",
    "logout": "लॉग आउट",
    "language": "भाषा चुनें"
  },
  mr: {
    "dashboard": "डॅशबोर्ड",
    "purchase": "खरेदी",
    "sales": "विक्री आणि बिलिंग",
    "inventory": "स्टॉक स्थिती",
    "payments_receipts": "पेमेंट आणि पावत्या",
    "trading_pl": "ट्रेडिंग नफा/तोटा",
    "finance": "वित्त",
    "master_data": "मास्टर डेटा",
    "settings": "सेटिंग्ज",
    "logout": "लॉग आउट",
    "language": "भाषा निवडा"
  },
  gu: {
    "dashboard": "ડેશબોર્ડ",
    "purchase": "ખરીદી",
    "sales": "વેચાણ અને બિલિંગ",
    "inventory": "સ્ટોકની સ્થિતિ",
    "payments_receipts": "ચુકવણી અને રસીદો",
    "trading_pl": "ટ્રેડિંગ નફો/નુકસાન",
    "finance": "નાણાં",
    "master_data": "માસ્ટર ડેટા",
    "settings": "સેટિંગ્સ",
    "logout": "લૉગઆઉટ",
    "language": "ભાષા પસંદ કરો"
  },
  ta: {
    "dashboard": "முகப்புப் பக்கம்",
    "purchase": "கொள்முதல்",
    "sales": "விற்பனை & பில்லிங்",
    "inventory": "சரக்கு நிலை",
    "payments_receipts": "கொடுப்பனவுகள் & ரசீதுகள்",
    "trading_pl": "வர்த்தக லாபம்/நஷ்டம்",
    "finance": "நிதி",
    "master_data": "முதன்மை தரவு",
    "settings": "அமைப்புகள்",
    "logout": "வெளியேறு",
    "language": "மொழியைத் தேர்ந்தெடு"
  },
  kn: {
    "dashboard": "ಮುಖಪುಟ",
    "purchase": "ಖರೀದಿ",
    "sales": "ಮಾರಾಟ ಮತ್ತು ಬಿಲ್ಲಿಂಗ್",
    "inventory": "ಸ್ಟಾಕ್ ಸ್ಥಿತಿ",
    "payments_receipts": "ಪಾವತಿಗಳು ಮತ್ತು ರಸೀದಿಗಳು",
    "trading_pl": "ವ್ಯಾಪಾರ ಲಾಭ/ನಷ್ಟ",
    "finance": "ಹಣಕಾಸು",
    "master_data": "ಮಾಸ್ಟರ್ ಡೇಟಾ",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "logout": "ಲಾಗ್ ಔಟ್",
    "language": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ"
  },
  ml: {
    "dashboard": "ഡാഷ്‌ബോർഡ്",
    "purchase": "പർച്ചേസ്",
    "sales": "വിൽപ്പന & ബില്ലിംഗ്",
    "inventory": "സ്റ്റോക്ക് നില",
    "payments_receipts": "പേയ്‌മെന്റുകൾ & രസീതുകൾ",
    "trading_pl": "ട്രേഡിംഗ് ലാഭം/നഷ്ടം",
    "finance": "സാമ്പത്തികം",
    "master_data": "മാസ്റ്റർ ഡാറ്റ",
    "settings": "ക്രമീകരണങ്ങൾ",
    "logout": "ലോഗ്ഔട്ട്",
    "language": "ഭാഷ തിരഞ്ഞെടുക്കുക"
  },
  ur: {
    "dashboard": "ڈیش بورڈ",
    "purchase": "خریداری",
    "sales": "فروخت اور بلنگ",
    "inventory": "اسٹاک کی صورتحال",
    "payments_receipts": "ادائیگیاں اور رسیدیں",
    "trading_pl": "تجارتی نفع/نقصان",
    "finance": "مالیات",
    "master_data": "ماسٹر ڈیٹا",
    "settings": "ترتیبات",
    "logout": "لاگ آؤٹ",
    "language": "زبان منتخب کریں"
  },
  en: {
    "dashboard": "Dashboard",
    "purchase": "Purchase",
    "sales": "Sales & Billing",
    "inventory": "Stock Status",
    "payments_receipts": "Payments & Receipts",
    "trading_pl": "Trading P&L",
    "finance": "Finance",
    "master_data": "Master Data",
    "settings": "Settings",
    "logout": "Log Out",
    "language": "Select Language"
  }
};

for (const [lang, navData] of Object.entries(translations)) {
  const targetFile = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(targetFile)) {
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    if (!data.nav) {
      data.nav = {};
    }
    // Merge new nav keys, keeping existing ones if any
    data.nav = { ...data.nav, ...navData };
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated nav for ${lang}`);
  }
}
