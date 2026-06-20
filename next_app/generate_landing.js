const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

const en = {
  "hero_badge": "Enterprise-Grade Mandi Software",
  "hero_title": "India's Best Mandi ERP Software",
  "hero_subtitle": "for Fruit, Sabji, Anaj & Commission Agents.",
  "hero_desc": "Sabji lot billing, fruit invoicing, anaj mandi, commission, GST, and live khata — works on Android at the mandi gate and desktop in your office. Hindi, Telugu, Tamil, Kannada, Malayalam & Urdu.",
  "start_trial": "Start Free Trial",
  "contact_onboard": "Contact Us to Onboard",
  "trust_mandis": "200+ mandis",
  "trust_card": "No credit card",
  "trust_training": "Free Training",
  "trust_cost": "₹0 Setup Cost",
  
  "seo_section_title": "Complete Mandi Software for Every Market & Trader",
  "seo_section_subtitle": "From sabzi mandi to anaj mandi — MandiGrow handles billing, khata, GST and settlements.",
  
  "seo_card1_title": "Sabji Lot Billing in Seconds",
  "seo_card1_desc": "Bill by crate, carton, or kilogram. Auto-calculate totals for any sabji variety at the mandi gate.",
  "seo_card2_title": "Fruit Billing Software",
  "seo_card2_desc": "Complete fruit billing software — manage purchase bills, sales invoices, and GST for any fruit variety or lot size. Auto-valuation for perishable inventory.",
  "seo_card3_title": "Vegetable Billing Made Fast",
  "seo_card3_desc": "Vegetable billing made fast — scan crates, auto-calculate weights, and print GST-compliant pattis in seconds.",
  "seo_card4_title": "Digital Mandi Khata Software",
  "seo_card4_desc": "Replace paper bahis with digital mandi khata software. Every party balance is live, every settlement clean. Track advances, payments, and credits instantly.",
  "seo_card5_title": "Anaj Mandi Software",
  "seo_card5_desc": "Also for Anaj Mandi — grain and pulse traders. MandiGrow handles commodity lot tracking, sacks, quintal billing, and trader settlements for wheat, rice, dal, and pulses.",
  "seo_card6_title": "Why MandiGrow is the Best Sabzi Mandi Software",
  "seo_card6_desc": "Built for the morning auction and evening settlement — not adapted from a shop billing app. The only cloud mandi software with mobile, Hindi, GST, and khata all in one.",
  
  "learn_more": "Learn more →",

  "why_section_title": "Why MandiGrow is the Complete Mandi ERP System",
  "why_section_desc": "Operating a wholesale commission agency in India's APMC markets requires extreme speed, accuracy, and trust. A generic accounting software cannot handle the unique challenges of a bustling mandi. That is why thousands of Arhtiyas are upgrading to specialized Mandi ERP software.",
  
  "complexity_title": "The Complexity of Mandi Billing",
  "complexity_desc": "In a typical morning, a commission agent might auction 50 different lots from 20 different farmers to 30 different buyers. They must calculate:",
  "complexity_point1": "Variable commission percentages per farmer",
  "complexity_point2": "Market Cess (Mandi Tax) deductions",
  "complexity_point3": "Hamali and weighing charges",
  "complexity_point4": "Advance payments and outstanding Udhar",
  
  "designed_footer": "MandiGrow is designed from the ground up as a dedicated commission agent software. When an"
};

