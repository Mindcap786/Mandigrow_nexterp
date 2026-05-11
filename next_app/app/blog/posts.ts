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
        slug: 'what-is-apmc-software-complete-guide-india-2026',
        title: 'What is APMC Software? Complete Guide for Mandi Owners in India (2026)',
        description:
            'A complete guide to APMC software for mandi owners in India. What it does, why you need it, how it works, and what to look for when choosing the best APMC management software.',
        keywords: [
            'APMC software India',
            'APMC management software',
            'agricultural market software India',
            'mandi ERP software',
            'APMC billing software',
            'grain mandi software India',
        ],
        publishedAt: '2026-05-01',
        author: 'MandiGrow Team',
        readMinutes: 8,
        body: `
<p>If you manage an APMC mandi — whether you are a commission agent, a market secretary, or a multi-mandi operator — you have probably heard the term "APMC software." But what does it actually mean, and why does every modern mandi operator need it?</p>

<h2>What is APMC Software?</h2>

<p>APMC software (Agricultural Produce Market Committee software) is a purpose-built digital management system for regulated agricultural markets in India. It digitizes every major operation of an APMC mandi: commodity arrivals, auction and sale recording, commission calculation, farmer payments, trader khata management, and government levy reporting.</p>

<p>Unlike generic accounting tools like Tally or Zoho, APMC software is designed around the unique structure of Indian agricultural markets — lot-based trading, weight-based billing, commission agent intermediaries, market fees, hamali, and the complex regulatory requirements of state APMC Acts.</p>

<h2>Why Do Mandis Need APMC Management Software?</h2>

<p>The answer is efficiency and compliance. A mid-size APMC mandi processes hundreds of transactions per day — each involving a farmer, a buyer, a commission agent, weight measurements, lot tracking, and financial settlements. Managing this manually or in spreadsheets leads to errors, disputes, and delayed farmer payments.</p>

<p>Modern APMC management software solves this by:</p>
<ul>
  <li><strong>Automating commission calculation</strong> — eliminating manual errors on every transaction.</li>
  <li><strong>Real-time farmer and buyer ledgers</strong> — so balances are always accurate and disputes are settled with a printed statement.</li>
  <li><strong>Digital daybook</strong> — replacing paper records with audit-ready digital entries.</li>
  <li><strong>GST billing</strong> — generating GSTIN-compliant invoices for every sale and purchase.</li>
  <li><strong>Market levy reporting</strong> — computing and recording APMC cess and other government charges automatically.</li>
</ul>

<h2>How Does APMC Software Work?</h2>

<p>The workflow in MandiGrow — India's leading APMC billing software — follows the natural flow of a mandi trading day:</p>
<ol>
  <li><strong>Gate entry</strong> — vehicle arrival is logged with farmer details, crop, quantity, and vehicle number.</li>
  <li><strong>Lot creation</strong> — the commodity is assigned a lot number and weighed.</li>
  <li><strong>Auction or direct sale</strong> — the rate is set, the buyer is assigned, and the system auto-calculates commission, market fee, hamali, and net payable to the farmer.</li>
  <li><strong>Billing</strong> — GST-compliant invoices are generated for buyer and seller in seconds.</li>
  <li><strong>Settlement</strong> — farmer payment is recorded, ledger entries post automatically.</li>
  <li><strong>Reporting</strong> — daily daybook, party-wise ledger, and government levy reports are ready in one click.</li>
</ol>

<h2>What to Look For in APMC Software</h2>

<p>When evaluating APMC management software for your mandi, focus on these five criteria:</p>
<ol>
  <li><strong>Multi-crop support.</strong> Your software must handle any commodity — wheat, rice, onion, tomato, mango — without reconfiguration.</li>
  <li><strong>Commission flexibility.</strong> Different commodities and parties often have different commission rates. The software must handle this per-party and per-item.</li>
  <li><strong>Mobile access.</strong> Gate staff and commission agents need to work from phones. Desktop-only software creates bottlenecks.</li>
  <li><strong>Offline capability.</strong> Mandis in semi-urban areas often have unreliable internet. Your software should work offline and sync when connectivity returns.</li>
  <li><strong>Language support.</strong> Your staff should be able to work in Telugu, Hindi, Kannada, or their regional language — not just English.</li>
</ol>

<h2>MandiGrow — The Best APMC Software for India in 2026</h2>

<p>MandiGrow scores 5 out of 5 on every criterion above. It is the only APMC billing software built end-to-end for Indian agricultural markets — with full support for Telugu, Hindi, English, Tamil, Kannada and Malayalam. Mandis in Andhra Pradesh, Telangana, Maharashtra, Madhya Pradesh and Karnataka use MandiGrow to run their operations every day.</p>

<p>Start your free 14-day trial at <a href="https://www.mandigrow.com">mandigrow.com</a>. No credit card required. Live demos available in Hindi and Telugu.</p>
`,
    },
    {
        slug: 'mandi-commission-calculation-guide-india',
        title: 'How to Calculate Mandi Commission — Farmer & Trader Charges Explained',
        description:
            'A clear, practical guide to mandi commission calculation in India. How commission agents compute charges, what farmers and buyers pay, and how software automates it.',
        keywords: [
            'mandi commission calculation',
            'commission agent software India',
            'mandi commission charges',
            'arhtiya commission calculation',
            'APMC commission rates India',
            'mandi billing software',
        ],
        publishedAt: '2026-05-05',
        author: 'MandiGrow Team',
        readMinutes: 7,
        body: `
<p>Mandi commission calculation is one of the most misunderstood aspects of agricultural trade in India. Get it wrong and you lose money. Get it right every time with software and you build trust with every farmer and buyer you work with.</p>

<p>This guide breaks down exactly how mandi commission works — from the farmer's side, the buyer's side, and the commission agent's side — and shows how MandiGrow automates the calculation on every single transaction.</p>

<h2>What is Mandi Commission?</h2>

<p>A mandi commission agent (arhtiya) earns a fee for facilitating the sale of agricultural produce between a farmer (seller) and a trader (buyer). This fee is called commission or arhat. In most Indian states, commission rates are regulated by the state APMC Act.</p>

<p>Typical commission structure in Indian mandis:</p>
<ul>
  <li><strong>Commission on sale value:</strong> Usually 2–6% of the gross sale amount, charged to the farmer.</li>
  <li><strong>Market fee (mandi tax):</strong> 0.5–2% levied by the APMC committee, charged on the buyer or shared.</li>
  <li><strong>Hamali:</strong> Labour charge for loading/unloading, usually per bag or per quintal.</li>
  <li><strong>Palledari:</strong> Weighing charges, usually per weighment.</li>
  <li><strong>Cleaning/grading charges:</strong> If applicable, deducted from the farmer's payment.</li>
</ul>

<h2>Step-by-Step Mandi Commission Calculation</h2>

<p>Let's walk through a real example. A farmer brings 100 quintals of onions. Buyers bid ₹2,500/quintal. The commission agent's rate is 5%.</p>

<ol>
  <li><strong>Gross sale value:</strong> 100 × ₹2,500 = ₹2,50,000</li>
  <li><strong>Commission (5%):</strong> ₹2,50,000 × 5% = ₹12,500</li>
  <li><strong>Market fee (1%):</strong> ₹2,50,000 × 1% = ₹2,500</li>
  <li><strong>Hamali (₹20/quintal × 100):</strong> ₹2,000</li>
  <li><strong>Total deductions:</strong> ₹12,500 + ₹2,500 + ₹2,000 = ₹17,000</li>
  <li><strong>Net payable to farmer:</strong> ₹2,50,000 − ₹17,000 = ₹2,33,000</li>
</ol>

<p>The buyer pays ₹2,50,000. The commission agent pays the farmer ₹2,33,000 and retains ₹17,000 (minus the market fee remitted to the APMC committee).</p>

<h2>Why Manual Commission Calculation Fails</h2>

<p>The maths looks simple in isolation. In a real mandi, you may do 50–500 such transactions a day, with different rates for different commodities, different hamali rates by season, different buyers with different payment terms, and all of this in parallel at 5am.</p>

<p>Manual calculation leads to:</p>
<ul>
  <li>Arithmetic errors that erode trust with farmers.</li>
  <li>Missed deductions that cut into your earnings.</li>
  <li>Disputes over the final patti amount.</li>
  <li>Hours of reconciliation at day-end.</li>
</ul>

<h2>How MandiGrow Automates Mandi Commission</h2>

<p>MandiGrow is purpose-built commission agent software for Indian mandis. You configure commission rates once — per party or per commodity — and the system calculates every deduction automatically on every sale.</p>

<ul>
  <li>Commission, market fee, hamali and palledari are calculated and posted in one click.</li>
  <li>The farmer's patti is generated instantly — printable and shareable on WhatsApp.</li>
  <li>Every party's khata updates in real time — no end-of-day reconciliation needed.</li>
  <li>GSTR-1 data is ready for export at the end of the month.</li>
</ul>

<p>Try MandiGrow's commission agent software free for 14 days at <a href="https://www.mandigrow.com/commission-agent-software">mandigrow.com/commission-agent-software</a>.</p>
`,
    },
    {
        slug: 'best-mandi-software-india-2026-comparison',
        title: 'Best Mandi Software in India 2026 — MandiGrow vs AdatSoft vs Excel',
        description:
            'An honest comparison of the best mandi software options in India for 2026 — MandiGrow, AdatSoft, and Excel spreadsheets. Which one is right for your mandi?',
        keywords: [
            'best mandi software India',
            'MandiGrow vs AdatSoft',
            'mandi ERP software comparison',
            'mandi management software India 2026',
            'adatsoft alternative',
            'commission agent software India',
        ],
        publishedAt: '2026-05-10',
        author: 'MandiGrow Team',
        readMinutes: 9,
        body: `
<p>Choosing the right mandi software for your business is one of the most consequential decisions you will make this year. The wrong choice means months of lost time, frustrated staff, and potentially corrupted financial records. The right choice means a mandi that runs faster, earns more, and pays farmers accurately every single day.</p>

<p>This is an honest, side-by-side comparison of the three options most mandi operators consider in 2026: MandiGrow, AdatSoft, and Excel spreadsheets.</p>

<h2>Option 1: Excel Spreadsheets</h2>

<p><strong>Who uses it:</strong> Small mandis, early-stage commission agents, operators who haven't yet invested in software.</p>

<p><strong>Strengths:</strong> Flexible, familiar, zero cost.</p>

<p><strong>Critical weaknesses:</strong></p>
<ul>
  <li>No automation — every calculation is manual and error-prone.</li>
  <li>No audit trail — anyone can change any cell with no record.</li>
  <li>No mobile access — you're chained to a single computer.</li>
  <li>No GST invoicing — you need a separate tool for billing.</li>
  <li>Scales catastrophically — 500 transactions per day in Excel is a nightmare.</li>
</ul>

<p><strong>Verdict:</strong> Excel is a productivity tool, not an ERP. It's fine for 10 transactions per week. For anything more, you're leaving money on the table and exposing yourself to accounting errors.</p>

<h2>Option 2: AdatSoft</h2>

<p><strong>Who uses it:</strong> Mandis in northern India, particularly grain mandis in Punjab, Haryana and UP.</p>

<p><strong>Strengths:</strong> Established brand in grain mandi segment, good offline operation, familiar to accountants in the region.</p>

<p><strong>Weaknesses:</strong></p>
<ul>
  <li>Desktop-only — no mobile app, no phone billing at the gate.</li>
  <li>Limited language support — primarily Hindi and English.</li>
  <li>No modern cloud sync — each installation is isolated.</li>
  <li>Older UI — significantly steeper learning curve for new staff.</li>
  <li>No WhatsApp integration for sharing pattis.</li>
  <li>Limited support for fruits and vegetable trade nuances (lot tracking, crate-based billing).</li>
</ul>

<h2>Option 3: MandiGrow</h2>

<p><strong>Who uses it:</strong> Commission agents, APMC markets, wholesale traders and multi-mandi operators across Andhra Pradesh, Telangana, Maharashtra, Karnataka and beyond.</p>

<p><strong>Strengths:</strong></p>
<ul>
  <li><strong>Mobile + desktop:</strong> Bill at the gate on Android. Review reports from the office on desktop. Same real-time data.</li>
  <li><strong>7 languages:</strong> Hindi, English, Telugu, Tamil, Kannada, Malayalam, Urdu — out of the box.</li>
  <li><strong>Auto commission:</strong> Commission, market fee, hamali and palledari calculated automatically on every sale.</li>
  <li><strong>Cloud sync:</strong> Multi-branch and multi-user with real-time data across locations.</li>
  <li><strong>WhatsApp patti:</strong> Share farmer settlement statements directly from the app.</li>
  <li><strong>GST ready:</strong> B2B/B2C invoices, GSTR-1 export, e-invoicing support.</li>
  <li><strong>Lot and crate tracking:</strong> Built for fruits and vegetable trade — not bolted on.</li>
  <li><strong>Free trial:</strong> 14 days, no credit card, full features.</li>
</ul>

<p><strong>Weaknesses:</strong> Requires internet for cloud sync (offline mode available for core operations).</p>

<h2>The Verdict for 2026</h2>

<table>
<thead><tr><th>Feature</th><th>Excel</th><th>AdatSoft</th><th>MandiGrow</th></tr></thead>
<tbody>
<tr><td>Auto commission calculation</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>Mobile app</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>Regional languages</td><td>❌</td><td>Hindi only</td><td>7 languages</td></tr>
<tr><td>GST billing</td><td>❌</td><td>✅</td><td>✅</td></tr>
<tr><td>WhatsApp share</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>Cloud sync</td><td>❌</td><td>❌</td><td>✅</td></tr>
<tr><td>Free trial</td><td>N/A</td><td>❌</td><td>✅ 14 days</td></tr>
</tbody>
</table>

<p>For any mandi with more than a handful of daily transactions, MandiGrow is the clear choice in 2026. Start your free trial at <a href="https://www.mandigrow.com">mandigrow.com</a>.</p>
`,
    },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
