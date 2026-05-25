import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

export const metadata: Metadata = {
    title: 'Sabzi Mandi Software India | Vegetable & Fruit Mandi ERP — MandiGrow',
    description:
        'MandiGrow sabzi mandi software automates lot billing, commission, GST patti & digital khata for sabzi mandis in India. Used by commission agents & traders. Start free.',
    keywords: [
        'sabzi mandi software',
        'sabzi mandi software india',
        'vegetable mandi erp',
        'fruit mandi software',
        'commission agent software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/sabzi-mandi-software' },
    openGraph: {
        title: 'Sabzi Mandi Software India | Vegetable & Fruit Mandi ERP — MandiGrow',
        description: 'MandiGrow sabzi mandi software automates lot billing, commission, GST patti & digital khata for sabzi mandis in India. Used by commission agents & traders. Start free.',
        url: 'https://www.mandigrow.com/sabzi-mandi-software',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is sabzi mandi software?',
        a: 'Sabzi mandi software is an ERP system designed specifically for vegetable wholesale traders and commission agents. Unlike regular shop billing apps, it handles morning mandi workflows: lot billing, crate counting, instant weighment conversions, and auto-calculating mandi deductions like hamali and palledari.',
    },
    {
        q: 'Can I bill by crates or cartons instead of exact kilograms?',
        a: 'Yes. MandiGrow is built for the speed of the sabzi mandi. You can bill in standard units (e.g., 50 crates) and the software will automatically calculate the standard weight or total price without requiring line-by-line manual math.',
    },
    {
        q: 'Does it automatically post entries to the farmer’s khata?',
        a: 'Yes! When you generate a sabzi sale patti at the gate, MandiGrow automatically deducts your commission, market fee, and labor charges, and instantly credits the net payable amount to the farmer’s digital khata.',
    },
    {
        q: 'Is it available in Hindi?',
        a: 'Absolutely. We know the sabzi mandi runs on regional languages. MandiGrow supports Hindi natively for the interface, reports, and printed bills.',
    },
];

export default function SabziMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 pt-20">
            <LandingHeader />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: FAQ.map((f) => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: { '@type': 'Answer', text: f.a },
                        })),
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Sabzi Mandi Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Best Sabzi Mandi Software in India for Vegetable & Fruit Traders
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    Stop using generic accounting tools. MandiGrow sabzi mandi software automates lot billing, commission, GST patti & digital khata.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link
                        href="/subscribe"
                        className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition"
                    >
                        Start Free Trial →
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                    Bill by the Crate, Carton, or Kilogram
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    Vegetable wholesale doesn't happen strictly in clean kilograms. You buy in truckloads, auction in lots, and sell in crates. A generic ERP cannot handle this natively. MandiGrow lets you define your item metrics on the fly.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Why Sabzi Mandi Traders Choose MandiGrow
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['Lightning Fast Patti Creation', 'Create gate passes and sales pattis in under 5 seconds to keep the line moving.'],
                        ['Auto Commission & Hamali', 'Labor charges, market fees, and your arhtiya commission auto-deducted from the gross total.'],
                        ['Digital Farmer Khata', 'Paper bahis get lost. Your digital khata is live, secure, and tracks advance payments effortlessly.'],
                        ['Mobile App for Munims', 'Give field staff the Android app to punch entries at the lot without touching the office computer.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Comparison Table (AEO) */}
            <section className="py-20 px-6 bg-white border-t border-emerald-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-4 text-center">Sabzi Mandi Software vs Legacy Desktop Apps</h2>
                    <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto font-medium">Why are Sabzi Mandi merchants migrating from old desktop accounting tools to MandiGrow?</p>
                    
                    <div className="overflow-x-auto rounded-2xl border border-emerald-100 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-50 border-b border-emerald-100">
                                    <th className="p-4 font-black text-gray-900 w-1/3">Feature</th>
                                    <th className="p-4 font-black text-emerald-700 w-1/3 border-l border-emerald-100">MandiGrow Sabzi Software</th>
                                    <th className="p-4 font-black text-gray-500 w-1/3 border-l border-emerald-100">Legacy Desktop Apps</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50">
                                <tr>
                                    <td className="p-4 font-bold text-gray-800">Mobility & Access</td>
                                    <td className="p-4 text-emerald-700 font-medium border-l border-emerald-50">Android app for Munim at the gate + Web for the shop</td>
                                    <td className="p-4 text-gray-500 border-l border-emerald-50">Stuck on one desktop computer</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-gray-800">Language Support</td>
                                    <td className="p-4 text-emerald-700 font-medium border-l border-emerald-50">Hindi, Marathi, Telugu, Tamil Native UI</td>
                                    <td className="p-4 text-gray-500 border-l border-emerald-50">English only</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-gray-800">Crate (Jali) Tracking</td>
                                    <td className="p-4 text-emerald-700 font-medium border-l border-emerald-50">Dedicated crate ledger synced with party Khata</td>
                                    <td className="p-4 text-gray-500 border-l border-emerald-50">Manual tracking only</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-gray-800">Commission Deductions</td>
                                    <td className="p-4 text-emerald-700 font-medium border-l border-emerald-50">Auto-calculate Sabzi Arhat and Market Fee instantly</td>
                                    <td className="p-4 text-gray-500 border-l border-emerald-50">Needs external calculators</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-gray-800">Data Safety</td>
                                    <td className="p-4 text-emerald-700 font-medium border-l border-emerald-50">Cloud backups — indestructible even if PC breaks</td>
                                    <td className="p-4 text-gray-500 border-l border-emerald-50">Data lost if hard drive fails</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
