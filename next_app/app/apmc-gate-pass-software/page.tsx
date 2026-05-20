import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'APMC Gate Pass Software | Mandi Inward & Outward ERP | MandiGrow',
    description: 'Digital APMC Gate Pass Software for seamless inward and outward tracking. Generate E-Gate passes instantly, reduce theft, and sync directly with inventory.',
    keywords: [
        'APMC Gate Pass Software',
        'Mandi entry software',
        'Inward outward software APMC',
        'E-Gate pass mandi',
        'Farmer gate entry software',
        'Mandi security software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/apmc-gate-pass-software' },
};

const FEATURES = [
    { title: 'Digital Inward (आवंती)', desc: 'Register farmer details, vehicle numbers, and estimated quantity at the gate in seconds using our mobile app.' },
    { title: 'Seamless Outward (जावक)', desc: 'Generate dispatch gate passes linked to verified buyer invoices. Stop unauthorized stock from leaving the Mandi.' },
    { title: 'Direct Inventory Sync', desc: 'As soon as a gate pass is generated, the expected stock hits your dashboard, ready for auction or direct sale.' },
    { title: 'Real-time Security Logs', desc: 'Maintain a 100% digital log of every vehicle, driver, and lot that enters or exits your premises for APMC audits.' },
];

export default function GatePassPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'APMC Gate Pass Software', item: 'https://www.mandigrow.com/apmc-gate-pass-software' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Start Free Trial →</Link>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    MANDI SECURITY & LOGISTICS
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Digital <span className="text-emerald-700">Gate Pass</span> & <br />Inward Tracking
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Stop paper slips. Speed up entry, prevent theft, and instantly sync vehicle arrivals to your auction dashboard with MandiGrow.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:border-emerald-400 transition">Request Demo</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-emerald-700 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-black mb-3">Secure Your Mandi Operations</h2>
                    <p className="text-emerald-100 mb-6">14-day free trial. Setup takes less than 5 minutes.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Get Started →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
