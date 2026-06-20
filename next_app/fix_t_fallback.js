const fs = require('fs');
const files = [
  'app/(main)/dashboard/page.tsx',
  'app/(main)/purchase/bills/page.tsx',
  'components/mandi-commission/mandi-commission-form.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Handle both single and double quotes for the fallback string
  // and handle t("key") or t('key')
  // Pattern: t('key') || 'default' or t('key') || "default"
  content = content.replace(/t\((['"])(.*?)\1\)\s*\|\|\s*(['"])(.*?)\3/g, 't($1$2$1, $3$4$3)');
  // Handle: (t('key') || 'default') => t('key', 'default') inside ternary operators
  // wait, the regex above handles `t('key') || 'default'` by matching the t(...) call directly.
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed fallbacks');
