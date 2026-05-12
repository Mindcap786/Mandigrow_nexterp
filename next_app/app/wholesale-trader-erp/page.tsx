import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Wholesale Market ERP India — Fruit & Vegetable Trader ERP Software | MandiGrow',
    description:
        'MandiGrow is India\'s leading wholesale market ERP for fruit and vegetable traders. Manage bulk purchase bills, buyer collections, inventory valuation, and GST in one place. Free trial.',
    keywords: [
        'wholesale market ERP India',
        'fruit vegetable trader ERP',
        'wholesale trader software India',
        'sabzi mandi wholesale software',
        'fruit vegetable accounting software',
        'wholesale ERP for mandis',
        'bulk billing software fruit vegetable',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/wholesale-trader-erp' },
    openGraph: {
        title: 'Wholesale Market ERP India — Fruit & Vegetable Trader ERP | MandiGrow',
        description:
            'Bulk purchase bills, buyer collections, inventory valuation, and GST — built for wholesale fruit & vegetable traders across India.',
        url: 'https://www.mandigrow.com/wholesale-trader-erp',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is wholesale market ERP software?',
        a: 'Wholesale market ERP software is a purpose-built platform for fruit and vegetable wholesale traders. It manages bulk purchase bills, buyer invoicing, inventory lot tracking, party ledgers, and GST filing — all in one system.',
    },
    {
        q: 'How is MandiGrow different from Tally for wholesale traders?',
        a: 'Tally is a general ledger tool. MandiGrow is built for wholesale mandi trade — it understands lots, crates, weights, and mandi-specific deductions like hamali and palledari natively, without custom plugins or workarounds.',
    },
    {
        q: 'Can MandiGrow handle large volumes of daily transactions?',
        a: 'Yes. MandiGrow is designed for high-volume mandi operations. It processes hundreds of sale and purchase bills per day with real-time inventory updates and instant ledger posting.',
    },
    {
        q: 'Does it support multi-party buyer collections?',
        a: 'Yes. MandiGrow\'s receivables module shows all outstanding buyer balances at a glance, lets you record payments in bulk, and generates collection summaries for any date range.',
    },
    {
        q: 'Can I track inventory lot-wise for different commodities?',
        a: 'Yes. Every purchase arrival creates a lot. You can track inventory commodity-wise, lot-wise, and location-wise, with real-time stock status updates as sales are recorded.',
    },
];

export default function WholesaleTraderErpPage() {
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
                                name: 'Wholesale Trader ERP',
                                item: 'https://www.mandigrow.com/wholesale-trader-erp',
                            },
                        ],
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Wholesale Market ERP · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Wholesale Market ERP for Fruit &amp; Vegetable Traders in India
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    MandiGrow is the only wholesale ERP built natively for Indian mandi trade. Bulk purchase
                    bills, buyer collections, lot-wise inventory, and GST filing — without Excel sheets or
                    custom Tally plugins. Mobile-ready. Hindi and English.
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
                    Why Generic ERP Fails Wholesale Mandi Traders
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    SAP, Tally, and Zoho are designed for factories and retail stores. Wholesale mandi trade
                    is different — you buy by lot, sell by crate, deduct hamali and market fee, and need
                    party balances updated before the truck leaves the gate. Generic ERP was never built
                    for this.
                </p>
                <p className="text-lg text-gray-700">
                    MandiGrow is. Every screen, every form, and every report was designed for the way
                    wholesale fruit and vegetable traders actually work — from gate entry to daily closing.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Bulk Billing, Lot Tracking &amp; Buyer Collections in One App
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['Bulk purchase bill entry', 'Record multi-commodity, multi-supplier purchase arrivals in seconds.'],
                        ['Lot-wise inventory tracking', 'Track every lot from gate entry to final sale with real-time stock balance.'],
                        ['Buyer invoicing & collections', 'Generate sale invoices and track outstanding collections by party.'],
                        ['Weight & crate management', 'Bill by kg, quintal, crate, or bag — MandiGrow converts between them automatically.'],
                        ['GST + e-invoicing', 'GSTR-1 and GSTR-3B data ready in one click. B2B and B2C billing supported.'],
                        ['Profit & loss per lot', 'See exact margin per commodity, per lot, per day — no spreadsheets needed.'],
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
                    Wholesale Trader ERP — Frequently Asked Questions
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
                    The Wholesale ERP Built for Indian Mandis
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
