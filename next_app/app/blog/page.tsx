import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'MandiGrow Blog | Insights for Indian Mandi Businesses',
    description:
        'Expert guides, comparisons, and tips for commission agents, sabzi mandi traders, and agricultural wholesale markets in India.',
    alternates: { canonical: 'https://www.mandigrow.com/blog' },
};

import { POSTS as OLD_POSTS } from './posts';

const NEW_POSTS = [
    {
        title: 'Tally vs. MandiGrow: Why General Accounting Software Fails Fruit & Vegetable Traders',
        slug: 'tally-vs-mandigrow-mandi-software',
        excerpt: 'Discover why standard ERP and accounting tools like Tally aren\'t built for the fast-paced, lot-based reality of the sabzi mandi. Learn how native commission agent software saves you hours every night.',
        date: 'May 17, 2026',
        category: 'Software Comparison',
    },
    {
        title: 'How to Calculate Commission, Hamali, and Mandi Tax (Cess) Automatically',
        slug: 'how-to-calculate-commission-hamali-mandi-tax',
        excerpt: 'Stop calculating commission and deductions manually. Learn how to automate your market fees, hamali, and palledari deductions directly from the mandi gate pass.',
        date: 'May 18, 2026',
        category: 'Mandi Operations',
    },
    {
        title: 'The Complete Guide to APMC Mandi GST Compliance in 2026',
        slug: 'apmc-mandi-gst-compliance-2026',
        excerpt: 'Everything commission agents and wholesale vegetable traders need to know about GST, e-invoicing, and staying compliant within the APMC structure.',
        date: 'May 19, 2026',
        category: 'Tax & Compliance',
    },
    {
        title: 'Paper Khata vs Digital Mandi Khata: Transitioning Your Commission Business',
        slug: 'paper-khata-vs-digital-mandi-khata',
        excerpt: 'The risks of paper bahis and the benefits of a live, digital mandi khata. See how to settle farmer accounts instantly without reconciliation headaches.',
        date: 'May 20, 2026',
        category: 'Business Growth',
    },
];

const ALL_POSTS = [
    ...NEW_POSTS,
    ...OLD_POSTS.map(p => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.description,
        date: new Date(p.publishedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }),
        category: 'Mandi Guide'
    }))
];

export default function BlogIndexPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 pt-20">
            <LandingHeader />

            <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Resources & Guides
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    The MandiGrow Blog
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-12">
                    Everything you need to scale your commission agency, understand GST compliance in APMC markets, and modernize your mandi wholesale business.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {ALL_POSTS.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block p-8 bg-white border border-emerald-100 rounded-[2rem] hover:border-emerald-400 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                    {post.category}
                                </span>
                                <span className="text-gray-400 text-sm font-medium">
                                    {post.date}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tighter mb-4 group-hover:text-emerald-700 transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 mb-6 line-clamp-3">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center text-emerald-700 font-bold group-hover:gap-2 transition-all">
                                Read Article <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
