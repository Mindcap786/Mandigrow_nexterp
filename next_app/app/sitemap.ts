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
        // Core marketing — top priority
        { url: `${BASE_URL}/`,                                     lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${BASE_URL}/features`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
        { url: `${BASE_URL}/pricing`,                              lastModified: now, changeFrequency: 'monthly', priority: 0.95 },

        // Feature landing pages
        { url: `${BASE_URL}/mandi-billing`,                        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/commission-agent-software`,            lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/mandi-khata-software`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.9 },

        // State SEO pages
        { url: `${BASE_URL}/mandi-software-andhra-pradesh`,        lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-telangana`,             lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${BASE_URL}/mandi-software-maharashtra`,           lastModified: now, changeFrequency: 'monthly', priority: 0.85 },

        // Multilingual
        { url: `${BASE_URL}/te`,                                   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

        // Partner & conversion
        { url: `${BASE_URL}/partners`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/subscribe`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

        // Blog
        { url: `${BASE_URL}/blog`,                                 lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
        ...blogEntries,

        // Support
        { url: `${BASE_URL}/faq`,                                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/contact`,                              lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },

        // Legal
        { url: `${BASE_URL}/privacy`,                              lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
        { url: `${BASE_URL}/terms`,                                lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
        { url: `${BASE_URL}/refund-policy`,                        lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },

        // Auth
        { url: `${BASE_URL}/login`,                                lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/join`,                                 lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ];
}
