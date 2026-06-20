const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'public', 'locales');

const enKeys = {
  why_title: "Why MandiGrow is the Complete Mandi ERP System",
  why_box_title: "The Complexity of Mandi Billing"
};

const hiKeys = {
  why_title: "मंडीग्रो संपूर्ण मंडी ईआरपी सिस्टम क्यों है",
  why_box_title: "मंडी बिलिंग की जटिलता"
};

const teKeys = {
  why_title: "మండిగ్రో పూర్తి మండి ERP సిస్టమ్ ఎందుకు",
  why_box_title: "మండి బిల్లింగ్ యొక్క సంక్లిష్టత"
};

const knKeys = {
  why_title: "ಮಂಡಿಗ್ರೋ ಏಕೆ ಸಂಪೂರ್ಣ ಮಂಡಿ ಇಆರ್ಪಿ ಸಿಸ್ಟಮ್ ಆಗಿದೆ",
  why_box_title: "ಮಂಡಿ ಬಿಲ್ಲಿಂಗ್‌ನ ಸಂಕೀರ್ಣತೆ"
};

const mlKeys = {
  why_title: "എന്തുകൊണ്ട് മണ്ടിഗ്രോ മികച്ച മണ്ടി ERP സിസ്റ്റം ആകുന്നു",
  why_box_title: "മണ്ടി ബില്ലിംഗിന്റെ സങ്കീർണ്ണത"
};

const urKeys = {
  why_title: "منڈی گرو مکمل منڈی ERP سسٹم کیوں ہے",
  why_box_title: "منڈی بلنگ کی پیچیدگی"
};

const taKeys = {
  why_title: "மண்டிக்குரோ ஏன் முழுமையான மண்டி ஈஆர்பி அமைப்பு",
  why_box_title: "மண்டி பில்லிங்கின் சிக்கலான தன்மை"
};

const mrKeys = {
  why_title: "मंडीग्रो पूर्ण मंडी ईआरपी प्रणाली का आहे",
  why_box_title: "मंडी बिलिंगची गुंतागुंत"
};

const guKeys = {
  why_title: "મંડીગ્રો શા માટે સંપૂર્ણ મંડી ERP સિસ્ટમ છે",
  why_box_title: "મંડી બિલિંગની જટિલતા"
};

const translations = { 
  en: enKeys, hi: hiKeys, te: teKeys, kn: knKeys, ml: mlKeys, ur: urKeys, ta: taKeys, mr: mrKeys, gu: guKeys 
};

for (const [lang, newKeys] of Object.entries(translations)) {
  const targetFile = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(targetFile)) {
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    data.landing = { ...data.landing, ...newKeys };
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
    console.log(`Patched SEO translations for ${lang}`);
  }
}
