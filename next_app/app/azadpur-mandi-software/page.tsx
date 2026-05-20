import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Azadpur Mandi Software — APMC ERP & Billing for Delhi Traders | MandiGrow',
    description:
        'MandiGrow is the #1 software for Azadpur Mandi, Delhi. Manage APMC commission, farmer ledgers, lot billing, and Apple/Fruit season accounting with ease. Hindi supported.',
    keywords: [
        'Azadpur mandi software',
        'APMC software Delhi',
        'Azadpur APMC ERP',
        'commission agent software Azadpur',
        'apple trader software Azadpur',
        'mandi billing software Delhi',
        'Azadpur vegetable market software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/azadpur-mandi-software' },
    openGraph: {
        title: 'Azadpur Mandi Software — MandiGrow APMC ERP',
        description: 'Best APMC and commission agent software for Azadpur Mandi traders. Handles massive volume & fruit seasons seamlessly.',
        url: 'https://www.mandigrow.com/azadpur-mandi-software',
        type: 'website',
    },
};

const FEATURES = [
    { title: 'High-Volume Season Ready', desc: 'Whether it is Apple season or Mango season, MandiGrow handles thousands of daily transactions without slowing down.' },
    { title: 'Multi-Party Ledgers (Khata)', desc: 'Live digital khata for farmers, buyers, and transport parties. Share balances directly via WhatsApp.' },
    { title: 'Lot & Box Level Tracking', desc: 'Track inward arrivals, cold storage inventory, and sales at the individual box/lot level.' },
    { title: 'APMC Compliant Billing', desc: 'Generates gate passes and APMC levy reports automatically based on Azadpur APMC rules.' },
];

export default function AzadpurMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Azadpur Mandi Software', item: 'https://www.mandigrow.com/azadpur-mandi-software' },
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
                    Delhi · Hindi Supported · Asia's Largest Mandi
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Built for the Scale of <span className="text-emerald-700">Azadpur Mandi</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 APMC ERP and commission agent software for Azadpur Mandi, Delhi. From high-volume Apple seasons to daily vegetable trade, our cloud software automates commission calculation, farmer ledger (Khata), APMC levy reporting, and GST billing.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free 14-Day Trial →</Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">See All Features</Link>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-5xl">🍎</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">Conquer the Fruit Season Without the Paperwork</h2>
                        <p className="text-emerald-200">During peak season, an Arhtiya in Azadpur processes hundreds of bills an hour. MandiGrow's shortcut-driven interface allows your accountants to punch bills at lightning speed, while the system automatically calculates deductions like hamali, palledari, and commission.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">Why Azadpur Traders Choose MandiGrow</h2>
                <p className="text-lg text-gray-600 mb-10">We understand the unique complexities of Asia's largest wholesale agricultural market:</p>
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Digitize Your Azadpur Commission Agency</h2>
                    <p className="text-emerald-100 mb-6">14 days free. Demo in Hindi or English. No credit card required.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Start Free Trial →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