const hi = {
  ...en,
  "hero_badge": "एंटरप्राइज़-ग्रेड मंडी सॉफ्टवेयर",
  "hero_title": "भारत का सर्वश्रेष्ठ मंडी ERP सॉफ्टवेयर",
  "hero_subtitle": "फल, सब्जी, अनाज और आढ़तियों (कमीशन एजेंटों) के लिए।",
  "hero_desc": "सब्जी लॉट बिलिंग, फल चालान, अनाज मंडी, कमीशन, जीएसटी, और लाइव खाता - मंडी गेट पर एंड्रॉइड पर और आपके कार्यालय में डेस्कटॉप पर काम करता है।",
  "start_trial": "मुफ़्त ट्रायल शुरू करें",
  "contact_onboard": "ऑनबोर्डिंग के लिए संपर्क करें",
  "trust_mandis": "200+ मंडियां",
  "trust_card": "कोई क्रेडिट कार्ड नहीं",
  "trust_training": "मुफ़्त ट्रेनिंग",
  "trust_cost": "₹0 सेटअप लागत",
  
  "seo_section_title": "हर बाज़ार और व्यापारी के लिए संपूर्ण मंडी सॉफ्टवेयर",
  "seo_section_subtitle": "सब्जी मंडी से लेकर अनाज मंडी तक — MandiGrow बिलिंग, खाता, जीएसटी और सेटलमेंट संभालता है।",
  
  "seo_card1_title": "सब्जी लॉट बिलिंग सेकंडों में",
  "seo_card1_desc": "क्रेट, कार्टन या किलोग्राम के हिसाब से बिल बनाएं। मंडी गेट पर किसी भी सब्जी की वैराइटी के लिए स्वचालित रूप से कुल गणना करें।",
  "seo_card2_title": "फल बिलिंग सॉफ्टवेयर",
  "seo_card2_desc": "संपूर्ण फल बिलिंग सॉफ्टवेयर — किसी भी फल या लॉट आकार के लिए खरीद बिल, बिक्री चालान और जीएसटी का प्रबंधन करें।",
  "seo_card3_title": "सब्जी बिलिंग को तेज बनाया गया",
  "seo_card3_desc": "सब्जी बिलिंग को तेज बनाया गया — क्रेट स्कैन करें, वज़न की स्वचालित गणना करें और सेकंडों में जीएसटी-अनुपालन पट्टी प्रिंट करें।",
  "seo_card4_title": "डिजिटल मंडी खाता सॉफ्टवेयर",
  "seo_card4_desc": "कागज की बही को डिजिटल मंडी खाता सॉफ्टवेयर से बदलें। हर पार्टी का बैलेंस लाइव है। एडवांस और भुगतान तुरंत ट्रैक करें।",
  "seo_card5_title": "अनाज मंडी सॉफ्टवेयर",
  "seo_card5_desc": "अनाज मंडी के लिए भी — अनाज और दाल व्यापारी। MandiGrow गेहूं, चावल, और दालों के लिए कमोडिटी लॉट ट्रैकिंग और बिलिंग संभालता है।",
  "seo_card6_title": "MandiGrow सर्वश्रेष्ठ सब्जी मंडी सॉफ्टवेयर क्यों है",
  "seo_card6_desc": "सुबह की नीलामी और शाम के सेटलमेंट के लिए बनाया गया है। मोबाइल, हिंदी, जीएसटी और खाता के साथ एकमात्र क्लाउड मंडी सॉफ्टवेयर।",
  
  "learn_more": "और जानें →",

  "why_section_title": "MandiGrow संपूर्ण मंडी ERP सिस्टम क्यों है",
  "why_section_desc": "भारत के APMC बाज़ारों में थोक कमीशन एजेंसी चलाने के लिए अत्यधिक गति और सटीकता की आवश्यकता होती है। एक सामान्य अकाउंटिंग सॉफ्टवेयर भीड़भाड़ वाली मंडी की चुनौतियों को नहीं संभाल सकता।",
  
  "complexity_title": "मंडी बिलिंग की जटिलता",
  "complexity_desc": "एक आम सुबह में, एक आढ़तिया 20 किसानों से 30 खरीदारों को 50 अलग-अलग लॉट की नीलामी कर सकता है। उन्हें गणना करनी होती है:",
  "complexity_point1": "प्रति किसान परिवर्तनीय कमीशन प्रतिशत",
  "complexity_point2": "बाज़ार उपकर (मंडी टैक्स) की कटौती",
  "complexity_point3": "हमाली और तौल शुल्क",
  "complexity_point4": "एडवांस भुगतान और बकाया उधार"
};

