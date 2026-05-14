import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

/**
 * /sabji-billing-software — high-value SEO landing page
 * Target: "sabji billing software" (880/mo) + "sabzi mandi billing" (880/mo)
 * Competition: Easy. Only legacy desktop apps rank here. MandiGrow is cloud + mobile.
 */

export const metadata: Metadata = {
    title: 'Sabji Billing Software India | Sabzi Mandi Billing — MandiGrow',
    description:
        'MandiGrow sabji billing software automates lot billing, weight entry, commission, GST and digital mandi khata for sabzi mandi traders and commission agents in India. Free 14-day demo.',
    keywords: [
        'sabji billing software',
        'sabzi mandi software',
        'sabji mandi billing software',
        'sabzi mandi billing',
        'vegetable billing software India',
        'sabji mandi khata',
        'sabzi billing app India',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/sabji-billing-software' },
    openGraph: {
        title: 'Sabji Billing Software India | Sabzi Mandi Billing — MandiGrow',
        description:
            'India\'s fastest sabji billing software — lot billing, commission, hamali, GST patti in seconds. Built for sabzi mandi traders. Free trial.',
        url: 'https://www.mandigrow.com/sabji-billing-software',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'What is sabji billing software?',
        a: 'Sabji billing software is a purpose-built billing and accounting tool for sabzi mandi traders, vegetable commission agents, and fruit & vegetable wholesalers. Unlike general billing tools, it handles lots, crates, weight, sabji varieties, hamali, palledari, and mandi khata natively — exactly the way traders work at the mandi gate every day.',
    },
    {
        q: 'How fast can I generate a sabji bill in MandiGrow?',
        a: 'MandiGrow generates a complete GST-compliant sabji sale bill in under 10 seconds. Enter the sabji variety, lot, weight, and rate — commission, hamali, palledari, and market fee are auto-calculated and the digital patti is ready instantly.',
    },
    {
        q: 'Does MandiGrow sabji billing software work in Hindi?',
        a: 'Yes. MandiGrow generates bills, pattis, and reports in Hindi, Telugu, Kannada, Tamil, Malayalam, Marathi, and English. Switch language with one tap. Your sabji buyers and farmers can receive bills in their preferred language.',
    },
    {
        q: 'Can MandiGrow sabji billing software work offline?',
        a: 'Yes. MandiGrow works on Android mobile phones even with limited connectivity. Bill your sabji buyers at the mandi gate without waiting for internet. Data syncs automatically when connectivity is restored.',
    },
    {
        q: 'Is MandiGrow sabji billing GST compliant?',
        a: 'Yes. MandiGrow generates GST-compliant invoices for sabji trade, supports B2B and B2C billing, and produces ready-to-use data for GSTR-1 and GSTR-3B. Mandi Tax (Cess) for Andhra Pradesh, Telangana, Maharashtra, and Punjab is also supported.',
    },
];

export default function SabjiBillingSoftwarePage() {
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
            {/* JSON-LD: BreadcrumbList */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                            { '@type': 'ListItem', position: 2, name: 'Sabji Billing Software', item: 'https://www.mandigrow.com/sabji-billing-software' },
                        ],
                    }),
                }}
            />
            {/* JSON-LD: SoftwareApplication */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'MandiGrow Sabji Billing Software',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Android, Web',
                        offers: { '@type': 'Offer', price: '999', priceCurrency: 'INR' },
                        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '120' },
                    }),
                }}
            />

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    Sabji Billing Software · India #1
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Sabji Billing Software for Indian Mandi &amp; Vegetable Markets
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-4">
                    MandiGrow is India&apos;s most complete <strong>sabji billing software</strong> — built for vegetable
                    traders who need fast, accurate lot billing at the mandi gate. Generate GST-compliant bills in
                    under 10 seconds. Auto-calculate commission, hamali, and palledari. Maintain digital mandi khata
                    for every farmer and buyer.
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mb-8">
                    Works on Android mobile + web browser. Hindi, Telugu, and 6 regional languages. 14-day free trial.
                    No credit card required.
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

            {/* Why MandiGrow is the Best Sabzi Mandi Software */}
            <section className="bg-emerald-900 text-white py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                        Why MandiGrow is the Best Sabzi Mandi Software in India
                    </h2>
                    <p className="text-emerald-200 text-lg mb-10 max-w-3xl">
                        Most billing software was built for shops and offices. MandiGrow was built specifically for
                        the sabzi mandi — the auction floor, the crate counting, the morning rush. Every feature
                        reflects how your mandi actually works.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'Lot & Crate Billing in Seconds', desc: 'Bill by lot, crate, carton, or kilogram. Auto-calculate totals for every sabji variety with a single entry.' },
                            { title: 'Auto Commission & Mandi Charges', desc: 'Commission, hamali, palledari, and market fee are auto-calculated and posted to the right ledger — no manual work.' },
                            { title: 'Digital Mandi Khata Software', desc: 'Every farmer and buyer gets a real-time digital khata. Track advances, payments, and credits instantly. No paper bahis.' },
                            { title: 'GST-Compliant Patti Generation', desc: 'Generate GST-compliant pattis and invoices in Hindi or English. WhatsApp share directly from the app.' },
                            { title: 'Works on Android Mobile', desc: 'Bill at the mandi gate on your Android phone. Full offline capability — syncs when internet is available.' },
                            { title: 'Sabji Mandi Khata for Farmers', desc: 'Maintain party-wise accounts for every farmer in the region. One-click batch settlement for multiple farmers.' },
                        ].map(({ title, desc }) => (
                            <div key={title} className="p-6 bg-emerald-800/60 border border-emerald-700 rounded-3xl">
                                <h3 className="text-lg font-black mb-2 text-emerald-100">{title}</h3>
                                <p className="text-emerald-300 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Complete Sabji Billing Software Feature Set */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                    Complete Sabji Billing Software — Every Feature Your Mandi Needs
                </h2>
                <p className="text-lg text-gray-700 mb-10">
                    From the morning gate entry to the evening settlement — MandiGrow handles the complete billing
                    lifecycle for your sabzi mandi without any manual calculations or paper.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['Sabji lot billing with crate & weight entry', 'Bill by lot, crate, carton, or kilogram. Auto-calculate totals instantly at the mandi gate.'],
                        ['Commission, hamali & palledari auto-calculated', 'Every deduction calculated and posted automatically on every sabji sale — no manual journal vouchers.'],
                        ['GST-compliant patti & invoice generation', 'B2B and B2C invoices ready for GSTR-1 and GSTR-3B. Mandi Tax (Cess) auto-calculated.'],
                        ['Hindi & 6 regional languages', 'Print bills and pattis in the language your sabji buyers and farmers prefer. Switch with one tap.'],
                        ['WhatsApp bill sharing', 'Share PDF bills and pattis directly to buyers and farmers on WhatsApp from the app — instantly.'],
                        ['Mobile + Desktop — same data', 'Bill at the mandi gate on Android. Review reports from your office. Same account, same real-time data.'],
                        ['Digital khata for every party', 'Every farmer, buyer, and trader gets a real-time balance. No paper bahi, no end-of-day reconciliation.'],
                        ['Offline billing support', 'Works on Android without internet. Bill during connectivity outages. Syncs automatically when connected.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sabji Mandi Software vs Competitors */}
            <section className="bg-[#f0f8e8] py-16 px-6 border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                        MandiGrow vs Other Sabji Billing Software in India
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-700 text-white">
                                    <th className="p-4 text-left rounded-tl-2xl font-black">Feature</th>
                                    <th className="p-4 text-center font-black">MandiGrow</th>
                                    <th className="p-4 text-center font-black">Legacy Desktop Apps</th>
                                    <th className="p-4 text-center rounded-tr-2xl font-black">Generic Billing Apps</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Built for Sabzi Mandi', '✅ Yes', '⚠️ Partial', '❌ No'],
                                    ['Works on Android Mobile', '✅ Yes', '❌ No', '✅ Yes'],
                                    ['Auto Commission & Hamali', '✅ Yes', '⚠️ Manual', '❌ No'],
                                    ['GST + Mandi Tax (Cess)', '✅ Yes', '⚠️ Partial', '⚠️ GST Only'],
                                    ['Hindi & Regional Languages', '✅ 7 Languages', '⚠️ Hindi Only', '⚠️ 2–3 Lang'],
                                    ['WhatsApp Bill Sharing', '✅ Yes', '❌ No', '✅ Yes'],
                                    ['Cloud — No Data Loss', '✅ Yes', '❌ Local only', '✅ Yes'],
                                    ['Digital Mandi Khata', '✅ Yes', '⚠️ Basic', '❌ No'],
                                ].map(([feat, mg, legacy, gen], i) => (
                                    <tr key={feat} className={i % 2 === 0 ? 'bg-white' : 'bg-emerald-50'}>
                                        <td className="p-4 font-bold text-gray-700">{feat}</td>
                                        <td className="p-4 text-center text-emerald-700 font-bold">{mg}</td>
                                        <td className="p-4 text-center text-gray-500">{legacy}</td>
                                        <td className="p-4 text-center text-gray-500">{gen}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Sabji Billing Software — FAQ
                </h2>
                <div className="space-y-6">
                    {FAQ.map((f) => (
                        <div key={f.q} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-lg font-black mb-2">{f.q}</h3>
                            <p className="text-gray-700 leading-relaxed">{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    India&apos;s Fastest Sabji Billing Software. Free for 14 Days.
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    No credit card. No setup fees. Free live demo in Hindi or your regional language.
                    Start billing your sabji mandi the smart way — today.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg">
                        Start Free 14-Day Trial →
                    </Link>
                    <Link href="/commission-agent-software" className="inline-block px-10 py-5 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition text-lg">
                        Also See: Commission Agent Software
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
