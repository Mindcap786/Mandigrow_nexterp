import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Okhla Mandi Software — APMC ERP for South Delhi Produce Market | MandiGrow',
    description: "MandiGrow for Okhla Mandi Delhi. Automate F&V commission billing, exotic produce import tracking, Hindi APMC levy, farmer Patti, and GST. Free trial.",
    keywords: ['Okhla mandi software', 'South Delhi mandi ERP', 'Okhla APMC software', 'commission agent software Okhla', 'Hindi mandi billing Delhi', 'exotic produce mandi software Delhi'],
    alternates: { canonical: 'https://www.mandigrow.com/okhla-mandi-software' },
    openGraph: {
        title: 'Okhla Mandi Software — MandiGrow APMC ERP South Delhi',
        description: "Best commission agent software for Okhla Mandi. Hindi billing, exotic produce tracking, Delhi APMC auto-levy.",
        url: 'https://www.mandigrow.com/okhla-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is the best software for Okhla Mandi commission agents?', a: "MandiGrow is the highest-rated mandi ERP for Okhla Mandi commission agents. It handles domestic and imported fruit billing with box-level lot tracking, auto commission calculation, Delhi APMC levy auto-deduction, and export-related documentation support. Farmer Pattis and buyer invoices are generated in Hindi in seconds." },
    { q: 'Can MandiGrow handle exotic and imported produce billing at Okhla?', a: "Yes. MandiGrow handles imported fruit billing with custom unit types (boxes, crates, cartons). For produce sourced from importers rather than farmers, the party master supports both farm supplier and import agent profiles. GST-compliant invoices are generated with the correct HSN codes for imported vs domestic produce." },
    { q: 'Does MandiGrow support exporter billing at Okhla Mandi?', a: "Yes. MandiGrow supports zero-rated export billing with LUT (Letter of Undertaking) compliance. Buyer invoices to exporters are marked as export supplies, and the data feeds directly into the GSTR-1 zero-rated supply tables. No additional accounting adjustments needed." },
];

export default function OkhlaMandiSoftwarePage() {
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
                        🥬 South Delhi · Okhla APMC · F&amp;V Distribution
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for<br /><span className="text-emerald-700">Okhla Mandi, South Delhi</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow is the most trusted APMC ERP for <strong>Okhla Mandi</strong> — South Delhi&apos;s key wholesale fruit and vegetable distribution yard. Handle exotic produce, high-end F&amp;V lots, and exporter billing with auto Delhi APMC levy and Hindi Pattis.
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
                        {['Free Setup', 'Hindi Support', 'APMC Auto-Levy', 'Export Billing', 'Digital Khata'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-emerald-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-center mb-10">Okhla Mandi — Key Facts</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { stat: 'South Delhi', label: 'Distribution Hub', desc: "Okhla serves south Delhi retail trade and export supply chains" },
                            { stat: 'Exotic Produce', label: 'Key Specialty', desc: 'Imported fruits, exotic vegetables, and premium produce handled at Okhla' },
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

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">Delhi APMC Charges at Okhla — Auto-Calculated</h2>
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
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Commission (Fruit)</td><td className="p-3 text-center font-bold">6–8%</td><td className="p-3 text-center">Farmer/Importer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Loading</td><td className="p-3 text-center font-bold">₹3–6/box</td><td className="p-3 text-center">Farmer/Importer</td><td className="p-3 text-center">Labour</td></tr>
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
                            { href: '/azadpur-mandi-software', label: 'Azadpur Mandi' },
                            { href: '/ghazipur-mandi-software', label: 'Ghazipur Mandi' },
                            { href: '/mandi-software-delhi', label: 'Delhi Mandi Software' },
                            { href: '/fruit-mandi-software', label: 'Fruit Mandi Software' },
                            { href: '/commission-agent-software', label: 'Commission Agent Software' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Okhla Commission Agency</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Hindi billing. Export-compliant. No credit card.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
