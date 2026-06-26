import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Bowenpally Mandi Software — #1 ERP for Hyderabad Vegetable Market | MandiGrow',
    description: 'MandiGrow is the top mandi ERP for Bowenpally APMC Hyderabad. Automate tomato, chilli, onion billing, farmer Patti in Telugu, Telangana APMC 1% levy. Free trial.',
    keywords: ['Bowenpally mandi software', 'Hyderabad APMC ERP', 'Bowenpally vegetable market software', 'Telugu mandi billing', 'commission agent software Hyderabad', 'Telangana APMC software'],
    alternates: { canonical: 'https://www.mandigrow.com/bowenpally-mandi-software' },
    openGraph: {
        title: 'Bowenpally Mandi Software — MandiGrow APMC ERP Hyderabad',
        description: 'Best mandi ERP for Bowenpally APMC commission agents. Telugu billing, auto APMC levy, farmer Patti in seconds.',
        url: 'https://www.mandigrow.com/bowenpally-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best software for Bowenpally APMC Hyderabad?', a: "MandiGrow is the highest-rated mandi ERP for Bowenpally APMC commission agents. It automates tomato, chilli, and onion billing in Telugu with auto commission deduction, digital Khata for farmers and buyers, and Telangana APMC levy auto-calculation. Farmer Pattis are generated in Telugu in under 5 seconds." },
    { q: 'Does MandiGrow support Telugu billing for Bowenpally traders?', a: "Yes. MandiGrow natively supports Telugu script for farmer Pattis (Bikri), buyer Parchas, and account statements. All reports and thermal prints are available in Telugu — making MandiGrow the only mandi ERP with genuine Telugu support for Bowenpally and Gudimalkapur mandis." },
    { q: 'How does MandiGrow handle Telangana APMC Market Fee at Bowenpally?', a: "MandiGrow is pre-configured with Telangana APMC Act 2017 rates — 1% Market Fee plus 0.5% cess on the sale value, payable by the buyer and deposited by the Arhtiya. These are auto-calculated on every Parcha without any manual input, and consolidated in the periodic APMC return." },
];

export default function BowenpallyMandiSoftwarePage() {
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
                        🍅 Hyderabad · Bowenpally APMC · Telangana
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for<br /><span className="text-emerald-700">Bowenpally Mandi, Hyderabad</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the #1 mandi ERP for <strong>Bowenpally APMC</strong> — Hyderabad&apos;s largest wholesale vegetable market. Automate tomato, chilli, and onion billing in Telugu, calculate Telangana APMC Market Fee (1%), and generate farmer Pattis in Telugu in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Telugu →
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm font-bold text-gray-600">
                        {['Free Setup', 'Telugu Support', 'APMC Auto-Levy', 'Fast Billing', 'Digital Khata'].map(b => (
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
                    <h2 className="text-2xl font-black text-center mb-10">Bowenpally APMC — Key Facts</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { stat: 'Largest', label: 'Veg Mandi in Hyderabad', desc: "Bowenpally APMC is Hyderabad's primary wholesale vegetable distribution center" },
                            { stat: 'Telugu', label: 'Primary Language', desc: 'MandiGrow fully supports Telugu billing and thermal printing' },
                            { stat: '1%', label: 'APMC Market Fee', desc: 'Telangana APMC Act 2017 rate on sale value' },
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
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Telangana APMC Charges — Auto-Calculated</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Charge</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Deposited To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Market Fee</td><td className="p-3 text-center font-bold">1%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Telangana APMC</td></tr>
                                <tr><td className="p-3">Cess on Market Fee</td><td className="p-3 text-center font-bold">0.5%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Telangana APMC</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Commission</td><td className="p-3 text-center font-bold">5–8% (Veg)</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Gunny charges</td><td className="p-3 text-center font-bold">₹2–4/bag</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Labour</td></tr>
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
                            { href: '/mandi-software-telangana', label: 'Telangana Mandi' },
                            { href: '/mandi-software-hyderabad', label: 'Hyderabad Mandi' },
                            { href: '/yeshwanthpur-mandi-software', label: 'Yeshwanthpur Mandi' },
                            { href: '/tomato-mandi-software', label: 'Tomato Mandi Software' },
                            { href: '/chilli-mandi-software', label: 'Chilli Mandi Software' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Bowenpally Commission Agency</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Telugu billing support. APMC-compliant from day one.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
