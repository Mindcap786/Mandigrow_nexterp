import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Mandi Accounting Software | Arhtiya Finance ERP | MandiGrow',
    description: 'Cloud-based Mandi Accounting Software for Commission Agents. Manage farmer ledgers (Kisan Khata), buyer outstanding, cash books, and bank reconciliation.',
    keywords: [
        'Mandi Accounting Software',
        'Arhtiya accounting ERP',
        'Kisan khata software',
        'Mandi finance software',
        'Commission agent accounting',
        'Udhaar khata software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-accounting-software' },
};

const FEATURES = [
    { title: 'Kisan & Buyer Ledgers', desc: 'Maintain dual ledgers. Track advances given to farmers and pending udhaar from wholesale buyers in real-time.' },
    { title: 'Automated Commission (आढ़त)', desc: 'Commission, Market Fee, and Tax calculations automatically post to the correct accounting heads instantly upon billing.' },
    { title: 'Cash & Bank Books', desc: 'Manage daily cash flow, petty cash, RTGS/NEFT receipts, and multi-bank reconciliation tailored for Mandi cash cycles.' },
    { title: 'Audit Ready Reports', desc: 'Generate Trading P&L, Balance Sheets, and GST-ready compliance reports for APMC inspectors and Chartered Accountants.' },
];

export default function MandiAccountingPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Mandi Accounting Software', item: 'https://www.mandigrow.com/mandi-accounting-software' },
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
                    FINANCIAL CONTROL
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    The Smartest <span className="text-emerald-700">Accounting</span> <br />for Arhtiyas
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Say goodbye to confusing ledgers and lost cash. Manage farmer advances, buyer credit, and APMC taxes in a single, secure cloud platform.
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
                    <h2 className="text-3xl font-black mb-3">Simplify Your Mandi Finances Today</h2>
                    <p className="text-emerald-100 mb-6">14-day free trial. Setup takes less than 5 minutes.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Get Started →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
