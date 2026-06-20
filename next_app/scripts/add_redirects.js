const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../next.config.js');
let content = fs.readFileSync(filePath, 'utf8');

const redirectsBlock = `
    async redirects() {
        return [
            { source: '/blog/apmc-market-fees-levy-guide-2026', destination: '/blog/apmc-billing-compliance-guide-india', permanent: true },
            { source: '/blog/top-5-challenges-fruit-vegetable-wholesale-billing', destination: '/blog/best-fruit-mandi-software-india-2026', permanent: true },
            { source: '/blog/managing-empty-crates-sabzi-mandi', destination: '/blog/crate-management-mandi-software', permanent: true },
            { source: '/blog/manage-mandi-commission-arhtiya-ledger-digitally', destination: '/blog/how-to-use-digital-mandi-khata', permanent: true },
        ];
    },
`;

if (!content.includes('async redirects()')) {
    const insertIndex = content.lastIndexOf('// ── CAPACITOR STATIC EXPORT');
    if (insertIndex !== -1) {
        content = content.slice(0, insertIndex) + redirectsBlock + content.slice(insertIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added redirects to next.config.js');
    } else {
        console.log('Could not find insert index');
    }
} else {
    console.log('Redirects already exist');
}
