import type { MetadataRoute } from 'next';
import { POSTS } from './blog/posts';

const BASE_URL = 'https://www.mandigrow.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const blogEntries: MetadataRoute.Sitemap = POSTS.map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [
        // ── Core ─────────────────────────────────────────────────────────────────
        { url: `${BASE_URL}/`,                               lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },

        // ── Money pages — commodity/category ──────────────────────────────────────
        { url: `${BASE_URL}/fruit-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/sabji-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/vegetable-mandi-software`,       lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/mandi-billing-software`,         lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/agriculture-billing-software`,   lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/mandi-erp-software`,             lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/digital-mandi-khata-software`,   lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${BASE_URL}/mandi-billing`,                  lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/commission-agent-software`,      lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/apmc-billing-software`,          lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/anaj-mandi-software`,            lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/sabji-billing-software`,         lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/sabzi-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/fruit-vegetable-billing`,        lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/fruit-trader-software`,          lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/vegetable-market-software`,      lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-khata-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/wholesale-trader-erp`,           lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/gst-mandi-compliance`,           lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/gst-billing-for-arhtiyas`,       lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/warehouse-management-mandi`,     lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/auction-management-software`,    lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/farmer-payment-management`,      lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/inventory-management-mandi`,     lastModified: now, changeFrequency: 'monthly', priority: 0.85 },

        // ── State pages ───────────────────────────────────────────────────────────
        { url: `${BASE_URL}/mandi-software-andhra-pradesh`,  lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-telangana`,       lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-maharashtra`,     lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-karnataka`,       lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-tamil-nadu`,      lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-punjab`,          lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-rajasthan`,       lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-uttar-pradesh`,   lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-bihar`,           lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/mandi-software-hyderabad`,       lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-guntur`,          lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-nashik`,          lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-delhi`,           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-pune`,            lastModified: now, changeFrequency: 'monthly', priority: 0.85 },

        // ── Major Local Mandis (High Volume) ──────────────────────────────────────
        { url: `${BASE_URL}/azadpur-mandi-software`,         lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/vashi-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/ghazipur-mandi-software`,        lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/yeshwanthpur-mandi-software`,    lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/bowenpally-mandi-software`,      lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/okhla-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.95 },

        // ── Competitor Versus Pages ───────────────────────────────────────────────
        { url: `${BASE_URL}/tally-vs-mandigrow`,             lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/vyapar-vs-mandigrow`,            lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/marg-erp-vs-mandigrow`,          lastModified: now, changeFrequency: 'monthly', priority: 0.90 },
        { url: `${BASE_URL}/zoho-vs-mandigrow`,              lastModified: now, changeFrequency: 'monthly', priority: 0.90 },

        // ── Phase 4: Commodity-Specific Pages ────────────────────────────────────
        { url: `${BASE_URL}/apple-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/mango-mandi-software`,           lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/onion-potato-mandi-software`,    lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/chilli-mandi-software`,          lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/tomato-mandi-software`,          lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/anaj-mandi-erp-software`,        lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/poultry-wholesale-software`,     lastModified: now, changeFrequency: 'monthly', priority: 0.88 },

        // ── Phase 5: Hindi-Language SEO Pages ────────────────────────────────────
        { url: `${BASE_URL}/mandi-software-hindi`,           lastModified: now, changeFrequency: 'monthly', priority: 0.93 },
        { url: `${BASE_URL}/arhtiya-software`,               lastModified: now, changeFrequency: 'monthly', priority: 0.93 },
        { url: `${BASE_URL}/mandi-billing-software-hindi`,   lastModified: now, changeFrequency: 'monthly', priority: 0.93 },

        // ── Phase 7: Feature Deep-Dives & Regional Languages ─────────────────────
        { url: `${BASE_URL}/j-form-billing-software`,        lastModified: now, changeFrequency: 'monthly', priority: 0.94 },
        { url: `${BASE_URL}/apmc-gate-pass-software`,        lastModified: now, changeFrequency: 'monthly', priority: 0.92 },
        { url: `${BASE_URL}/mandi-accounting-software`,      lastModified: now, changeFrequency: 'monthly', priority: 0.94 },
        { url: `${BASE_URL}/mandi-software-marathi`,         lastModified: now, changeFrequency: 'monthly', priority: 0.93 },

        // ── Support & marketing pages ─────────────────────────────────────────────
        { url: `${BASE_URL}/faq`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
        { url: `${BASE_URL}/blog`,                           lastModified: now, changeFrequency: 'weekly',  priority: 0.80 },
        ...blogEntries,
        { url: `${BASE_URL}/subscribe`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
        { url: `${BASE_URL}/contact`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
        { url: `${BASE_URL}/pricing`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    ];
}
