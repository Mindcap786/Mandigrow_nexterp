const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

// English fallbacks that need to be pushed to regional languages
const auth_en = {
  "hero_title": "Mandi ERP Software for <g>Commission Agents & Fruit-Vegetable Traders</g> in India",
  "hero_description": "The Global OS for Modern Mandis. MandiGrow is India's #1 cloud Mandi ERP software. GST billing, auction management, farmer payments & multi-warehouse inventory. Start free.",
  "security_certified": "Bank-Grade Security • SOC-2 Type II Certified",
  "enterprise_live": "MandiGrow OS Live",
  "login_welcome": "Welcome Back",
  "login_subtitle": "Enter your credentials to access your portal.",
  "sign_in_tab": "SIGN IN",
  "create_account_tab": "CREATE ACCOUNT",
  "email_username": "EMAIL / USERNAME",
  "password": "PASSWORD",
  "forgot_password": "Forgot password?",
  "sign_in_btn": "SIGN IN",
  "sign_up_btn": "CREATE ACCOUNT",
  "authenticating": "Authenticating...",
  "need_account": "Need an account? Sign up today.",
  "have_account": "Already have an account? Sign in."
};

const settings_en = {
  "team_access": "ACCESS TEAM",
  "team_subtitle": "Manage logins and permissions for your employees",
  "authorize_employee": "AUTHORIZE EMPLOYEE",
  "inactive_system": "INACTIVE IN SYSTEM",
  "authorized_team": "AUTHORIZED TEAM",
  "no_staff_found": "No Staff Found",
  "add_employees_before": "ADD EMPLOYEES BEFORE GRANTING ACCESS",
  "to_authorize_text": "To authorize employees, first add them under Master Data → Staff / Contacts with contact type set to Staff.",
  "subscription_billing": "SUBSCRIPTION & BILLING",
  "manage_plan": "MANAGE YOUR MANDIGROW PLAN",
  "active_seats": "ACTIVE SEATS",
  "grace_ends": "GRACE PERIOD ENDS"
};

const auth_hi = {
  ...auth_en,
  "hero_title": "भारत में <g>आढ़तियों और फल-सब्जी व्यापारियों</g> के लिए मंडी ERP सॉफ्टवेयर",
  "hero_description": "आधुनिक मंडियों के लिए ग्लोबल OS। MandiGrow भारत का #1 क्लाउड मंडी ERP है। मुफ्त शुरू करें।",
  "login_welcome": "वापसी पर स्वागत है",
  "login_subtitle": "पोर्टल एक्सेस करने के लिए क्रेडेंशियल दर्ज करें।",
  "sign_in_tab": "साइन इन करें",
  "create_account_tab": "खाता बनाएं",
  "email_username": "ईमेल / यूज़रनेम",
  "password": "पासवर्ड",
  "forgot_password": "पासवर्ड भूल गए?",
  "sign_in_btn": "साइन इन",
  "sign_up_btn": "खाता बनाएं",
  "need_account": "खाता चाहिए? आज ही साइन अप करें।",
  "have_account": "पहले से खाता है? साइन इन करें।"
};

const auth_ur = {
  ...auth_en,
  "hero_title": "ہندوستان میں <g>آڑھتیوں اور پھل-سبزی تاجروں</g> کے لیے منڈی ERP سافٹ ویئر",
  "hero_description": "جدید منڈیوں کے لیے گلوبل OS۔ ہندوستان کا #1 کلاؤڈ منڈی ERP سافٹ ویئر۔",
  "login_welcome": "خوش آمدید",
  "login_subtitle": "اپنے پورٹل تک رسائی کے لیے تفصیلات درج کریں۔",
  "sign_in_tab": "سائن ان",
  "create_account_tab": "اکاؤنٹ بنائیں",
  "email_username": "ای میل / یوزر نیم",
  "password": "پاس ورڈ",
  "forgot_password": "پاس ورڈ بھول گئے؟",
  "sign_in_btn": "سائن ان",
  "sign_up_btn": "اکاؤنٹ بنائیں",
  "need_account": "اکاؤنٹ چاہیے؟ آج ہی سائن اپ کریں۔",
  "have_account": "پہلے سے اکاؤنٹ ہے؟ سائن ان کریں۔"
};

const settings_hi = {
  ...settings_en,
  "team_access": "एक्सेस टीम",
  "team_subtitle": "अपने कर्मचारियों के लिए लॉगिन और अनुमति प्रबंधित करें",
  "authorize_employee": "कर्मचारी को अधिकृत करें",
  "inactive_system": "सिस्टम में निष्क्रिय",
  "authorized_team": "अधिकृत टीम",
  "no_staff_found": "कोई कर्मचारी नहीं मिला",
  "add_employees_before": "एक्सेस देने से पहले कर्मचारियों को जोड़ें",
  "subscription_billing": "सदस्यता और बिलिंग",
  "manage_plan": "अपना MandiGrow प्लान प्रबंधित करें"
};

const settings_ur = {
  ...settings_en,
  "team_access": "رسائی ٹیم",
  "team_subtitle": "اپنے ملازمین کے لیے لاگ ان اور اجازتوں کا نظم کریں",
  "authorize_employee": "ملازم کو مجاز کریں",
  "inactive_system": "سسٹم میں غیر فعال",
  "authorized_team": "مجاز ٹیم",
  "no_staff_found": "کوئی عملہ نہیں ملا",
  "add_employees_before": "رسائی دینے سے پہلے ملازمین شامل کریں",
  "subscription_billing": "سبسکرپشن اور بلنگ",
  "manage_plan": "اپنے پلان کا نظم کریں"
};

// Merge mappings for simplicity
const data_map = {
  en: { auth: auth_en, settings: settings_en },
  hi: { auth: auth_hi, settings: settings_hi },
  ur: { auth: auth_ur, settings: settings_ur },
  mr: { auth: { ...auth_en, "login_welcome": "पुन्हा स्वागत आहे" }, settings: settings_en },
  gu: { auth: { ...auth_en, "login_welcome": "ફરીથી સ્વાગત છે" }, settings: settings_en },
  te: { settings: settings_en }, // Auth is already present for Telugu
  ta: { auth: { ...auth_en, "login_welcome": "மீண்டும் வருக" }, settings: settings_en },
  kn: { auth: { ...auth_en, "login_welcome": "ಮತ್ತೆ ಸ್ವಾಗತ" }, settings: settings_en },
  ml: { auth: { ...auth_en, "login_welcome": "സ്വാഗതം" }, settings: settings_en }
};

for (const [lang, blocks] of Object.entries(data_map)) {
  const targetFile = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(targetFile)) {
    const data = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    if (blocks.auth && !data.auth) {
      data.auth = blocks.auth;
    } else if (blocks.auth && data.auth) {
      data.auth = { ...blocks.auth, ...data.auth }; // Keep existing Telugu translation
    }
    data.settings_module = blocks.settings;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} auth/settings`);
  }
}
