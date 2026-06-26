import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: "Azadpur Mandi Software — #1 APMC ERP for Delhi's Largest Fruit Market | MandiGrow",
    description: 'MandiGrow is the top-rated software for Azadpur Mandi commission agents. Manage Apple, Mango, and Kinnow seasons. High-volume billing, farmer khata, APMC levy auto-calculation. Hindi supported.',
    keywords: [
        'Azadpur mandi software', 'APMC software Delhi', 'Azadpur APMC ERP',
        'commission agent software Azadpur', 'apple trader software Azadpur',
        'mandi billing software Delhi', 'Azadpur vegetable market software',
        'fruit commission agent software Delhi', 'azadpur mandi arhtiya software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/azadpur-mandi-software' },
    openGraph: {
        title: 'Azadpur Mandi Software — MandiGrow APMC ERP Delhi',
        description: 'Best APMC and commission agent software for Azadpur Mandi traders. Handles massive fruit season volume seamlessly. Hindi support included.',
        url: 'https://www.mandigrow.com/azadpur-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best software for Azadpur Mandi commission agents?', a: 'MandiGrow is the most used mandi ERP software for Azadpur Mandi commission agents. It handles high-volume Apple, Mango, and Kinnow season billing with automated commission (Arhat) calculation, lot tracking at box/crate level, farmer ledger (Khata), and APMC levy reporting — all in Hindi. Generates farmer Pattis and buyer Bijaks in under 5 seconds per transaction.' },
    { q: 'Does MandiGrow handle the high volume during Apple season in Azadpur?', a: 'Yes. Azadpur Mandi receives over 40,000 boxes of apple per day during peak season. MandiGrow is engineered for this scale — with keyboard-shortcut driven billing, Bluetooth thermal printing, and cloud sync across multiple billing counters simultaneously. No slowdowns during peak hours.' },
    { q: 'What APMC charges does MandiGrow auto-calculate for Delhi mandis?', a: 'MandiGrow automatically calculates Delhi APMC charges including Market Fee (1% of sale value), Vikas Shulk (2%), and any notified cesses under the Delhi Agricultural Produce Marketing (Regulation) Act, 1998. All deductions are pre-configured and verifiable against the APMC notification.' },
    { q: 'Can I track individual boxes/crates in Azadpur Mandi with MandiGrow?', a: 'Yes. MandiGrow supports box-level and crate-level inventory tracking for fruits. Each farmer lot can be split into individual box counts, with the total weight and box count recorded. Crate deposits and returns from buyers are tracked automatically in the Crate Ledger.' },
    { q: 'Does MandiGrow generate bills in Hindi for Azadpur Mandi farmers?', a: 'Yes. MandiGrow supports full Hindi thermal printing for farmer Pattis, buyer Parchas, and ledger statements. Since most farmers visiting Azadpur are from Himachal Pradesh, Punjab, and Haryana, MandiGrow also supports Punjabi script for farm-level receipts.' },
];

