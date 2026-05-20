import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { BLOG_POSTS } from '@/lib/blog';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'MandiGrow Blog | Insights for Commission Agents & APMC Traders',
    description: 'Expert advice, APMC tax updates, compliance guides, and technology insights for Mandi traders and Arhtiyas across India.',
    alternates: { canonical: 'https://www.mandigrow.com/blog' },
};

export default function BlogListingPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Blog',
                name: 'MandiGrow Blog',
                description: 'Expert advice, APMC tax updates, compliance guides, and technology insights for Mandi traders.',
                url: 'https://www.mandigrow.com/blog',
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Start Free Trial →</Link>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    <BookOpen className="w-3.5 h-3.5" /> Mandi Knowledge Center
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Latest <span className="text-emerald-700">Insights</span> & <br />Updates
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                    Expert advice on APMC regulations, mandi accounting, farmer ledgers, and technology for modern Commission Agents.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map(post => (
                        <Link 
                            key={post.slug} 
                            href={`/blog/${post.slug}`}
                            className="bg-white border border-emerald-100 rounded-3xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all group flex flex-col h-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                    {post.category}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                    <Clock className="w-3 h-3" /> {post.readTime}
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                <span className="text-xs font-bold text-gray-500">{post.date}</span>
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
