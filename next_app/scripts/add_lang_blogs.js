const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/blog/posts.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newPosts = `
    {
        slug: 'mandi-software-telugu-billing',
        title: 'Mandi Software with Telugu Billing: Automate Your APMC Business in Andhra & Telangana',
        description: 'Discover the best Mandi ERP software that automatically prints Purchase Bills and Pattis in Telugu. Type Apple in English, print యాపిల్ (Yapil) instantly.',
        keywords: ['mandi software telugu', 'apmc software andhra pradesh', 'commission agent software telangana', 'telugu billing software', 'mandi erp telugu'],
        publishedAt: '2026-06-21',
        author: 'MandiGrow Team',
        readMinutes: 3,
        body: \`
<p>For commission agents operating in Andhra Pradesh and Telangana, providing clear, native-language Pattis to farmers is crucial. Most software forces you to use English, leading to confusion and disputes.</p>
<h2>Type in English, Print in Telugu</h2>
<p>MandiGrow changes the game. Our advanced thermal printing engine automatically translates your inventory. If you enter "Apple" in the system, it instantly translates and prints <strong>"యాపిల్"</strong> (Yapil) on the farmer's thermal receipt. No more manual typing in regional keyboards!</p>
<p>Experience zero-latency ESC/POS Bluetooth thermal printing engineered specifically for Telugu-speaking mandis.</p>
        \`
    },
    {
        slug: 'mandi-software-hindi-billing',
        title: 'Best Mandi Software with Hindi Billing & Thermal Printing',
        description: 'Upgrade your Sabzi Mandi business with MandiGrow. The only ERP that prints instant Hindi bills and Pattis. Type Apple, print सेब (Seb).',
        keywords: ['mandi software hindi', 'sabzi mandi software hindi', 'hindi billing software for commission agent', 'apmc erp hindi', 'anaj mandi software hindi'],
        publishedAt: '2026-06-21',
        author: 'MandiGrow Team',
        readMinutes: 3,
        body: \`
<p>Operating an Anaj or Sabzi Mandi across North India requires seamless Hindi communication with farmers. A4 PDF invoices are clunky and slow.</p>
<h2>Instant Translation to Hindi (सेब)</h2>
<p>With MandiGrow, you can manage your entire inventory in English while your farmers get their Pattis in Hindi. Type "Apple" during your 4 AM rush, and MandiGrow automatically translates and prints <strong>"सेब"</strong> (Seb) on a 3-inch thermal printer. It calculates Hamali, Tulai, and Commission instantly.</p>
<p>Build trust with your farmers by speaking their language on every receipt.</p>
        \`
    },
    {
        slug: 'mandi-software-tamil-billing',
        title: 'Tamil Mandi Software: Real-Time APMC Billing & Farmer Khata',
        description: 'The ultimate Mandi ERP for Tamil Nadu. Automatically print Pattis and invoices in Tamil. Type Apple, print ஆப்பிள் seamlessly on thermal printers.',
        keywords: ['mandi software tamil', 'apmc software tamil nadu', 'tamil billing software for mandi', 'commission agent software tamil'],
        publishedAt: '2026-06-21',
        author: 'MandiGrow Team',
        readMinutes: 3,
        body: \`
<p>For commission agents in Tamil Nadu, clarity is everything. Providing a farmer with an English ledger creates an unnecessary language barrier.</p>
<h2>Flawless Tamil Printing</h2>
<p>MandiGrow solves this by offering native Tamil thermal printing. Enter "Apple" into the POS, and the system automatically outputs <strong>"ஆப்பிள்"</strong> on the Patti. You don't need a special Tamil keyboard or clunky translation tools. It happens instantly, offline, and right at the Mandi gate.</p>
        \`
    },
    {
        slug: 'mandi-software-malayalam-billing',
        title: 'Malayalam Mandi Software: Transform Your Kerala Wholesale Business',
        description: 'Manage your Kerala wholesale and Mandi business with native Malayalam billing software. Type Apple in English, print ആപ്പിൾ instantly.',
        keywords: ['mandi software malayalam', 'wholesale billing software kerala', 'apmc software malayalam', 'malayalam invoice software'],
        publishedAt: '2026-06-21',
        author: 'MandiGrow Team',
        readMinutes: 3,
        body: \`
<p>Kerala's wholesale and agricultural markets require fast, transparent billing. MandiGrow introduces the first zero-latency Malayalam thermal billing system.</p>
<h2>Seamless Malayalam Integration</h2>
<p>You and your staff can continue operating the software in English for ease of use. But when you hit print, "Apple" automatically translates to <strong>"ആപ്പിൾ"</strong>. Your farmers receive a perfectly calculated, localized Patti that builds instant trust.</p>
        \`
    },
    {
        slug: 'mandi-software-gujarati-billing',
        title: 'Gujarati Mandi Software: Smart APMC Billing & Accounts',
        description: 'Run your APMC business in Gujarat with MandiGrow. Featuring automatic Gujarati thermal printing. Type Apple, print સફરજન (Safarjan).',
        keywords: ['mandi software gujarati', 'apmc software gujarat', 'gujarati billing software', 'mandi accounting gujarati'],
        publishedAt: '2026-06-21',
        author: 'MandiGrow Team',
        readMinutes: 3,
        body: \`
<p>Streamline your Mandi operations in Gujarat with the industry's most advanced vernacular ERP. Stop wasting time with manual Gujarati typing.</p>
<h2>Auto-Translate to Gujarati</h2>
<p>With MandiGrow, simply type "Apple" and let the system print <strong>"સફરજન"</strong> (Safarjan) on the farmer's thermal receipt. All commissions, labor charges, and market fees are automatically calculated and printed in crystal-clear Gujarati.</p>
        \`
    },
`;

const insertIndex = content.indexOf('export const POSTS: BlogPost[] = [') + 'export const POSTS: BlogPost[] = ['.length;
content = content.slice(0, insertIndex) + newPosts + content.slice(insertIndex);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added language blogs');
