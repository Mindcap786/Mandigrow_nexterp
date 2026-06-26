import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Ghazipur Mandi Software — APMC ERP for Delhi Vegetable Yard | MandiGrow',
    description: "MandiGrow for Ghazipur Mandi Delhi. Handles 400+ trucks/day. Hindi commission billing, Delhi APMC Market Fee + Vikas Shulk, farmer Patti for potato, onion, tomato traders. Free trial.",
    keywords: ['Ghazipur mandi software', 'Delhi vegetable mandi ERP', 'Ghazipur APMC software', 'commission agent software Ghazipur', 'Hindi mandi billing software Delhi', 'potato onion mandi software Delhi'],
    alternates: { canonical: 'https://www.mandigrow.com/ghazipur-mandi-software' },
    openGraph: {
        title: 'Ghazipur Mandi Software — MandiGrow APMC ERP Delhi',
        description: "Best commission agent software for Ghazipur Mandi. Hindi billing, 400+ trucks/day capacity, Delhi APMC auto-levy.",
        url: 'https://www.mandigrow.com/ghazipur-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best software for Ghazipur Mandi commission agents?', a: "MandiGrow is the highest-rated mandi ERP for Ghazipur Mandi Delhi. It handles 400+ trucks per day with high-speed Hindi billing, auto commission calculation, and Delhi APMC levy auto-deduction. Farmer Pattis for UP potato and onion farmers are generated in Hindi in under 5 seconds." },
    { q: 'Does MandiGrow handle potato and onion billing at Ghazipur?', a: "Yes. MandiGrow natively handles bag-based billing (standard 50 kg bags) for potato and onion. Lot-level tracking, rate-per-bag entry, and automatic calculation of Arhat, Hamali, and net farmer payable are all built in — with no additional configuration needed." },
    { q: 'What Delhi APMC charges does MandiGrow auto-calculate?', a: "MandiGrow auto-calculates Delhi APMC Market Fee (1% on sale value) and Vikas Shulk (2% on sale value) on every Parcha at Ghazipur. These are pre-configured per the Delhi APMC Act 1998 and require no manual input from your billing team." },
];

export default function GhazipurMandiSoftwarePage() {
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
                        🥔 Delhi · Ghazipur APMC · North India Vegetable Hub
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for<br /><span className="text-emerald-700">Ghazipur Mandi, East Delhi</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the most trusted APMC ERP for <strong>Ghazipur Mandi</strong> — East Delhi&apos;s primary vegetable distribution hub handling 400+ trucks per day. Automate potato, onion, and tomato commission billing in Hindi with Delhi APMC auto-levy.
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
                        {['Free Setup', 'Hindi Support', 'APMC Auto-Levy', 'Bag-Level Billing', 'Digital Khata'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-emerald-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-center mb-10">Ghazipur Mandi — Key Facts</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { stat: '400+', label: 'Trucks Per Day', desc: "Ghazipur handles East Delhi's vegetable distribution — one of India's busiest yards" },
                            { stat: 'Potato/Onion', label: 'Primary Commodities', desc: 'UP, MP, and Rajasthan supplies arrive daily at Ghazipur yard' },
                            { stat: '1% + 2%', label: 'Delhi APMC Levy', desc: 'Market Fee 1% + Vikas Shulk 2% auto-calculated by MandiGrow' },
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

            {/* Tax Table */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Delhi APMC Charges at Ghazipur — Auto-Calculated</h2>
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
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Commission (Vegetables)</td><td className="p-3 text-center font-bold">4–6%</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Tolai charges</td><td className="p-3 text-center font-bold">₹2–5/bag</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Labour</td></tr>
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

            {/* Related */}
            <section className="py-12 px-6 bg-white border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Related Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/azadpur-mandi-software', label: 'Azadpur Mandi' },
                            { href: '/okhla-mandi-software', label: 'Okhla Mandi' },
                            { href: '/mandi-software-delhi', label: 'Delhi Mandi Software' },
                            { href: '/onion-potato-mandi-software', label: 'Onion & Potato Software' },
                            { href: '/mandi-software-uttar-pradesh', label: 'UP Mandi Software' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Ghazipur Commission Agency</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Hindi billing. Delhi APMC-compliant. No credit card.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