const mr = {
  ...en,
  "hero_badge": "एंटरप्राइज-ग्रेड मंडी सॉफ्टवेअर",
  "hero_title": "भारतातील सर्वोत्तम मंडी ERP सॉफ्टवेअर",
  "hero_subtitle": "फळे, भाजीपाला, धान्य आणि कमिशन एजंट्ससाठी.",
  "hero_desc": "भाजीपाला लॉट बिलिंग, फळ इन्व्हॉइसिंग, धान्य मंडी, कमिशन, GST आणि लाईव्ह खाते — मंडी गेटवर Android वर आणि ऑफिसमध्ये डेस्कटॉपवर काम करते.",
  "start_trial": "मोफत ट्रायल सुरू करा",
  "contact_onboard": "ऑनबोर्डिंगसाठी संपर्क करा",
  "trust_mandis": "200+ मंडया",
  "trust_card": "क्रेडिट कार्डची गरज नाही",
  "trust_training": "मोफत प्रशिक्षण",
  "trust_cost": "₹0 सेटअप खर्च",
  
  "seo_section_title": "प्रत्येक बाजार आणि व्यापाऱ्यासाठी संपूर्ण मंडी सॉफ्टवेअर",
  "seo_section_subtitle": "भाजी मंडीपासून ते धान्य मंडीपर्यंत — MandiGrow बिलिंग, खाते, GST आणि सेटलमेंट हाताळते.",
  "seo_card1_title": "भाजीपाला लॉट बिलिंग सेकंदात",
  "seo_card2_title": "फळ बिलिंग सॉफ्टवेअर",
  "seo_card3_title": "भाजीपाला बिलिंग जलद",
  "seo_card4_title": "डिजिटल मंडी खाते सॉफ्टवेअर",
  "seo_card5_title": "धान्य मंडी सॉफ्टवेअर",
  "seo_card6_title": "MandiGrow सर्वोत्तम का आहे",
  "learn_more": "अधिक जाणून घ्या →",

  "why_section_title": "MandiGrow संपूर्ण मंडी ERP प्रणाली का आहे",
  "complexity_title": "मंडी बिलिंगची गुंतागुंत",
  "complexity_desc": "एका सामान्य सकाळी, एक कमिशन एजंट 20 शेतकऱ्यांकडून 30 खरेदीदारांना 50 वेगवेगळ्या लॉटचा लिलाव करू शकतो."
};

const gu = {
  ...en,
  "hero_badge": "એન્ટરપ્રાઇઝ-ગ્રેડ મંડી સોફ્ટવેર",
  "hero_title": "ભારતનું સર્વશ્રેષ્ઠ મંડી ERP સોફ્ટવેર",
  "hero_subtitle": "ફળ, શાકભાજી, અનાજ અને કમિશન એજન્ટો માટે.",
  "hero_desc": "શાકભાજી લોટ બિલિંગ, ફળ ઇન્વોઇસિંગ, અનાજ મંડી, કમિશન, GST અને લાઇવ ખાતા - મંડી ગેટ પર એન્ડ્રોઇડ અને ઑફિસમાં ડેસ્કટૉપ પર કામ કરે છે.",
  "start_trial": "મફત ટ્રાયલ શરૂ કરો",
  "contact_onboard": "જોડાવા માટે સંપર્ક કરો",
  "trust_mandis": "200+ મંડીઓ",
  "trust_card": "કોઈ ક્રેડિટ કાર્ડ નહીં",
  "trust_training": "મફત તાલીમ",
  "trust_cost": "₹0 સેટઅપ ખર્ચ",
  "seo_section_title": "દરેક બજાર અને વેપારી માટે સંપૂર્ણ મંડી સોફ્ટવેર",
  "seo_section_subtitle": "શાકભાજી મંડીથી લઈને અનાજ મંડી સુધી - MandiGrow બિલિંગ, ખાતા, GST અને સેટલમેન્ટ સંભાળે છે.",
  "learn_more": "વધુ જાણો →"
};

