const fs = require('fs');
const path = require('path');

const localesDir = path.join('/Users/shauddin/frappe-bench/mandigrow-production-repo/next_app/public/locales');
const languages = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'ur'];

for (const lang of languages) {
  const filePath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(filePath)) {
    let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!content.landing) content.landing = {};

    const keysToMove = Object.keys(content).filter(k => k.startsWith('landing.'));
    
    for (const key of keysToMove) {
      const nestedKey = key.replace('landing.', '');
      content.landing[nestedKey] = content[key];
      delete content[key];
    }

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`Fixed ${lang}/common.json`);
  }
}
