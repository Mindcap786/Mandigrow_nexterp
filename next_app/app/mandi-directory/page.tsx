import type { Metadata } from 'next';
import Link from 'next/link';
import { FOOTER_COLUMNS } from '@/lib/seo-links';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { MapPin, ArrowRight, LayoutGrid } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Directory & Supported Commodities | MandiGrow',
    description: 'Explore all the major agricultural markets, mandis, and commodities supported by MandiGrow ERP across India.',
    alternates: {
        canonical: 'https://www.mandigrow.com/mandi-directory',
    },
};

export default function MandiDirectoryPage() {
    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
            {/* Premium Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200 via-slate-50 to-transparent pointer-events-none z-0"></div>
            
            <nav className="w-full border-b border-emerald-900/5 bg-white/60 backdrop-blur-xl sticky top-0 z-50 shrink-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">M</div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300">
                        Start Free Trial →
                    </Link>
                </div>
            </nav>

            <div className="relative z-10 flex-1">
                <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                        <MapPin className="w-3.5 h-3.5" /> Mandi Locations & Commodities
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Supported Markets <br className="hidden md:block"/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                            across India
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                        MandiGrow is customized to handle the unique APMC rules, taxes, and accounting requirements for every major mandi and agricultural commodity.
                    </p>
                </section>

                <section className="max-w-7xl mx-auto px-6 pb-24">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FOOTER_COLUMNS.map((column, idx) => (
                            <div key={column.heading} 
                                 className="group bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.08)] rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                                
                                {/* Subtle decorative gradient inside the card */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                            <LayoutGrid className="w-5 h-5" />
                                        </div>
                                        {column.heading}
                                    </h2>
                                    <ul className="space-y-2">
                                        {column.links.map((link) => (
                                            <li key={link.href}>
                                                <Link href={link.href} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-700 transition-all duration-300">
                                                    <span className="text-sm font-semibold">
                                                        {link.label}
                                                    </span>
                                                    <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-emerald-100 flex items-center justify-center opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all">
                                                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <LandingFooter />
        </main>
    );
}
