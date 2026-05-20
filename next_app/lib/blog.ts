import { POSTS as OLD_POSTS } from '@/app/blog/posts';

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
        category: "Regulations",
        seoKeywords: ["J-Form Punjab", "I-Form generation", "Arhtiya compliance", "MSP calculations", "Anaj Mandi"]
    }
];

export const BLOG_POSTS: BlogPost[] = [
    ...NEW_POSTS,
    ...legacyPosts
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(post => post.slug === slug);
}
