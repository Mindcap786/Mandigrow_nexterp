const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Hero section replacements
content = content.replace("Enterprise-Grade Mandi Software", "{t('landing.hero_badge')}");
content = content.replace("India's Best Mandi ERP Software", "{t('landing.hero_title')}");
content = content.replace("for Fruit, Sabji, Anaj & Commission Agents.", "{t('landing.hero_subtitle')}");
content = content.replace("Sabji lot billing, fruit invoicing, anaj mandi, commission, GST, and live khata — works on Android at the mandi gate and desktop in your office. Hindi, Telugu, Tamil, Kannada, Malayalam & Urdu.", "{t('landing.hero_desc')}");

content = content.replace(">Start Free Trial <", ">{t('landing.start_trial')} <");
content = content.replace("> Contact Us to Onboard<", "> {t('landing.contact_onboard')}<");

content = content.replace("200+ mandis", "{t('landing.trust_mandis')}");
content = content.replace("No credit card", "{t('landing.trust_card')}");
content = content.replace("Free Training", "{t('landing.trust_training')}");
content = content.replace("Setup Cost", "{t('landing.trust_cost')}");

// SEO section replacements
content = content.replace("Complete Mandi Software for Every Market & Trader", "{t('landing.seo_section_title')}");
content = content.replace("From sabzi mandi to anaj mandi — MandiGrow handles billing, khata, GST and settlements.", "{t('landing.seo_section_subtitle')}");

content = content.replace("Sabji Lot Billing in Seconds", "{t('landing.seo_card1_title')}");
content = content.replace("Bill by crate, carton, or kilogram. Auto-calculate totals for any sabji variety at the mandi gate.", "{t('landing.seo_card1_desc')}");

content = content.replace("Fruit Billing Software", "{t('landing.seo_card2_title')}");
content = content.replace("Complete fruit billing software — manage purchase bills, sales invoices, and GST for any fruit variety or lot size. Auto-valuation for perishable inventory.", "{t('landing.seo_card2_desc')}");

content = content.replace("Vegetable Billing Made Fast", "{t('landing.seo_card3_title')}");
content = content.replace("Vegetable billing made fast — scan crates, auto-calculate weights, and print GST-compliant pattis in seconds.", "{t('landing.seo_card3_desc')}");

content = content.replace("Digital Mandi Khata Software", "{t('landing.seo_card4_title')}");
content = content.replace("Replace paper bahis with digital mandi khata software. Every party balance is live, every settlement clean. Track advances, payments, and credits instantly.", "{t('landing.seo_card4_desc')}");

content = content.replace("Anaj Mandi Software", "{t('landing.seo_card5_title')}");
content = content.replace("Also for Anaj Mandi — grain and pulse traders. MandiGrow handles commodity lot tracking, sacks, quintal billing, and trader settlements for wheat, rice, dal, and pulses.", "{t('landing.seo_card5_desc')}");

content = content.replace("Why MandiGrow is the Best Sabzi Mandi Software", "{t('landing.seo_card6_title')}");
content = content.replace("Built for the morning auction and evening settlement — not adapted from a shop billing app. The only cloud mandi software with mobile, Hindi, GST, and khata all in one.", "{t('landing.seo_card6_desc')}");

content = content.replaceAll("Learn more →", "{t('landing.learn_more')}");

content = content.replace("Why MandiGrow is the Complete Mandi ERP System", "{t('landing.why_section_title')}");
content = content.replace("Operating a wholesale commission agency in India's APMC markets requires extreme speed, accuracy, and trust. A generic accounting software cannot handle the unique challenges of a bustling mandi. That is why thousands of Arhtiyas are upgrading to specialized <strong className=\"text-gray-900\">Mandi ERP software</strong>.", "{t('landing.why_section_desc')} <strong className=\"text-gray-900\">Mandi ERP software</strong>.");

content = content.replace("The Complexity of Mandi Billing", "{t('landing.complexity_title')}");
content = content.replace("In a typical morning, a commission agent might auction 50 different lots from 20 different farmers to 30 different buyers. They must calculate:", "{t('landing.complexity_desc')}");
content = content.replace("Variable commission percentages per farmer", "{t('landing.complexity_point1')}");
content = content.replace("Market Cess (Mandi Tax) deductions", "{t('landing.complexity_point2')}");
content = content.replace("Hamali and weighing charges", "{t('landing.complexity_point3')}");
content = content.replace("Advance payments and outstanding Udhar", "{t('landing.complexity_point4')}");

fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log("Patched app/page.tsx");
