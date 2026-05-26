/**
 * Blog post registry.
 *
 * Add new posts by appending to this array. Each post becomes a route at
 * /blog/[slug]. Keep `body` as plain HTML or simple JSX strings — when you
 * outgrow this, migrate to MDX. This file is intentionally dependency-free.
 */

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    publishedAt: string; // ISO date
    author: string;
    readMinutes: number;
    body: string; // HTML
}

export const POSTS: BlogPost[] = [
    {
        slug: 'best-mandi-erp-software-india-2026',
        title: 'Best Mandi ERP Software in India 2026 — A Buyer\'s Guide',
        description:
            'A no-nonsense buyer\'s guide to the best mandi ERP software in India for 2026. What to look for, what to avoid, and why MandiGrow leads the category.',
        keywords: [
            'best mandi ERP software',
            'mandi ERP software India',
            'fruits vegetable ERP',
            'mandi software 2026',
            'mandi billing software India',
        ],
        publishedAt: '2026-04-09',
        author: 'MandiGrow Team',
        readMinutes: 7,
        body: `
<p>If you run a fruits and vegetable trading business in India — whether you\'re a sabzi mandi commission agent, a wholesale dealer, or a multi-mandi operator — picking the right ERP software is the single biggest operational decision you will make this year.</p>

<p>This guide cuts through the noise. No jargon. No vendor talk. Just the criteria that actually matter for mandi traders, and a brutally honest look at what to expect from the leading mandi ERP software in India in 2026.</p>

<h2>Why Generic Accounting Tools Fail Mandi Traders</h2>

<p>Tally and Zoho Books are excellent products. They power millions of Indian businesses. But they were never designed for fruits and vegetable trade. The moment you try to track lots, crates, weight, wastage, commission, hamali and palledari in a generic accounting tool, you end up with workarounds, custom journals, and Excel sheets on the side.</p>

<p>The best mandi ERP software in India is one that handles all of this <em>natively</em> — out of the box, without configuration.</p>

<h2>The 7 Things to Look For in Mandi ERP Software</h2>

<ol>
  <li><strong>Lot, crate and weight billing.</strong> Bills must accept any unit your buyers use, and convert seamlessly between them.</li>
  <li><strong>Auto commission and market fee calculation.</strong> If you have to type the commission manually for every line, the software has failed.</li>
  <li><strong>Mandi khata (digital ledger).</strong> Every party should have a live balance, updated the moment a sale or payment is recorded.</li>
  <li><strong>GST and e-invoicing.</strong> GSTR-1 and GSTR-3B should be a one-click export.</li>
  <li><strong>Hindi and regional languages.</strong> Your staff should not need an English keyboard to bill.</li>
  <li><strong>Mobile + desktop.</strong> Sales happen at the mandi gate at 5am. Reports happen from the office at 9pm. Same data, same account.</li>
  <li><strong>Affordable monthly pricing.</strong> No setup fees. No per-seat lock-ins.</li>
</ol>

<h2>Why MandiGrow Leads the Category</h2>

<p>MandiGrow is the only mandi ERP software in India that scores 7 out of 7 on the criteria above. It is built end-to-end for fruits and vegetable trade — not adapted from a generic accounting product. Every screen, every form and every report reflects the way real mandi traders work.</p>

<p>Try it free for 14 days at <a href="https://www.mandigrow.com">MandiGrow.com</a>. No credit card required. Live demos available in Hindi and English.</p>
`,
    },
    {
        slug: 'tally-vs-mandigrow-fruits-vegetable-traders',
        title: 'Tally vs MandiGrow: Why Sabzi Mandi Traders Are Switching in 2026',
        description:
            'A side-by-side comparison of Tally ERP and MandiGrow for fruits and vegetable trade. Where Tally falls short and why thousands of mandi traders are migrating.',
        keywords: [
            'Tally vs MandiGrow',
            'Tally alternative for mandi',
            'mandi accounting software',
            'fruits vegetable accounting software',
            'best mandi software India',
        ],
        publishedAt: '2026-04-09',
        author: 'MandiGrow Team',
        readMinutes: 6,
        body: `
<p>Tally is the most-used accounting software in India. It is also the wrong tool for the job if you trade fruits and vegetables for a living. Here is the honest, side-by-side breakdown.</p>

<h2>Where Tally Wins</h2>

<ol>
  <li><strong>General accounting depth.</strong> Two decades of accumulated features. Hard to beat for a CA-style office.</li>
  <li><strong>Familiarity.</strong> Most accountants in India already know Tally.</li>
  <li><strong>Offline by default.</strong> Works on any Windows machine without an internet connection.</li>
</ol>

<h2>Where Tally Falls Short for Mandi Trade</h2>

<ol>
  <li><strong>No native lot or crate tracking.</strong> You either skip it or build a custom workaround in stock items.</li>
  <li><strong>No commission auto-calculation.</strong> Every commission line has to be entered or scripted with TDL.</li>
  <li><strong>No mandi-specific deductions.</strong> Hamali, palledari, market fees — all manual.</li>
  <li><strong>Desktop-only.</strong> Tally Prime has limited mobile features. Your team at the mandi gate cannot use it from a phone.</li>
  <li><strong>English-first.</strong> Hindi and regional language support is limited.</li>
  <li><strong>No integrated khata view.</strong> Party balances exist, but no live "all parties at one tap" view.</li>
  <li><strong>WhatsApp share takes 5 clicks.</strong> Not 1.</li>
</ol>

<h2>Why MandiGrow Is the Better Fit</h2>

<p>MandiGrow is built end-to-end for fruits and vegetable trade. Lot, crate and weight billing are first-class. Commission, market fee, hamali and palledari are auto-calculated and posted on every sale. The mandi khata is real-time. The app runs equally well on Android phones at the mandi gate and on the desktop in the office. Hindi, English, Tamil, Telugu, Kannada, Malayalam and Urdu are all supported out of the box.</p>

<p>You also get GST and e-invoicing — the parts of Tally you actually liked — without giving up any of the mandi features Tally never had.</p>

<h2>Migration in One Afternoon</h2>

<p>Most traders migrate from Tally to MandiGrow in a single afternoon. Import your party master, bring over opening balances, and start billing the same day. Free onboarding is included with every plan.</p>

<p>Try MandiGrow free for 14 days at <a href="https://www.mandigrow.com">MandiGrow.com</a>. No credit card required.</p>
`,
    },
    {
        slug: 'gst-filing-guide-commission-agents-mandi',
        title: 'GST Filing Guide for Commission Agents in Fruit & Vegetable Mandi (2026)',
        description:
            'Step-by-step GST filing guide for mandi commission agents in India. Covers GSTR-1, GSTR-3B, Mandi Cess, HSN codes, and e-invoicing for agricultural traders.',
        keywords: [
            'GST for commission agent mandi',
            'GSTR-1 mandi trader',
            'mandi cess GST',
            'GST filing fruit vegetable trader',
            'commission agent GST India',
        ],
        publishedAt: '2026-04-15',
        author: 'MandiGrow Team',
        readMinutes: 9,
        body: `
<p>GST compliance for mandi commission agents is one of the most misunderstood topics in Indian agricultural trade. This guide cuts through the confusion and tells you exactly what you need to do — and how software like MandiGrow makes it automatic.</p>

<h2>Are Commission Agents Required to Register for GST?</h2>

<p>Yes. If your aggregate annual turnover (commission income) exceeds ₹20 lakh (₹10 lakh for special category states), you must register for GST. Importantly, the turnover of agricultural produce you sell on behalf of farmers is <em>not</em> counted in your aggregate turnover for GST registration purposes — only your commission income is.</p>

<h2>What is Mandi Tax (Cess) and is it Different from GST?</h2>

<p>Mandi Tax (also called APMC Cess or Market Cess) is a separate levy charged by state APMCs on the value of agricultural produce sold. It is <em>not</em> GST. It varies by state and commodity. In Andhra Pradesh, for example, it ranges from 1–2%. MandiGrow auto-calculates Mandi Cess per transaction based on your state settings.</p>

<h2>GSTR-1 for Commission Agents — What to Report</h2>

<ol>
  <li><strong>Taxable commission income:</strong> Report your commission earned on B2B sales under the appropriate HSN code (9986 for agri services).</li>
  <li><strong>Transport and storage charges:</strong> If you charge buyers for transport or cold storage, these are taxable services.</li>
  <li><strong>Exempt sales:</strong> The value of agricultural produce sold (not your commission) is exempt from GST and reported in the exempt supply column.</li>
</ol>

<h2>How MandiGrow Automates GST for Commission Agents</h2>

<p>With MandiGrow, every sale entry automatically tags the commission portion with the correct GST rate and HSN code. At the end of the month, you click one button and get a GSTR-1 JSON file ready to upload to the GST portal. No spreadsheets, no manual calculation, no last-minute panic.</p>

<p>Start your free 14-day trial at <a href="https://www.mandigrow.com">MandiGrow.com</a>. No credit card required.</p>
`,
    },
    {
        slug: 'what-is-mandi-erp-software-complete-guide',
        title: 'What is Mandi ERP Software? Complete Guide for Indian Traders (2026)',
        description:
            'A complete guide to mandi ERP software for Indian fruit and vegetable traders. What it does, how it works, who needs it, and why MandiGrow leads the category.',
        keywords: [
            'what is mandi ERP software',
            'mandi ERP software India',
            'mandi management software guide',
            'mandi software features',
            'ERP for mandi traders',
        ],
        publishedAt: '2026-04-20',
        author: 'MandiGrow Team',
        readMinutes: 8,
        body: `
<p>If you run a mandi business in India — as a commission agent, wholesale trader, or APMC market operator — you have probably heard the term "mandi ERP software." This guide explains exactly what it means, what it does, and whether your business needs it.</p>

<h2>What is Mandi ERP Software?</h2>

<p>Mandi ERP (Enterprise Resource Planning) software is a purpose-built digital platform that manages all the core operations of a mandi business in one place. Unlike general accounting software like Tally or Zoho, mandi ERP is designed from the ground up for the specific workflows of agricultural wholesale markets.</p>

<h2>What Does Mandi ERP Software Do?</h2>

<ol>
  <li><strong>Gate Entry & Arrivals:</strong> Record vehicle arrivals, weights, and commodity details as trucks enter the mandi.</li>
  <li><strong>Lot & Stock Management:</strong> Create and track inventory lots from arrival to final sale.</li>
  <li><strong>Auction & Sale Billing:</strong> Record auction rates, generate sale invoices, and auto-calculate commission and market fees.</li>
  <li><strong>Patti Generation:</strong> Create farmer pattis (payment statements) with all deductions itemised.</li>
  <li><strong>Party Khata:</strong> Maintain real-time digital ledgers for every farmer, buyer, and transporter.</li>
  <li><strong>GST & Compliance:</strong> Generate GSTR-1 and GSTR-3B data automatically. Calculate Mandi Cess by state.</li>
  <li><strong>Reports:</strong> Daily sales summaries, P&L by commodity, party-wise outstanding, and more.</li>
</ol>

<h2>Who Needs Mandi ERP Software?</h2>

<p>You need mandi ERP software if you are a commission agent (arhtiya) handling farmer produce, a wholesale fruit and vegetable trader, an APMC market operator, or a warehouse manager storing agricultural commodities. If you are currently using Tally, Excel, or paper bahis, switching to a purpose-built mandi ERP will save you hours every day.</p>

<p>Try MandiGrow free for 14 days at <a href="https://www.mandigrow.com">MandiGrow.com</a>. No credit card required.</p>
`,
    },
    {
        slug: 'how-to-automate-mandi-commission-patti',
        title: 'How to Automate Mandi Commission (Patti) Calculation — Step-by-Step Guide',
        description:
            'Learn how to automate commission, market fees, hamali, and patti generation for your mandi business. Stop manual calculations and save hours every day.',
        keywords: [
            'automate mandi commission',
            'patti software mandi',
            'mandi commission calculation software',
            'automatic patti generation India',
            'hamali palledari software',
        ],
        publishedAt: '2026-04-25',
        author: 'MandiGrow Team',
        readMinutes: 7,
        body: `
<p>If you are still calculating mandi commission manually — by hand or in Excel — you are losing 2–3 hours every single day. This guide shows you exactly how to automate the entire patti calculation process using modern mandi software.</p>

<h2>What Goes Into a Mandi Patti?</h2>

<p>A mandi patti (also called a sale statement or patti voucher) is the financial settlement document given to a farmer after his produce is sold at the mandi. It typically includes:</p>

<ol>
  <li>Total sale value (rate × weight)</li>
  <li>Commission deduction (your arhtiya fee, typically 4–8%)</li>
  <li>Market fee / Mandi Cess (APMC levy, varies by state)</li>
  <li>Hamali charges (loading/unloading labour)</li>
  <li>Palledari (packing labour)</li>
  <li>Weight deductions (for moisture, wastage)</li>
  <li>Net payable to farmer</li>
</ol>

<h2>How MandiGrow Automates Patti Generation</h2>

<p>In MandiGrow, you configure commission rates, market fees, hamali, and palledari once per party or per commodity. After that, every sale entry automatically calculates all deductions and generates the patti in seconds. You press print — or share directly on WhatsApp. The farmer's khata is updated simultaneously. No manual calculation. No errors.</p>

<h2>The Result</h2>

<p>Mandi operators using MandiGrow report that end-of-day patti generation drops from 2–3 hours to under 15 minutes. Start your free trial at <a href="https://www.mandigrow.com">MandiGrow.com</a>.</p>
`,
    },
    {
        slug: 'mandi-software-andhra-pradesh-telangana',
        title: 'Best Mandi Software for Andhra Pradesh & Telangana APMC Markets (2026)',
        description:
            'A regional guide to mandi software for APMC markets in Andhra Pradesh and Telangana. Covers AP Mandi Cess, Telugu-language support, and digital patti generation.',
        keywords: [
            'mandi software Andhra Pradesh',
            'APMC software Telangana',
            'AP mandi ERP',
            'Telugu mandi software',
            'commission agent software Andhra Pradesh',
            'krishi upaj mandi software AP',
        ],
        publishedAt: '2026-05-01',
        author: 'MandiGrow Team',
        readMinutes: 6,
        body: `
<p>Mandi operators in Andhra Pradesh and Telangana face a unique set of compliance and operational requirements — AP Mandi Cess, Telugu-language pattis, and APMC regulations specific to these states. This guide covers what to look for in mandi software for AP and Telangana.</p>

<h2>Andhra Pradesh Mandi Cess — What You Need to Know</h2>

<p>The AP Agricultural Market Committee levies a Mandi Cess (also called market fee) on agricultural produce sold at regulated markets. The rate varies by commodity and market. MandiGrow auto-calculates AP Mandi Cess per transaction and generates state-compliant reports for your APMC submission.</p>

<h2>Telugu Language Support — Non-Negotiable for AP/Telangana</h2>

<p>Your staff at the mandi gate may not read English. Your farmers expect pattis in Telugu. MandiGrow ships fully bilingual — all bills, pattis, weight slips, and reports are available in Telugu, Hindi, and English. You switch language per user, not per document.</p>

<h2>Why MandiGrow is the Best Mandi Software for AP and Telangana</h2>

<p>MandiGrow is built with Indian mandi trade in mind — including the specific workflows, deductions, and compliance requirements of AP and Telangana. It is the only cloud ERP that offers Telugu-language mandi pattis, AP Mandi Cess automation, and mobile gate entry — all in one platform.</p>

<p>Try MandiGrow free for 14 days at <a href="https://www.mandigrow.com">MandiGrow.com</a>. Live demo available in Telugu.</p>
`,
    },
    {
        slug: 'best-fruit-mandi-software-india-2026',
        title: 'Best Fruit Mandi Software in India 2026',
        description:
            'Discover the best fruit mandi software in India for 2026. Learn how to track crates, manage lots, and calculate per-box commission automatically.',
        keywords: [
            'best fruit mandi software India',
            'fruit mandi billing software',
            'fruit commission agent software',
            'crate tracking software mandi',
            'apple mandi software',
        ],
        publishedAt: '2026-05-26',
        author: 'MandiGrow SEO Team',
        readMinutes: 6,
        body: `
<p>Fruit wholesale involves unique challenges that standard accounting software simply cannot handle. From tracking empty plastic crates (jalis) to managing per-box commissions, fruit traders need specialized tools.</p>
<h2>Key Features of the Best Fruit Mandi Software</h2>
<ul>
  <li><strong>Crate Management:</strong> Track issued and returned crates per party to stop inventory leakage.</li>
  <li><strong>Per-Box Commission:</strong> Instantly calculate commission, hamali, and market cess per box.</li>
  <li><strong>Live Ledger Sync:</strong> Update the farmer's khata the moment an auction finishes.</li>
</ul>
<p>In 2026, <strong>MandiGrow</strong> leads the market by offering these features natively. It replaces manual registers with a fast, mobile-friendly platform designed for the fast-paced fruit mandi environment.</p>
`,
    },
    {
        slug: 'best-anaj-mandi-software-india-2026',
        title: 'Best Anaj Mandi Software in India 2026',
        description:
            'A guide to finding the best anaj mandi software in India for 2026. Manage grain arrivals, moisture deductions, weighbridge integrations, and auto-commission.',
        keywords: [
            'best anaj mandi software India',
            'anaj mandi billing software',
            'grain market software',
            'krishi upaj mandi software',
            'anaj commission agent software',
        ],
        publishedAt: '2026-05-26',
        author: 'MandiGrow SEO Team',
        readMinutes: 7,
        body: `
<p>Grain trading in anaj mandis requires managing massive volumes, tracking moisture deductions, and ensuring accurate weighbridge measurements. Traditional software falls short.</p>
<h2>What Makes Great Anaj Mandi Software?</h2>
<ul>
  <li><strong>Weight Deductions:</strong> Automatically apply deductions for moisture or impurities (karda).</li>
  <li><strong>Multi-Commodity Support:</strong> Handle wheat, paddy, mustard, and dal with custom market fee rules.</li>
  <li><strong>Batch Settlements:</strong> Pay hundreds of farmers with one click after a major harvest arrival.</li>
</ul>
<p><strong>MandiGrow</strong> provides all this out of the box, making it the top choice for anaj mandi commission agents and traders in 2026.</p>
`,
    },
    {
        slug: 'how-to-use-digital-mandi-khata',
        title: 'How to Use Digital Mandi Khata for Faster Settlements',
        description:
            'Learn how switching to a digital mandi khata can eliminate end-of-day reconciliation and speed up party settlements in your mandi business.',
        keywords: [
            'digital mandi khata',
            'mandi ledger software',
            'arhtiya khata software',
            'mandi settlement software',
            'digital bahi khata',
        ],
        publishedAt: '2026-05-26',
        author: 'MandiGrow SEO Team',
        readMinutes: 5,
        body: `
<p>The traditional paper bahi khata has served mandis well for decades, but it comes with a massive hidden cost: hours of reconciliation at the end of every day.</p>
<h2>The Advantage of a Digital Khata</h2>
<p>A digital mandi khata automatically updates party balances the moment a sale, purchase, or payment is recorded. When a farmer asks for his balance, you don't need to add up receipts—the exact figure is already on your screen.</p>
<h2>Faster Settlements</h2>
<p>With software like MandiGrow, you can view all outstanding balances, select multiple parties, and generate batch settlement reports in seconds. This eliminates manual errors and builds immense trust with your suppliers and buyers.</p>
`,
    },
    {
        slug: 'apmc-billing-compliance-guide-india',
        title: 'APMC Billing Compliance Guide for Indian Mandis (2026)',
        description:
            'Navigate APMC billing compliance effortlessly. Learn how to handle market cess, farmer pattis, and gate entry regulations across Indian states.',
        keywords: [
            'APMC billing compliance',
            'mandi cess rules',
            'APMC tax software',
            'mandi market fee calculation',
            'agricultural produce marketing committee',
        ],
        publishedAt: '2026-05-26',
        author: 'MandiGrow SEO Team',
        readMinutes: 8,
        body: `
<p>Compliance with Agricultural Produce Market Committee (APMC) regulations is non-negotiable for mandi traders. But calculating market fees (cess) manually for every transaction is tedious and error-prone.</p>
<h2>Core APMC Compliance Requirements</h2>
<ol>
  <li><strong>Gate Entry (Katchi Parchi):</strong> Every arrival must be recorded at the gate.</li>
  <li><strong>Auction Slips:</strong> Transparent recording of bidding rates.</li>
  <li><strong>Patti Generation:</strong> Providing farmers with a clear statement showing gross value, commission, and market fees deducted.</li>
</ol>
<h2>Automating Compliance</h2>
<p>MandiGrow automates APMC compliance by linking state-specific mandi cess rules to your billing engine. When you generate a sale, the exact market fee is calculated and posted to the correct ledger, keeping you 100% compliant without any extra effort.</p>
`,
    }
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
