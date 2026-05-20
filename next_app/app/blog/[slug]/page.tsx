import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { getBlogPost, BLOG_POSTS } from '@/lib/blog';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata(
    props: { params: Promise<{ slug: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await props.params;
    const post = getBlogPost(slug);
    if (!post) return {};

    return {
        title: `${post.title} | MandiGrow Blog`,
        description: post.excerpt,
        keywords: post.seoKeywords,
        alternates: { canonical: `https://www.mandigrow.com/blog/${post.slug}` },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        }
    };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const post = getBlogPost(slug);
    if (!post) notFound();

    // BlogPosting Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        author: {
            '@type': 'Organization',
            name: post.author,
        },
        datePublished: post.date,
        dateModified: post.date,
        publisher: {
            '@type': 'Organization',
            name: 'MandiGrow',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.mandigrow.com/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.mandigrow.com/blog/${post.slug}`,
        },
    };

    return (
        <main className="min-h-screen bg-white text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <nav className="w-full border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/blog" className="text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
                        {post.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-8 leading-[1.15]">
                        {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500 bg-gray-50 py-3 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" />
                            {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            {post.readTime}
                        </div>
                    </div>
                </header>

                <div 
                    className="prose prose-lg prose-emerald max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                <div className="mt-16 pt-8 border-t border-gray-100">
                    <div className="bg-emerald-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-3xl font-black mb-4 relative z-10">Stop Reading. Start Automating.</h3>
                        <p className="text-emerald-200 mb-8 max-w-xl mx-auto relative z-10">
                            Join thousands of Commission Agents across India who use MandiGrow to eliminate bad debt, calculate APMC taxes, and send WhatsApp pattis in 5 seconds.
                        </p>
                        <Link href="/subscribe" className="inline-block bg-white text-emerald-900 font-black px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg relative z-10">
                            Start 14-Day Free Trial
                        </Link>
                    </div>
                </div>
            </article>

            <LandingFooter />
        </main>
    );
}
