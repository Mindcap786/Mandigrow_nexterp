import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Software Karnataka | APMC ERP for Bengaluru, Hubli & Davangere | MandiGrow',
    description: "MandiGrow is the best mandi software for Karnataka APMC commission agents. Kannada billing, 1.5% Market Fee auto-calculation. Bengaluru, Hubli, Davangere. Free trial.",
    keywords: ['mandi software Karnataka', 'APMC ERP Karnataka', 'Kannada mandi billing software', 'commission agent software Bengaluru', 'Karnataka APMC software', 'Yeshwanthpur mandi software'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-karnataka' },
    openGraph: {
        title: 'Mandi Software Karnataka — MandiGrow Kannada APMC ERP',
        description: "Best APMC software for Karnataka commission agents. Kannada billing, 1.5% auto-levy, Bengaluru, Hubli, Davangere.",
        url: 'https://www.mandigrow.com/mandi-software-karnataka',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best mandi software for Karnataka commission agents?', a: "MandiGrow is the top-rated APMC ERP for Karnataka commission agents. It supports Kannada billing, auto-calculates Karnataka APMC Market Fee (1.5%), and generates farmer Pattis in Kannada — the only mandi software with genuine Kannada thermal print support. Used in Bengaluru (Yeshwanthpur), Hubli, Davangere, and Mysuru mandis." },
    { q: 'What is the APMC market fee rate in Karnataka in 2026?', a: "Karnataka APMC Market Fee under the Karnataka Agricultural Produce Marketing (Regulation) Act 1966 is 1.5% of the sale value of agricultural produce, paid by the buyer. MandiGrow auto-calculates this on every Parcha and includes it in the periodic APMC return." },
    { q: 'Does MandiGrow support Kannada language billing for Karnataka farmers?', a: "Yes. MandiGrow natively supports Kannada script for all farmer Pattis (Bikri), buyer Parchas, and account statements. Thermal printing in Kannada requires a Unicode-compatible thermal printer (available from Rs. 2,500 onwards). MandiGrow is the only purpose-built mandi ERP with native Kannada support." },
];

const CITIES = ['Bengaluru (Yeshwanthpur)', 'Hubli', 'Davangere', 'Mysuru', 'Mangaluru', 'Belagavi', 'Shivamogga', 'Vijayapura', 'Ballari', 'Raichur', 'Kalaburagi'];

export default function MandiSoftwareKarnatakaPage() {
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
                        🥦 Karnataka · APMC Act 1966 · Kannada Billing
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Best Mandi Software for Karnataka<br />
                        <span className="text-emerald-700">Kannada APMC ERP for Commission Agents</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is Karnataka&apos;s most trusted APMC ERP for commission agents. Auto-calculate Karnataka Market Fee (1.5%), generate farmer Pattis in <strong>Kannada</strong>, and manage digital Khata for tomato, onion, potato, and grain traders in Bengaluru, Hubli, and Davangere.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Kannada →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Karnataka APMC Tax Structure 2026</h2>
                    <div className="overflow-x-auto mb-12">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Levy</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">APMC Market Fee</td><td className="p-3 text-center font-bold">1.5%</td><td className="p-3 text-center">Buyer</td></tr>
                                <tr><td className="p-3">Arhat / Commission</td><td className="p-3 text-center font-bold">4–8%</td><td className="p-3 text-center">Farmer</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Hamali charges</td><td className="p-3 text-center font-bold">₹3–6/bag</td><td className="p-3 text-center">Farmer</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Karnataka Cities Served by MandiGrow</h2>
                    <div className="flex flex-wrap gap-3">
                        {CITIES.map(c => (
                            <span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>
                        ))}
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
                    <h2 className="text-xl font-black text-gray-900 mb-4">Related Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/yeshwanthpur-mandi-software', label: 'Yeshwanthpur Mandi' },
                            { href: '/mandi-software-bangalore', label: 'Bangalore Mandi' },
                            { href: '/mandi-software-telangana', label: 'Telangana Mandi' },
                            { href: '/commission-agent-software', label: 'Commission Agent Software' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Ready to Digitize Your Karnataka Mandi?</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Kannada billing support. Zero setup cost. Under 2 hours setup.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
