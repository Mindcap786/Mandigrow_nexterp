import type { Metadata } from 'next';
import Link from 'next/link';
import { FOOTER_COLUMNS } from '@/lib/seo-links';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Directory & Supported Commodities | MandiGrow',
    description: 'Explore all the major agricultural markets, mandis, and commodities supported by MandiGrow ERP across India.',
};

export default function MandiDirectoryPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 flex flex-col">
            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50 shrink-0">
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
                    <MapPin className="w-3.5 h-3.5" /> Mandi Locations & Commodities
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                    Supported Markets across India
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                    MandiGrow is customized to handle the unique APMC rules, taxes, and accounting requirements for every major mandi and agricultural commodity in India.
                </p>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-20 flex-1">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FOOTER_COLUMNS.map((column) => (
                        <div key={column.heading} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                                {column.heading}
                            </h2>
                            <ul className="space-y-4">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="group flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-700 transition-colors">
                                                {link.label}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:text-emerald-600 group-hover:-rotate-45 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
