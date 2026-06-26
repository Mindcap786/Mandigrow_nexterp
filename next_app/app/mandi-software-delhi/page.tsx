import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Software Delhi | APMC ERP for Azadpur, Ghazipur & Okhla | MandiGrow',
    description: 'MandiGrow is the #1 mandi software for Delhi. Covers Azadpur, Ghazipur, and Okhla APMC. Auto Delhi Market Fee (1%) + Vikas Shulk (2%). Hindi billing. Free trial.',
    keywords: ['mandi software Delhi', 'APMC ERP Delhi', 'Delhi mandi billing software', 'commission agent software Delhi', 'Azadpur Ghazipur Okhla mandi software', 'Hindi mandi ERP Delhi'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-delhi' },
    openGraph: {
        title: 'Mandi Software Delhi — MandiGrow APMC ERP',
        description: "Best APMC software for Delhi commission agents. Covers Azadpur, Ghazipur, Okhla. Auto Market Fee + Vikas Shulk. Hindi billing.",
        url: 'https://www.mandigrow.com/mandi-software-delhi',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best mandi software for Delhi APMC markets?', a: "MandiGrow is the #1 mandi ERP for Delhi APMC commission agents, covering all three major wholesale markets — Azadpur (fruit), Ghazipur (vegetables), and Okhla (distribution). It auto-calculates Delhi Market Fee (1%) and Vikas Shulk (2%), generates Hindi farmer Pattis, and provides digital Khata for all party accounts." },
    { q: 'What are the APMC market fees in Delhi in 2026?', a: "Delhi APMC charges under the Delhi Agricultural Produce Marketing (Regulation) Act 1998 include: Market Fee (Mandi Shulk) at 1% of sale value, and Vikas Shulk (Development Cess) at 2% of sale value. Both are collected from the buyer and deposited to the Delhi APMC. Total buyer levy is 3% of the gross sale value." },
    { q: 'Does MandiGrow work for all three Delhi APMC mandis?', a: "Yes. MandiGrow is configured to support all three Delhi APMC markets — Azadpur, Ghazipur, and Okhla. The same software handles fruit billing (box-level tracking at Azadpur), vegetable billing (bag-level tracking at Ghazipur), and exotic/export produce billing at Okhla — with the same Delhi APMC levy configuration applied uniformly." },
];

const MARKETS = [
    { name: 'Azadpur Mandi', desc: "Asia's largest fruit and vegetable wholesale market. Primary commodities: Apple, Mango, Kinnow, Tomato, Potato.", href: '/azadpur-mandi-software' },
    { name: 'Ghazipur Mandi', desc: 'East Delhi vegetable distribution yard. Primary commodities: Potato, Onion, Tomato. Handles 400+ trucks/day.', href: '/ghazipur-mandi-software' },
    { name: 'Okhla Mandi', desc: 'South Delhi F&V distribution with high exotic produce and export-oriented buyer base.', href: '/okhla-mandi-software' },
];

export default function MandiSoftwareDelhiPage() {
    const faqSchema = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🍎 Delhi · 3 Major APMC Mandis · Hindi Billing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Best Mandi Software for Delhi<br />
                        <span className="text-emerald-700">APMC ERP for Azadpur, Ghazipur &amp; Okhla</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is Delhi&apos;s most trusted APMC ERP covering all three major wholesale markets — <strong>Azadpur (Fruit), Ghazipur (Vegetables), and Okhla (Distribution)</strong>. Auto-calculate Delhi Market Fee (1%) + Vikas Shulk (2%), generate Hindi farmer Pattis, and manage digital Khata across all yards.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Talk to Our Team →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Three markets */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-6">Delhi&apos;s Three APMC Markets — All Supported</h2>
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {MARKETS.map(m => (
                            <Link key={m.name} href={m.href} className="bg-[#f7fbf3] border border-emerald-100 p-6 rounded-2xl hover:border-emerald-300 transition-colors block">
                                <h3 className="font-black text-xl text-emerald-800 mb-2">{m.name}</h3>
                                <p className="text-gray-600 text-sm">{m.desc}</p>
                            </Link>
                        ))}
                    </div>

                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Delhi APMC Tax Structure — Auto-Calculated</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Levy</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Authority</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Market Fee (Mandi Shulk)</td><td className="p-3 text-center font-bold">1%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Delhi APMC</td></tr>
                                <tr><td className="p-3">Vikas Shulk (Development Cess)</td><td className="p-3 text-center font-bold">2%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Delhi APMC</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Total Buyer Deduction</td><td className="p-3 text-center font-bold text-red-700">3%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">—</td></tr>
                                <tr><td className="p-3">Arhat / Commission (Fruit)</td><td className="p-3 text-center font-bold">6–8%</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya Income</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 bg-[#f7fbf3]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-5">
                        {FAQS.map(f => (
                            <div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white">
                                <h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3>
                                <p className="text-gray-700 font-medium leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 px-6 bg-white border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Related Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/azadpur-mandi-software', label: 'Azadpur Mandi' },
                            { href: '/ghazipur-mandi-software', label: 'Ghazipur Mandi' },
                            { href: '/okhla-mandi-software', label: 'Okhla Mandi' },
                            { href: '/fruit-mandi-software', label: 'Fruit Mandi Software' },
                            { href: '/mandi-billing-software', label: 'Mandi Billing Software' },
                        ].map(l => (
                            <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                                {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Delhi Ki Mandi Ko Digital Banayein</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Hindi billing. Zero setup cost. Under 2 hours setup.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
