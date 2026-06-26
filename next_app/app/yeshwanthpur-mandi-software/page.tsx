import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: "Yeshwanthpur Mandi Software — APMC ERP for Bangalore's Largest Vegetable Market | MandiGrow",
    description: "MandiGrow for Yeshwanthpur APMC Bangalore. Automate tomato, potato, onion billing in Kannada, Karnataka 1.5% APMC levy, farmer Patti. Free trial.",
    keywords: ['Yeshwanthpur mandi software', 'Bangalore APMC ERP', 'Yeshwanthpur vegetable market software', 'Kannada mandi billing', 'commission agent software Bangalore', 'Karnataka APMC software'],
    alternates: { canonical: 'https://www.mandigrow.com/yeshwanthpur-mandi-software' },
    openGraph: {
        title: 'Yeshwanthpur Mandi Software — MandiGrow Kannada APMC ERP',
        description: "Best mandi ERP for Yeshwanthpur APMC Bangalore. Kannada billing, 1.5% Market Fee auto-calculation, farmer Patti in seconds.",
        url: 'https://www.mandigrow.com/yeshwanthpur-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best software for Yeshwanthpur APMC Bangalore?', a: "MandiGrow is the highest-rated mandi ERP for Yeshwanthpur APMC commission agents. It handles tomato, potato, and onion billing in Kannada with auto commission calculation, digital Khata, and Karnataka APMC market fee auto-deduction (1.5%). Farmer Pattis are generated in Kannada in under 5 seconds — the only mandi ERP with genuine Kannada thermal print support." },
    { q: 'Does MandiGrow support Kannada billing for Yeshwanthpur traders?', a: "Yes. MandiGrow natively supports Kannada script for all farmer Pattis (Bikri), buyer Parchas, and account statements. Thermal printing in Kannada requires a standard Unicode-compatible thermal printer — no special hardware needed." },
    { q: "How does MandiGrow calculate Karnataka APMC Market Fee at Yeshwanthpur?", a: "MandiGrow is pre-configured with Karnataka APMC Act 1966 Market Fee at 1.5% on the sale value of agricultural produce. This is auto-applied on every Parcha and consolidated in the periodic APMC return without any manual calculation." },
];

export default function YeshwanthpurMandiSoftwarePage() {
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
                        🍅 Bengaluru · Yeshwanthpur APMC · Karnataka
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for<br /><span className="text-emerald-700">Yeshwanthpur APMC, Bengaluru</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the #1 mandi ERP for <strong>Yeshwanthpur APMC</strong> — Bangalore&apos;s largest regulated market. Automate tomato, potato, and onion billing in Kannada, calculate Karnataka APMC Market Fee (1.5%), and generate farmer Pattis in Kannada in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Kannada →
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm font-bold text-gray-600">
                        {['Free Setup', 'Kannada Support', 'APMC Auto-Levy', 'Fast Billing', 'Digital Khata'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-emerald-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-center mb-10">Yeshwanthpur APMC — Key Facts</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { stat: 'Largest', label: 'APMC in Karnataka', desc: "Yeshwanthpur is Karnataka's largest regulated agricultural market by turnover" },
                            { stat: 'Kannada', label: 'Primary Language', desc: 'MandiGrow fully supports Kannada billing and thermal printing' },
                            { stat: '1.5%', label: 'APMC Market Fee', desc: 'Karnataka APMC Act 1966 rate on the sale value of produce' },
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

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Karnataka APMC Charges — Auto-Calculated</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Charge</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Deposited To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">APMC Market Fee</td><td className="p-3 text-center font-bold">1.5%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Karnataka APMC</td></tr>
                                <tr><td className="p-3">Other levies (as notified)</td><td className="p-3 text-center font-bold">Varies</td><td className="p-3 text-center">Buyer/Seller</td><td className="p-3 text-center">Karnataka APMC</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Commission</td><td className="p-3 text-center font-bold">5–8%</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Loading charges</td><td className="p-3 text-center font-bold">₹3–6/bag</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Labour</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

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
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/mandi-software-karnataka', label: 'Karnataka Mandi' },
                            { href: '/mandi-software-bangalore', label: 'Bangalore Mandi' },
                            { href: '/bowenpally-mandi-software', label: 'Bowenpally Mandi' },
                            { href: '/tomato-mandi-software', label: 'Tomato Mandi Software' },
                            { href: '/vegetable-mandi-software', label: 'Vegetable Mandi Software' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Yeshwanthpur Commission Agency</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Kannada billing support. APMC-compliant. No credit card.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