const te = {
  ...en,
  "hero_badge": "ఎంటర్‌ప్రైజ్-గ్రేడ్ మండి సాఫ్ట్‌వేర్",
  "hero_title": "భారతదేశపు ఉత్తమ మండి ERP సాఫ్ట్‌వేర్",
  "hero_subtitle": "పండ్లు, కూరగాయలు, ధాన్యం & కమీషన్ ఏజెంట్ల కోసం.",
  "hero_desc": "సబ్జీ లాట్ బిల్లింగ్, పండ్ల ఇన్వాయిసింగ్, అనాజ్ మండి, కమీషన్, GST మరియు లైవ్ ఖాతా — మండి గేట్ వద్ద Android లో మరియు మీ కార్యాలయంలో డెస్క్‌టాప్‌లో పనిచేస్తుంది.",
  "start_trial": "ఉచిత ట్రయల్ ప్రారంభించండి",
  "contact_onboard": "ఆన్‌బోర్డ్ చేయడానికి మమ్మల్ని సంప్రదించండి",
  "trust_mandis": "200+ మండీలు",
  "trust_card": "క్రెడిట్ కార్డ్ అవసరం లేదు",
  "trust_training": "ఉచిత శిక్షణ",
  "trust_cost": "₹0 సెటప్ ఖర్చు",
  "seo_section_title": "ప్రతి మార్కెట్ మరియు వ్యాపారి కోసం పూర్తి మండి సాఫ్ట్‌వేర్",
  "seo_section_subtitle": "సబ్జీ మండి నుండి అనాజ్ మండి వరకు — మండిగ్రో బిల్లింగ్, ఖాతా, GST మరియు సెటిల్‌మెంట్లను నిర్వహిస్తుంది.",
  "learn_more": "మరింత తెలుసుకోండి →"
};

const ta = {
  ...en,
  "hero_badge": "எண்டர்பிரைஸ்-கிரேடு மண்டி மென்பொருள்",
  "hero_title": "இந்தியாவின் சிறந்த மண்டி ERP மென்பொருள்",
  "hero_subtitle": "பழங்கள், காய்கறிகள், தானியங்கள் & கமிஷன் ஏஜெண்டுகளுக்கு.",
  "hero_desc": "காய்கறி லாட் பில்லிங், பழ இன்வாய்ஸிங், தானிய மண்டி, கமிஷன், GST மற்றும் லைவ் கணக்கு - மண்டி கேட்டில் ஆண்ட்ராய்டு மற்றும் அலுவலகத்தில் டெஸ்க்டாப்பில் வேலை செய்கிறது.",
  "start_trial": "இலவச சோதனையைத் தொடங்குங்கள்",
  "contact_onboard": "இணைய எங்களை தொடர்பு கொள்ளவும்",
  "trust_mandis": "200+ மண்டிகள்",
  "trust_card": "கிரெடிட் கார்டு தேவையில்லை",
  "trust_training": "இலவச பயிற்சி",
  "trust_cost": "₹0 அமைவு கட்டணம்",
  "seo_section_title": "ஒவ்வொரு சந்தைக்கும் மற்றும் வியாபாரிக்குமான முழுமையான மண்டி மென்பொருள்",
  "seo_section_subtitle": "காய்கறி மண்டி முதல் தானிய மண்டி வரை — பில்லிங், கணக்கு, GST மற்றும் செட்டில்மெண்ட்களை MandiGrow கையாள்கிறது.",
  "learn_more": "மேலும் அறிக →"
};

const kn = { ...en };
const ml = { ...en };
const ur = { ...en };

const translations = { en, hi, mr, gu, te, ta, kn, ml, ur };

for (const [lang, landingData] of Object.entries(translations)) {
  const targetFile = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(targetFile)) {
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    const existingLanding = data.landing || {};
    data.landing = { ...existingLanding, ...landingData };
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated landing for ${lang}`);
  }
}
