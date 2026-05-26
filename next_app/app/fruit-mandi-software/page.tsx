import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Fruit Mandi Software India — Fruit Billing & Commission Software | MandiGrow',
    description:
        'MandiGrow is India\'s best fruit mandi software. Manage fruit boxes, crates, lots, auto commission, and party khata for fruit traders and commission agents.',
    keywords: [
        'fruit mandi software India',
        'fruit mandi software',
        'fruit billing software',
        'apple mandi software',
        'mango billing software',
        'fruit commission agent software',
        'fruit wholesale software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/fruit-mandi-software' },
    openGraph: {
        title: 'Fruit Mandi Software India — Fruit Billing & Khata | MandiGrow',
        description:
            'Advanced billing, crate management, and khata for fruit mandi operators. Built for Indian fruit wholesale trade.',
        url: 'https://www.mandigrow.com/fruit-mandi-software',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'Why do I need a specific fruit mandi software?',
        a: 'Fruit wholesale involves selling by the box, tracking empty plastic crates (jalis), and calculating per-box commission and hamali. Standard accounting software cannot handle crate inventory or per-lot auction billing effectively. A dedicated fruit mandi software automates all of this.',
    },
    {
        q: 'Can this software manage empty crates (jalis) given to farmers?',
        a: 'Yes! MandiGrow tracks the issue and receipt of empty plastic crates. You always know exactly how many crates are outstanding with each farmer or buyer, directly visible on their khata ledger.',
    },
    {
        q: 'Does it support billing for apples, mangoes, and seasonal fruits?',
        a: 'Absolutely. Whether you are in the apple belts of Himachal, the mango markets of Maharashtra, or dealing in mixed seasonal fruits, the software adapts to your packaging units (boxes, crates, or quintals).',
    },
    {
        q: 'Can I generate buyer bills and farmer pattis on my mobile?',
        a: 'Yes. MandiGrow provides a dedicated Android app. You can enter arrivals, conduct auctions, and generate WhatsApp-ready pattis directly from your phone while standing in the mandi.',
    },
    {
        q: 'How does the software handle commission and mandi tax?',
        a: 'You simply set your commission percentage (e.g., 6% or 8%) and mandi tax rules once. During billing, the software automatically deducts the exact amount from the farmer\'s patti and adds it to your earnings.',
    },
];

export default function FruitMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#fefbf6] text-gray-900">
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
                                name: 'Fruit Mandi Software',
                                item: 'https://www.mandigrow.com/fruit-mandi-software',
                            },
                        ],
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-orange-700 font-black uppercase tracking-widest text-xs mb-4">
                    Fruit Wholesale Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Fruit Mandi Software for Indian Traders
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    MandiGrow is India's most advanced fruit mandi software. Designed specifically for fruit commission agents and traders who need to manage fast-moving lots, crate inventory, complex per-box commissions, and real-time party khata.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link
                        href="/subscribe"
                        className="px-8 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-lg hover:bg-orange-700 transition"
                    >
                        Start Free Trial →
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-4 bg-white text-orange-800 font-black rounded-2xl border border-orange-200 hover:bg-orange-50 transition"
                    >
                        Book a Demo
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-orange-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                    Master Your Fruit Wholesale Operations
                </h2>
                <div className="prose prose-lg text-gray-700 max-w-none">
                    <p>
                        Running a fruit mandi operation requires precision. Fruit is highly perishable, and auction prices fluctuate by the minute. Your software needs to keep up. That's why fruit traders across the country are upgrading to specialized <strong>fruit mandi software</strong>.
                    </p>
                    <p>
                        With MandiGrow, you get real-time <Link href="/mandi-khata-software" className="text-orange-600 font-bold hover:underline">Mandi Khata software</Link> features integrated directly into your billing flow. This means when an auction finishes, the farmer's ledger, the buyer's outstanding balance, and your commission accounts update instantly.
                    </p>
                    <p>
                        Beyond standard accounting, our system excels at what fruit traders need most: managing plastic crates (jalis). Crate loss eats into your margins. MandiGrow tracks exactly how many crates are issued and returned per party.
                    </p>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-orange-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Why Fruit Commission Agents Choose MandiGrow
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white border border-orange-100 rounded-3xl shadow-sm">
                        <h3 className="text-xl font-black mb-2">Crate & Box Tracking</h3>
                        <p className="text-gray-600">Track plastic crates issued to farmers and buyers. Prevent inventory loss.</p>
                    </div>
                    <div className="p-6 bg-white border border-orange-100 rounded-3xl shadow-sm">
                        <h3 className="text-xl font-black mb-2">Per-Box Commission</h3>
                        <p className="text-gray-600">Calculate commission, hamali, and market cess per box or as a percentage instantly.</p>
                    </div>
                    <div className="p-6 bg-white border border-orange-100 rounded-3xl shadow-sm">
                        <h3 className="text-xl font-black mb-2">Live Ledger Sync</h3>
                        <p className="text-gray-600">Reconcile payments faster. See who owes you money with live <Link href="/commission-agent-software" className="text-orange-600 hover:underline">commission agent ledgers</Link>.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-orange-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Fruit Mandi Software — Frequently Asked Questions
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
                    Ready to modernize your fruit mandi?
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    Take control of your billing, crates, and commission with the best software in India. Or check out our <Link href="/sabzi-mandi-software" className="text-orange-600 font-bold hover:underline">sabzi mandi software</Link> features.
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-10 py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl hover:bg-orange-700 transition text-lg"
                >
                    Get Started Free →
                </Link>
            </section>
        </main>
    );
}
