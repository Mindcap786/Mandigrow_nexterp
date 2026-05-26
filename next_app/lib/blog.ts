import { POSTS as OLD_POSTS } from '@/app/blog/posts';
import { PHASE9_POSTS } from './blog-data-phase9';

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML or Markdown content
    author: string;
    date: string;
    readTime: string;
    category: string;
    seoKeywords: string[];
}

// Convert old posts to new format
const legacyPosts: BlogPost[] = OLD_POSTS.map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description,
    content: post.body,
    author: post.author,
    date: post.publishedAt,
    readTime: `${post.readMinutes} min read`,
    category: 'Mandi Guide',
    seoKeywords: post.keywords || [],
}));

export const NEW_POSTS: BlogPost[] = [
    {
        slug: "apmc-tax-rates-maharashtra",
        title: "APMC Tax and Market Fee Rates in Maharashtra (2026 Update)",
        excerpt: "A complete guide to the latest APMC cess, market fees, and hamali rates for commission agents operating in Vashi, Nashik, and Pune mandis.",
        content: `
            <h2>Understanding APMC Market Fees in Maharashtra</h2>
            <p>For commission agents (Adtiyas) operating in Maharashtra, understanding the exact deductions required by the APMC is critical for maintaining compliance and avoiding fines.</p>
            <h3>Current Rates (2026)</h3>
            <ul>
                <li><strong>Market Fee:</strong> Typically ranges from 0.8% to 1% depending on the specific APMC.</li>
                <li><strong>Supervision Charges:</strong> Around 0.05% of the transaction value.</li>
                <li><strong>Hamali (Labor) & Tolai (Weighing):</strong> Standardized rates per quintal or per crate, updated annually by the local market committee.</li>
            </ul>
            <p>Using a dedicated mandi accounting software like MandiGrow automatically calculates these deductions on every farmer patti, ensuring you never overpay or underpay the APMC.</p>
        `,
        author: "MandiGrow Research Team",
        date: "2026-05-15",
        readTime: "4 min read",
        category: "Compliance",
        seoKeywords: ["APMC tax rates", "Maharashtra mandi fees", "Vashi APMC cess", "Hamali rates", "Mandi compliance"]
    },
    {
        slug: "kisan-khata-best-practices",
        title: "How to Manage Kisan Khata Without Losing Money to Bad Debt",
        excerpt: "Learn the top 5 secrets used by India's biggest commission agents to manage farmer advances and udhaar khata.",
        content: `
            <h2>The Secret to Zero Bad Debt in Mandi Business</h2>
            <p>Managing advances given to farmers (Kisan Khata) and credit given to buyers (Udhaar Khata) is the hardest part of the commission agent business.</p>
            <h3>Best Practices</h3>
            <ol>
                <li><strong>Real-time Ledger Updates:</strong> Never wait for the end of the day to update your bahis. Update them instantly upon sale.</li>
                <li><strong>Limit Setting:</strong> Set strict credit limits for buyers based on their payment history.</li>
                <li><strong>Digital Pattis:</strong> Send immediate WhatsApp notifications to farmers with their net payable amount after deducting advances.</li>
            </ol>
            <p>MandiGrow's Digital Khata feature does all of this automatically, acting as a financial safety net for your business.</p>
        `,
        author: "Financial Advisory Board",
        date: "2026-05-10",
        readTime: "5 min read",
        category: "Finance",
        seoKeywords: ["Kisan Khata", "Udhaar Khata", "Mandi accounting", "Farmer ledger", "Bad debt management"]
    },
    {
        slug: "j-form-punjab-haryana",
        title: "Everything You Need to Know About Generating J-Forms in Punjab & Haryana",
        excerpt: "A step-by-step guide to generating I-Forms and J-Forms accurately to ensure MSP compliance in Anaj Mandis.",
        content: `
            <h2>J-Form Generation Simplified</h2>
            <p>In the grain markets of Punjab and Haryana, the J-Form is the legal document proving the sale of agricultural produce by a farmer to a commission agent (Kacha Arhtiya) or buyer.</p>
            <h3>What Must Be Included?</h3>
            <ul>
                <li>Accurate weight of the commodity (e.g., Wheat, Paddy)</li>
                <li>Current Minimum Support Price (MSP)</li>
                <li>Deductions like Market Fee, RDF (Rural Development Fund), and Dami (Commission)</li>
            </ul>
            <p>Generating J-Forms manually leads to calculation errors and APMC penalties. By using MandiGrow's J-Form Billing module, Arhtiyas can generate 100% compliant J-Forms in under 5 seconds.</p>
        `,
        author: "MandiGrow Legal Team",
        date: "2026-05-05",
        readTime: "6 min read",
        category: "Compliance",
        seoKeywords: ["J-Form", "I-Form", "Punjab Mandi", "Haryana APMC", "Farmer settlement", "Mandi compliance"]
    },
    {
        slug: 'best-fruit-mandi-software-india-2026',
        title: 'Best Fruit Mandi Software in India 2026',
        excerpt: 'Discover the best fruit mandi software in India for 2026. Learn how to track crates, manage lots, and calculate per-box commission automatically.',
        content: `
            <h2>Key Features of the Best Fruit Mandi Software</h2>
            <p>Fruit wholesale involves unique challenges that standard accounting software simply cannot handle. From tracking empty plastic crates (jalis) to managing per-box commissions, fruit traders need specialized tools.</p>
            <ul>
                <li><strong>Crate Management:</strong> Track issued and returned crates per party to stop inventory leakage.</li>
                <li><strong>Per-Box Commission:</strong> Instantly calculate commission, hamali, and market cess per box.</li>
                <li><strong>Live Ledger Sync:</strong> Update the farmer's khata the moment an auction finishes.</li>
            </ul>
            <p>In 2026, <strong>MandiGrow</strong> leads the market by offering these features natively. It replaces manual registers with a fast, mobile-friendly platform designed for the fast-paced fruit mandi environment.</p>
        `,
        author: 'MandiGrow SEO Team',
        date: '2026-05-26',
        readTime: '6 min read',
        category: 'Software Guide',
        seoKeywords: ['best fruit mandi software India', 'fruit mandi billing software', 'fruit commission agent software', 'crate tracking software mandi', 'apple mandi software']
    },
    {
        slug: 'best-anaj-mandi-software-india-2026',
        title: 'Best Anaj Mandi Software in India 2026',
        excerpt: 'A guide to finding the best anaj mandi software in India for 2026. Manage grain arrivals, moisture deductions, weighbridge integrations, and auto-commission.',
        content: `
            <h2>What Makes Great Anaj Mandi Software?</h2>
            <p>Grain trading in anaj mandis requires managing massive volumes, tracking moisture deductions, and ensuring accurate weighbridge measurements. Traditional software falls short.</p>
            <ul>
                <li><strong>Weight Deductions:</strong> Automatically apply deductions for moisture or impurities (karda).</li>
                <li><strong>Multi-Commodity Support:</strong> Handle wheat, paddy, mustard, and dal with custom market fee rules.</li>
                <li><strong>Batch Settlements:</strong> Pay hundreds of farmers with one click after a major harvest arrival.</li>
            </ul>
            <p><strong>MandiGrow</strong> provides all this out of the box, making it the top choice for anaj mandi commission agents and traders in 2026.</p>
        `,
        author: 'MandiGrow SEO Team',
        date: '2026-05-26',
        readTime: '7 min read',
        category: 'Software Guide',
        seoKeywords: ['best anaj mandi software India', 'anaj mandi billing software', 'grain market software', 'krishi upaj mandi software', 'anaj commission agent software']
    },
    {
        slug: 'how-to-use-digital-mandi-khata',
        title: 'How to Use Digital Mandi Khata for Faster Settlements',
        excerpt: 'Learn how switching to a digital mandi khata can eliminate end-of-day reconciliation and speed up party settlements in your mandi business.',
        content: `
            <h2>The Advantage of a Digital Khata</h2>
            <p>The traditional paper bahi khata has served mandis well for decades, but it comes with a massive hidden cost: hours of reconciliation at the end of every day.</p>
            <p>A digital mandi khata automatically updates party balances the moment a sale, purchase, or payment is recorded. When a farmer asks for his balance, you don't need to add up receipts—the exact figure is already on your screen.</p>
            <h2>Faster Settlements</h2>
            <p>With software like MandiGrow, you can view all outstanding balances, select multiple parties, and generate batch settlement reports in seconds. This eliminates manual errors and builds immense trust with your suppliers and buyers.</p>
        `,
        author: 'MandiGrow SEO Team',
        date: '2026-05-26',
        readTime: '5 min read',
        category: 'Finance',
        seoKeywords: ['digital mandi khata', 'mandi ledger software', 'arhtiya khata software', 'mandi settlement software', 'digital bahi khata']
    },
    {
        slug: 'apmc-billing-compliance-guide-india',
        title: 'APMC Billing Compliance Guide for Indian Mandis (2026)',
        excerpt: 'Navigate APMC billing compliance effortlessly. Learn how to handle market cess, farmer pattis, and gate entry regulations across Indian states.',
        content: `
            <h2>Core APMC Compliance Requirements</h2>
            <p>Compliance with Agricultural Produce Market Committee (APMC) regulations is non-negotiable for mandi traders. But calculating market fees (cess) manually for every transaction is tedious and error-prone.</p>
            <ol>
                <li><strong>Gate Entry (Katchi Parchi):</strong> Every arrival must be recorded at the gate.</li>
                <li><strong>Auction Slips:</strong> Transparent recording of bidding rates.</li>
                <li><strong>Patti Generation:</strong> Providing farmers with a clear statement showing gross value, commission, and market fees deducted.</li>
            </ol>
            <h2>Automating Compliance</h2>
            <p>MandiGrow automates APMC compliance by linking state-specific mandi cess rules to your billing engine. When you generate a sale, the exact market fee is calculated and posted to the correct ledger, keeping you 100% compliant without any extra effort.</p>
        `,
        author: 'MandiGrow SEO Team',
        date: '2026-05-26',
        readTime: '8 min read',
        category: 'Compliance',
        seoKeywords: ['APMC billing compliance', 'mandi cess rules', 'APMC tax software', 'mandi market fee calculation', 'agricultural produce marketing committee']
    }
];

export const BLOG_POSTS: BlogPost[] = [
    ...PHASE9_POSTS,
    ...NEW_POSTS,
    ...legacyPosts
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(post => post.slug === slug);
}
