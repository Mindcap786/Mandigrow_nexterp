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

        // ── Support & marketing pages ─────────────────────────────────────────────
        { url: `${BASE_URL}/faq`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
        { url: `${BASE_URL}/blog`,                           lastModified: now, changeFrequency: 'weekly',  priority: 0.80 },
        ...blogEntries,
        { url: `${BASE_URL}/subscribe`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.80 },
        { url: `${BASE_URL}/contact`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.70 },
        { url: `${BASE_URL}/pricing`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    ];
}
