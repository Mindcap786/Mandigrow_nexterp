import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

export const metadata: Metadata = {
    title: 'Sabji Billing Software for Vegetable Traders | MandiGrow',
    description:
        'India\'s fastest sabji billing software. Bill by crate, carton, or weight in seconds. Auto-calculate commission, hamali, and manage digital khata for sabzi mandi traders.',
    keywords: [
        'sabji billing software',
        'sabzi mandi software',
        'vegetable billing software india',
        'vegetable mandi software',
        'sabzi mandi billing',
        'mandi erp software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/sabji-billing-software' },
    openGraph: {
        title: 'Sabji Billing Software for Vegetable Traders | MandiGrow',
        description:
            'Bill by crate, carton, or weight in seconds. Auto-calculate commission, hamali, and manage digital khata for sabzi mandi traders.',
        url: 'https://www.mandigrow.com/sabji-billing-software',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is sabji billing software?',
        a: 'Sabji billing software is an ERP system designed specifically for vegetable wholesale traders and commission agents. Unlike regular shop billing apps, it handles morning mandi workflows: lot billing, crate counting, instant weighment conversions, and auto-calculating mandi deductions like hamali and palledari.',
    },
    {
        q: 'Can I bill by crates or cartons instead of exact kilograms?',
        a: 'Yes. MandiGrow is built for the speed of the sabzi mandi. You can bill in standard units (e.g., 50 crates) and the software will automatically calculate the standard weight or total price without requiring line-by-line manual math.',
    },
    {
        q: 'Does it automatically post entries to the farmer’s khata?',
        a: 'Yes! When you generate a sabji sale patti at the gate, MandiGrow automatically deducts your commission, market fee, and labor charges, and instantly credits the net payable amount to the farmer’s digital khata.',
    },
    {
        q: 'Is it available in Hindi?',
        a: 'Absolutely. We know the sabzi mandi runs on regional languages. MandiGrow supports Hindi natively for the interface, reports, and printed bills, as well as English, Marathi, Telugu, Tamil, Kannada, and Malayalam.',
    },
    {
        q: 'Can I use it on my mobile phone at the mandi gate?',
        a: 'Yes. MandiGrow has a native Android app designed for offline-first entry. Your munim can stand at the truck, log the crates directly on their phone, and the main office computer syncs the data instantly to print the bill.',
    },
];

export default function SabjiBillingSoftwarePage() {
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Sabji Billing Software',
                                item: 'https://www.mandigrow.com/sabji-billing-software',
                            },
                        ],
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Sabji Billing Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Sabji Billing Software Built for the Morning Rush
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    Stop using shop accounting tools for mandi trade. MandiGrow is India's fastest sabji billing software — letting you scan, weigh, bill, and settle farmer khatas in seconds right at the gate.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link
                        href="/subscribe"
                        className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition"
                    >
                        Start Free Trial →
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition"
                    >
                        Book a Demo
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                    Bill by the Crate, Carton, or Kilogram
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    Vegetable wholesale doesn't happen strictly in clean kilograms. You buy in truckloads, auction in lots, and sell in crates. A generic ERP cannot handle this natively. MandiGrow lets you define your item metrics on the fly: sell 50 crates of tomatoes, let the system auto-estimate the weight, and generate the patti instantly.
                </p>
                <p className="text-lg text-gray-700">
                    Your munim can operate right from the mobile app, ensuring nothing is missed during peak 5 AM trading hours.
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
                        ['Hindi Language Support', 'Print bills and read ledgers in Hindi, English, and 5 other regional languages.'],
                        ['Wastage & Shortage Tracking', 'Easily account for rotten vegetables or weight loss in transit without breaking the accounting ledger.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Sabji Billing Software — FAQ
                </h2>
                <div className="space-y-6">
                    {FAQ.map((f) => (
                        <div key={f.q}>
                            <h3 className="text-lg font-black mb-2">{f.q}</h3>
                            <p className="text-gray-700">{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    Modernize Your Sabzi Mandi Operations Today
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    Take control of your inventory, billing, and farmer accounts with the smartest ERP in India.
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg"
                >
                    Start Your 14-Day Free Trial →
                </Link>
            </section>
            <LandingFooter />
        </main>
    );
}
