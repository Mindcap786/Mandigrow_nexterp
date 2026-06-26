import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Software Punjab | J-Form APMC Arhtiya ERP — MandiGrow',
    description: 'MandiGrow is the best mandi software for Punjab commission agents. J-Form billing, wheat and paddy arhtiya software with 3% Market Fee, RDF, and AIF auto-calculation. Free trial in Punjabi.',
    keywords: ['mandi software Punjab', 'J-Form billing software Punjab', 'Punjab arhtiya software', 'wheat paddy mandi ERP Punjab', 'Punjab APMC software', 'commission agent software Punjab'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-punjab' },
    openGraph: {
        title: 'Mandi Software Punjab — MandiGrow J-Form APMC ERP',
        description: "Best arhtiya software for Punjab mandis. J-Form auto-generation, 3% Market Fee + RDF + AIF calculation, Punjabi billing.",
        url: 'https://www.mandigrow.com/mandi-software-punjab',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best mandi software for Punjab arhatias?', a: "MandiGrow is the most trusted arhtiya software for Punjab commission agents. It handles wheat and paddy billing with J-Form generation, auto-calculation of Punjab Market Fee (3%), Rural Development Fund (3%), and Awaaz-e-Kissan cess (0.5%) on every transaction. Farmer Pattis are generated in Hindi and Punjabi." },
    { q: 'Does MandiGrow generate J-Forms for Punjab wheat procurement?', a: "Yes. MandiGrow automatically generates J-Form (Bikri Parchha) for every sale transaction in Punjab mandis. The form includes farmer details, commodity, Tulai weights, sale rate, all statutory deductions, and net payable to the farmer — fully compliant with Punjab Mandi Board requirements." },
    { q: 'What is the Punjab mandi tax rate in 2026?', a: "Punjab has one of the highest APMC tax structures in India: Market Fee (Mandi Shulk) at 3% of sale value, Rural Development Fund (RDF) at 3%, and Awaaz-e-Kissan Cess at 0.5% — a total buyer deduction of 6.5% on sale value. Arhat (commission) is typically 2.5% for grain. MandiGrow auto-calculates all of these on every transaction." },
];

const CITIES = ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Moga', 'Faridkot', 'Firozpur', 'Gurdaspur', 'Hoshiarpur', 'Nawanshahr'];

export default function MandiSoftwarePunjabPage() {
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
                        🌾 Punjab · J-Form APMC · Wheat &amp; Paddy
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Best Mandi Software for Punjab<br />
                        <span className="text-emerald-700">J-Form Arhtiya Software for Wheat &amp; Paddy</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the most trusted mandi software for Punjab commission agents (Arhtiyas). Auto-calculate Punjab Market Fee (3%), Rural Development Fund (3%), and Awaaz-e-Kissan Cess — and generate the mandatory <strong>J-Form</strong> for wheat and paddy procurement automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Punjabi →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Punjab Mandi Tax Structure 2026</h2>
                    <p className="text-gray-700 mb-6">Punjab has one of the highest APMC tax structures in India. MandiGrow auto-calculates all of the following on every transaction:</p>
                    <div className="overflow-x-auto mb-12">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Levy</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Basis</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Market Fee (Mandi Shulk)</td><td className="p-3 text-center font-bold">3%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Sale value</td></tr>
                                <tr><td className="p-3">Rural Development Fund (RDF)</td><td className="p-3 text-center font-bold">3%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Sale value</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Awaaz-e-Kissan / AIF</td><td className="p-3 text-center font-bold">0.5%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Sale value</td></tr>
                                <tr><td className="p-3 font-bold">Total Buyer Deduction</td><td className="p-3 text-center font-bold text-red-700">6.5%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Sale value</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Dami (Commission)</td><td className="p-3 text-center font-bold">2.5% (grain)</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Sale value</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4">J-Form: Punjab&apos;s Mandatory APMC Receipt — Auto-Generated</h2>
                    <p className="text-gray-700 mb-4">The J-Form (Bikri Parchha) is the mandatory sale receipt issued to every farmer after every transaction in a Punjab APMC mandi. MandiGrow auto-generates the J-Form including:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-10 space-y-2">
                        <li>Farmer name, village, and revenue district</li>
                        <li>Commodity, variety, and grade (Wheat: FAQ/Bold, Paddy: PR-126, Basmati)</li>
                        <li>Gross weight (Tulai) and net weight after bag deduction</li>
                        <li>Sale rate per quintal and gross sale value</li>
                        <li>All deductions: Market Fee (3%), RDF (3%), AIF (0.5%), Arhat (2.5%), Hamali, Tulai</li>
                        <li>Net amount payable to the farmer</li>
                        <li>Arhtiya GSTIN and J-Form serial number</li>
                    </ul>

                    <h2 className="text-3xl font-black text-gray-900 mb-4">Punjab Cities Served</h2>
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
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/j-form-billing-software', label: 'J-Form Billing Software' },
                            { href: '/anaj-mandi-software', label: 'Anaj Mandi Software' },
                            { href: '/commission-agent-software', label: 'Commission Agent Software' },
                            { href: '/mandi-software-uttar-pradesh', label: 'UP Mandi Software' },
                            { href: '/mandi-software-rajasthan', label: 'Rajasthan Mandi' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Punjab Mandi Nu Digital Banao</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Hindi + Punjabi support. J-Form compliant. Zero setup cost.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
