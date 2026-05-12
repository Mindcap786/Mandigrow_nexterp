import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Sabzi Mandi Software — Fruit & Vegetable Mandi Billing Software India | MandiGrow',
    description:
        'MandiGrow is India\'s best sabzi mandi software for fruit and vegetable billing, commission, and khata management. Used by mandi operators across India. Free 14-day trial.',
    keywords: [
        'sabzi mandi software',
        'sabzi mandi billing software',
        'fruit mandi billing software',
        'vegetable mandi software India',
        'fruit vegetable billing software',
        'mandi billing software',
        'sabji mandi software',
        'phul gobhi mandi software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/sabzi-mandi-software' },
    openGraph: {
        title: 'Sabzi Mandi Software — Fruit & Vegetable Billing Software India | MandiGrow',
        description:
            'Billing, commission, and khata for sabzi mandi operators across India. Built for the way fruit and vegetable trade actually works.',
        url: 'https://www.mandigrow.com/sabzi-mandi-software',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is sabzi mandi software?',
        a: 'Sabzi mandi software is a billing and accounting system built specifically for fruits and vegetables wholesale markets. It handles lot-based buying, daily auction sales, commission calculation, market fees, and party ledgers — replacing paper bahis and manual registers.',
    },
    {
        q: 'Does MandiGrow work for all types of sabzi mandis?',
        a: 'Yes. MandiGrow works for commission-based mandis (where the agent auctions farmer produce), direct purchase mandis (where the trader buys and sells directly), and mixed operations. It adapts to your billing model.',
    },
    {
        q: 'Can I print daily auction sheets and pattis?',
        a: 'Yes. MandiGrow generates daily auction sheets, party-wise pattis, and weight slips (katchi parchi) ready to print or share on WhatsApp. Hindi and English formats are both available.',
    },
    {
        q: 'What is the price of MandiGrow sabzi mandi software?',
        a: 'MandiGrow starts with a free 14-day trial requiring no credit card. Paid plans start from ₹999/month for small operations. Enterprise plans for large mandis and multi-branch operations are available on request.',
    },
    {
        q: 'Does MandiGrow support mobile phones for gate entry and billing?',
        a: 'Yes. MandiGrow is fully mobile-responsive and has a dedicated Android app. Your staff at the gate can record arrivals and your accountant can generate bills from the office — on the same live data.',
    },
];

export default function SabziMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
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
                                name: 'Sabzi Mandi Software',
                                item: 'https://www.mandigrow.com/sabzi-mandi-software',
                            },
                        ],
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Sabzi Mandi Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Sabzi Mandi Software — Fruit &amp; Vegetable Billing for Indian Mandis
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    MandiGrow is the most complete sabzi mandi software in India. Built for the daily
                    reality of fruit and vegetable trade — lot arrivals at 5 AM, live auctions, commission
                    calculation, patti generation, and party khata — all in one app, in Hindi and English.
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
                    Daily Auction, Patti Generation &amp; Party Khata in One App
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    The sabzi mandi day starts before sunrise. Trucks arrive, weights are recorded, lots
                    are created, auctions happen, and bills need to be ready before the buyer leaves.
                    MandiGrow is the only mandi software that keeps up — gate entry to final patti in
                    minutes, not hours.
                </p>
                <p className="text-lg text-gray-700">
                    Every party — farmer, buyer, transporter — has a live khata that updates the moment
                    you save an entry. No reconciliation at night. No errors from manual copying.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Complete Sabzi Mandi Features — Nothing Missing
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['Gate entry & lot creation', 'Record vehicle arrivals, weight slips, and lot numbers at the gate.'],
                        ['Live auction & rate entry', 'Record auction rates as bidding happens. Auto-calculate total sale value.'],
                        ['Patti (bill) generation', 'Generate farmer pattis with all deductions in seconds. Print or WhatsApp.'],
                        ['Auto commission & market fee', 'Commission, Mandi Cess, hamali, and palledari auto-calculated on every sale.'],
                        ['Buyer billing & udhar', 'Invoice buyers and track credit. Party balances updated in real time.'],
                        ['Daily closing report', 'End-of-day summary of all arrivals, sales, collections, and outstanding.'],
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
                    Sabzi Mandi Software — Frequently Asked Questions
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
                    The Sabzi Mandi Software Trusted Across India
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    14-day free trial. No credit card. Live demo in Hindi or English.
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg"
                >
                    Start Free Trial →
                </Link>
            </section>
        </main>
    );
}
