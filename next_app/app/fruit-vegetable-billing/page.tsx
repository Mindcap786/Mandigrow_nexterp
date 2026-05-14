import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

/**
 * /fruit-vegetable-billing — SEO landing page
 * Target: "fruit billing software India" (720/mo) + "vegetable billing software" (650/mo)
 *         "fruit vegetable trader ERP" (480/mo) + "wholesale fruit vegetable software"
 */

export const metadata: Metadata = {
    title: 'Fruit & Vegetable Billing Software India | Wholesale Trader ERP — MandiGrow',
    description:
        'MandiGrow is India\'s #1 fruit and vegetable billing software for wholesale traders. Manage purchase bills, sales invoices, stock, GST, and payments on one cloud platform. Free trial.',
    keywords: [
        'fruit billing software India',
        'vegetable billing software',
        'fruit vegetable trader ERP',
        'wholesale fruit vegetable software',
        'fruit mandi billing software',
        'vegetable wholesale software India',
        'fruit vegetable ERP India',
        'perishable inventory software India',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/fruit-vegetable-billing' },
    openGraph: {
        title: 'Fruit & Vegetable Billing Software India | Trader ERP — MandiGrow',
        description:
            'Complete fruit and vegetable billing software for Indian wholesale traders — purchase bills, sales invoices, stock, GST in one cloud platform.',
        url: 'https://www.mandigrow.com/fruit-vegetable-billing',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is the best fruit billing software in India?',
        a: 'MandiGrow is the best fruit billing software in India for wholesale traders and commission agents. It is built specifically for the fruits and vegetable trade — handling lots, grades, varieties, weight, commission, market fees and GST natively. Unlike Tally or Zoho, MandiGrow was designed from Day 1 for the mandi.',
    },
    {
        q: 'Does MandiGrow support perishable inventory tracking?',
        a: 'Yes. MandiGrow tracks perishable inventory in real time — by variety, grade, lot, and warehouse location. Auto-valuation accounts for weight loss and wastage. Stock positions update instantly with every purchase or sale.',
    },
    {
        q: 'Is MandiGrow a good vegetable billing software for wholesale traders?',
        a: 'Yes. MandiGrow is specifically built for vegetable wholesale traders — supporting purchase bills from farmers, sales invoices to buyers, and multi-variety stock tracking across locations. GST, Mandi Tax, and commission are all automated.',
    },
    {
        q: 'Can MandiGrow handle multi-warehouse fruit and vegetable stock?',
        a: 'Yes. MandiGrow supports multi-location inventory tracking. If you operate across multiple godowns or market locations, your stock positions, valuations, and movements are visible in a single dashboard.',
    },
    {
        q: 'How is MandiGrow different from Tally for fruit and vegetable traders?',
        a: 'Tally is a general accounting tool. MandiGrow is purpose-built for the fruit and vegetable trade. MandiGrow handles lots, crates, weight, commission, hamali, palledari, market fees, mandi khata, and patti generation — all of which require custom workarounds in Tally. MandiGrow is the leading Tally alternative for mandi traders in India.',
    },
];

export default function FruitVegetableBillingPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 pt-20">
            <LandingHeader />

            {/* JSON-LD: FAQPage */}
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
                            { '@type': 'ListItem', position: 2, name: 'Fruit & Vegetable Billing Software', item: 'https://www.mandigrow.com/fruit-vegetable-billing' },
                        ],
                    }),
                }}
            />

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Fruit &amp; Vegetable Billing Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Fruit &amp; Vegetable Billing Software for Indian Wholesale Traders
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-4">
                    MandiGrow is India&apos;s #1 <strong>fruit and vegetable billing software</strong> for wholesale
                    traders, commission agents, and mandi operators. Manage purchase bills, sales invoices, perishable
                    stock tracking, GST compliance, and party payments — all in one cloud platform.
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mb-8">
                    <strong>Vegetable billing made fast:</strong> Scan crates, auto-calculate weights, and print
                    GST-compliant pattis in seconds. Works on Android mobile and desktop. Hindi and English. 14-day
                    free trial. No credit card.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">
                        Start Free Trial →
                    </Link>
                    <Link href="/login" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">
                        Book a Free Demo
                    </Link>
                </div>
            </section>

            {/* Complete Fruit & Vegetable Billing ERP */}
            <section className="bg-emerald-900 text-white py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                        Complete Fruit &amp; Vegetable Trader ERP — Everything in One Platform
                    </h2>
                    <p className="text-emerald-200 text-lg mb-10 max-w-3xl">
                        From the farm gate to the buyer invoice — MandiGrow handles every step of the fruit and
                        vegetable wholesale lifecycle without manual work or spreadsheets.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Wholesale Purchase Bills in Seconds', desc: 'Create farmer purchase bills by lot, weight, variety, and grade. Auto-deduct commission and market charges.' },
                            { title: 'Sales Invoices for Buyers', desc: 'Generate GST-compliant buyer invoices with auto-totals, tax breakdown, and WhatsApp PDF sharing.' },
                            { title: 'Real-Time Perishable Stock Tracking', desc: 'Track fruit and vegetable inventory by variety, grade, and lot in real time across all your locations.' },
                            { title: 'Auto-Valuation of Perishable Inventory', desc: 'Accounts for weight loss, wastage, and grade downgrades automatically. Your stock value is always accurate.' },
                            { title: 'GST &amp; Mandi Tax Compliance', desc: 'GST billing with Mandi Tax (Cess) compliance for AP, Telangana, Maharashtra, and Punjab. 1-click GSTR export.' },
                            { title: 'Multi-Warehouse Inventory', desc: 'Track fruit and vegetable stock across multiple godowns, cold stores, or market locations from one dashboard.' },
                        ].map(({ title, desc }) => (
                            <div key={title} className="p-6 bg-emerald-800/60 border border-emerald-700 rounded-3xl">
                                <h3 className="text-lg font-black mb-2 text-emerald-100" dangerouslySetInnerHTML={{ __html: title }} />
                                <p className="text-emerald-300 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose MandiGrow */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                    Built for Fruit &amp; Vegetable Trade — Not Adapted to It
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    Tally and Zoho Books were built for service businesses and retail shops. MandiGrow was built
                    specifically for the morning auction, the loading dock, and the khata at midnight. Lots, crates,
                    weight, wastage, commission, market fees, hamali, and palledari are all native — not bolted on
                    as an afterthought.
                </p>
                <p className="text-lg text-gray-700 mb-10">
                    That is why MandiGrow is the leading <strong>Tally alternative for mandi traders</strong> and
                    the smartest <strong>Zoho alternative for vegetable traders</strong> in India.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['Lot, crate & weight billing', 'Bill by lot, crate, carton, or kilogram. Auto-calculate totals for any fruit or vegetable variety.'],
                        ['Auto commission & market fee', 'Commission, hamali, palledari, and market fee — all calculated and posted on every sale automatically.'],
                        ['GST & e-invoicing ready', 'B2B and B2C invoices, GSTR-1 and GSTR-3B data ready with one click.'],
                        ['Hindi & 6 regional languages', 'Print bills in the language your buyers and farmers prefer — switch in one tap.'],
                        ['WhatsApp bill sharing', 'Share PDF bills directly to buyers and farmers on WhatsApp from inside the app.'],
                        ['Mobile + desktop, same data', 'Bill at the mandi gate on Android. Review from your office. Same account and data.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-[#f0f8e8] max-w-full px-6 py-16 border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                        Fruit &amp; Vegetable Billing Software — FAQ
                    </h2>
                    <div className="space-y-6">
                        {FAQ.map((f) => (
                            <div key={f.q} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                                <h3 className="text-lg font-black mb-2">{f.q}</h3>
                                <p className="text-gray-700 leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    Stop Fighting Tally. Start Billing the Mandi Way.
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    14-day free trial. No credit card. Live demo in Hindi or English.
                    The smartest fruit and vegetable billing software in India — free to try today.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg">
                        Start Free 14-Day Trial →
                    </Link>
                    <Link href="/sabji-billing-software" className="inline-block px-10 py-5 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition text-lg">
                        Also See: Sabji Billing Software
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
