import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Okhla Mandi Software — APMC ERP for Delhi Traders | MandiGrow',
    description:
        'MandiGrow is the premier software for Okhla Mandi, Delhi. Manage commission agent billing, farmer ledgers, and APMC compliance with ease. Hindi supported.',
    keywords: [
        'Okhla mandi software',
        'APMC Okhla software',
        'Okhla APMC ERP',
        'commission agent software Delhi',
        'mandi billing software Delhi',
        'vegetable market software Okhla',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/okhla-mandi-software' },
    openGraph: {
        title: 'Okhla Mandi Software — MandiGrow APMC ERP',
        description: 'Best APMC and commission agent software for Okhla Mandi traders. Handles daily volume & complex accounting seamlessly.',
        url: 'https://www.mandigrow.com/okhla-mandi-software',
        type: 'website',
    },
};

const FEATURES = [
    { title: 'Vegetable & Fruit Ready', desc: 'Customizable units and commission structures for both the vegetable and fruit trade at Okhla.' },
    { title: 'Digital Ledger (Khata)', desc: 'Live digital khata for farmers and buyers. Send payment reminders instantly via WhatsApp with PDF attachments.' },
    { title: 'High-Volume Billing', desc: 'Punch bills at lightning speed during morning trade hours with our keyboard-first shortcut interface.' },
    { title: 'Delhi APMC Compliant', desc: 'Generates gate passes and APMC levy reports automatically based on Delhi market committee rules.' },
];

export default function OkhlaMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Okhla Mandi Software', item: 'https://www.mandigrow.com/okhla-mandi-software' },
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
                    Delhi · Hindi Supported · APMC Okhla
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Built for the Scale of <span className="text-emerald-700">Okhla Mandi</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 APMC ERP and commission agent software for Okhla Market, Delhi. From vegetables to fruits, our cloud software automates commission calculation, farmer ledger (Khata), APMC levy reporting, and GST billing.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free 14-Day Trial →</Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">See All Features</Link>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-5xl">🍅</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">Conquer the Morning Trade Rush</h2>
                        <p className="text-emerald-200">During peak hours in Okhla, an Arhtiya processes hundreds of bills an hour. MandiGrow's shortcut-driven interface allows your accountants to punch bills at lightning speed, while the system automatically calculates deductions like hamali, palledari, and commission.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">Why Okhla Traders Choose MandiGrow</h2>
                <p className="text-lg text-gray-600 mb-10">We understand the unique complexities of Delhi's wholesale agricultural market:</p>
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
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Digitize Your Okhla Commission Agency</h2>
                    <p className="text-emerald-100 mb-6">14 days free. Demo in Hindi or English. No credit card required.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Start Free Trial →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
