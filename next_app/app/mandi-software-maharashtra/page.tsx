import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Mandi Software Maharashtra — APMC ERP for MH Traders | MandiGrow',
    description:
        'MandiGrow is the best mandi software for Maharashtra. APMC commission management, farmer ledger and billing for mandis in Pune, Mumbai (APMC Vashi), Nashik, Aurangabad, Nagpur. Hindi & Marathi context.',
    keywords: [
        'mandi software Maharashtra',
        'APMC software Maharashtra',
        'mandi ERP Pune',
        'commission agent software Maharashtra',
        'APMC software Mumbai',
        'mandi billing Nashik',
        'agricultural market software Maharashtra',
        'onion mandi software Nashik',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-maharashtra' },
    openGraph: {
        title: 'Mandi Software Maharashtra — MandiGrow APMC ERP',
        description: 'Best APMC and commission agent software for Maharashtra. Hindi supported. Free 14-day trial.',
        url: 'https://www.mandigrow.com/mandi-software-maharashtra',
        type: 'website',
    },
};

const MH_MANDIS = [
    { city: 'Pune (Market Yard)', desc: 'One of Maharashtra\'s largest APMC markets. MandiGrow handles the volume and variety of Pune Market Yard\'s multi-commodity operations.' },
    { city: 'Mumbai — Vashi APMC', desc: 'Asia\'s largest wholesale market. MandiGrow\'s cloud infrastructure handles the scale of Vashi\'s thousands of daily transactions.' },
    { city: 'Nashik', desc: 'India\'s onion capital and a major grape centre. MandiGrow\'s lot-based billing and commission software is purpose-built for Nashik\'s high-value produce.' },
    { city: 'Aurangabad', desc: 'Central Maharashtra\'s key trading hub. MandiGrow supports cotton, soya and seasonal vegetable trade for Aurangabad commission agents.' },
    { city: 'Nagpur', desc: 'Major orange market and central India hub. MandiGrow handles fruit-specific commission structures for Nagpur APMC traders.' },
    { city: 'Kolhapur', desc: 'Vegetables and sugarcane byproducts. MandiGrow\'s flexible commodity configuration covers Kolhapur\'s diverse produce mix.' },
];

export default function MandiSoftwareMaharashtraPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Mandi Software Maharashtra', item: 'https://www.mandigrow.com/mandi-software-maharashtra' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/features" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Features</Link>
                        <Link href="/pricing" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Pricing</Link>
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Free Trial →</Link>
                    </div>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    Maharashtra · Hindi Supported · APMC Ready
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Best Mandi Software for <span className="text-emerald-700">Maharashtra</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 APMC and commission agent software for Maharashtra. Auto commission calculation, farmer ledger, APMC levy reporting and GST billing — for mandis in Pune, Mumbai Vashi, Nashik, Nagpur, Aurangabad and across Maharashtra. Full Hindi support.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free 14-Day Trial →</Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">See All Features</Link>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-5xl">🧅</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">Nashik Onion, Pune Vegetables, Nagpur Oranges — MandiGrow handles them all</h2>
                        <p className="text-emerald-200">MandiGrow's flexible commodity configuration supports every major Maharashtra crop — from onion and grape in Nashik to orange in Nagpur to mixed vegetables in Pune Market Yard. Commission rates, levy structures and billing formats are all configurable per commodity and per APMC.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">APMC Markets in Maharashtra Using MandiGrow</h2>
                <p className="text-lg text-gray-600 mb-10">From Vashi to Nashik, MandiGrow serves Maharashtra's most important agricultural trading centres:</p>
                <div className="grid md:grid-cols-2 gap-6">
                    {MH_MANDIS.map((m) => (
                        <div key={m.city} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.city}</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Free Trial for Maharashtra Mandi Traders</h2>
                    <p className="text-emerald-100 mb-6">14 days free. Demo in Hindi or English. No credit card.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Start Free Trial →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