export default function AzadpurMandiSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        name: 'MandiGrow — Azadpur Mandi Software',
        applicationCategory: 'BusinessApplication', operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/azadpur-mandi-software',
        description: "India's #1 APMC commission agent software for Azadpur Mandi, Delhi.",
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '62' },
    };
    const faqSchema = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🍎 Delhi · Azadpur APMC · Asia&apos;s Largest F&amp;V Market
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for the Scale of<br /><span className="text-emerald-700">Azadpur Mandi, Delhi</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the #1 APMC ERP for Azadpur Mandi commission agents. From <strong>Apple seasons</strong> (40,000+ boxes/day) to daily vegetable trade — automate Arhat commission, farmer Khata, APMC Vikas Shulk, and GST billing in Hindi.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Hindi →
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm font-bold text-gray-600">
                        {['Free Setup', 'Hindi Support', 'Box/Crate Tracking', 'Season-Ready', 'APMC Auto-Levy'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Azadpur Stats */}
            <section className="py-16 px-6 bg-emerald-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-center mb-10">Why Azadpur Needs Purpose-Built Software</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { stat: '82+ Lakh MT', label: 'Annual Throughput', desc: "Asia's largest wholesale fruit & vegetable market by volume" },
                            { stat: '200+', label: 'Licensed Arhtiyas', desc: 'Commission agents handle the bulk of daily transactions' },
                            { stat: '40,000 boxes', label: 'Apple/day (Peak)', desc: 'During Oct–Jan season from Himachal & Kashmir' },
                        ].map(s => (
                            <div key={s.stat} className="bg-emerald-800 rounded-2xl p-6">
                                <div className="text-3xl font-black text-emerald-300 mb-2">{s.stat}</div>
                                <div className="font-black text-white mb-1">{s.label}</div>
                                <div className="text-emerald-200 text-sm">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Delhi APMC Tax Table */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Delhi APMC Charges — Auto-Calculated by MandiGrow</h2>
                    <p className="text-gray-600 text-lg mb-8">MandiGrow pre-configures all Delhi APMC Act 1998 charges. Zero manual calculation needed:</p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Charge</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Deposited To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Market Fee (Mandi Shulk)</td><td className="p-3 text-center font-bold">1%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Delhi APMC</td></tr>
                                <tr><td className="p-3">Vikas Shulk (Development Cess)</td><td className="p-3 text-center font-bold">2%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Delhi APMC</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Dami (Commission)</td><td className="p-3 text-center font-bold">6–8% (Fruit)</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Loading-Unloading</td><td className="p-3 text-center font-bold">₹3–6/box</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Labour</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Season-wise handling */}
            <section className="py-20 px-6 bg-[#f0f7e8]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-10 text-center">Handling Every Season at Azadpur</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { emoji: '🍎', season: 'Apple Season (Oct–Feb)', desc: 'Box-level tracking for Himachali and Kashmiri apples. Variety-wise billing (Royal Delicious, Golden, Fuji). Cold storage lot management. WhatsApp Bijak to farmer suppliers.' },
                            { emoji: '🥭', season: 'Mango Season (Apr–Jul)', desc: 'Crate-weight billing for Alphonso, Langra, Dasheri, Totapuri. Perishable alert system for lots older than 24 hours. Variety-wise rate entry for auctions.' },
                            { emoji: '🍊', season: 'Kinnow/Citrus (Dec–Mar)', desc: 'Sack and box-based billing for Kinnow, Mosambi, Malta. Punjab and Rajasthan farmer Patti in Hindi and Punjabi script.' },
                            { emoji: '🥦', season: 'Daily Vegetable Trade (Year-round)', desc: 'High-speed POS for 200+ daily transactions per counter. Keyboard-first interface for accountants under 5 AM morning rush pressure.' },
                        ].map(s => (
                            <div key={s.season} className="bg-white border border-emerald-100 rounded-2xl p-6">
                                <div className="text-3xl mb-3">{s.emoji}</div>
                                <h3 className="font-black text-lg text-gray-900 mb-2">{s.season}</h3>
                                <p className="text-gray-600">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-10 text-center">FAQs — Azadpur Mandi Software</h2>
                    <div className="space-y-5">
                        {FAQS.map(f => (
                            <div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-[#f7fbf3]">
                                <h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3>
                                <p className="text-gray-700 font-medium leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Internal links */}
            <section className="py-12 px-6 bg-[#f0f7e8] border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Related Mandi Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/ghazipur-mandi-software', label: 'Ghazipur Mandi' },
                            { href: '/okhla-mandi-software', label: 'Okhla Mandi' },
                            { href: '/mandi-software-delhi', label: 'Delhi Mandi Software' },
                            { href: '/fruit-mandi-software', label: 'Fruit Mandi Software' },
                            { href: '/apple-mandi-software', label: 'Apple Mandi Software' },
                            { href: '/commission-agent-software', label: 'Commission Agent Software' },
                            { href: '/mandi-billing-software', label: 'Mandi Billing Software' },
                        ].map(l => (
                            <Link key={l.href} href={l.href} className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                                {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Azadpur Commission Agency</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Setup in 2 hours. Demo in Hindi. No credit card required.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
