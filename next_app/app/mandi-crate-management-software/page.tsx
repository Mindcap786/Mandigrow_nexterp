import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Crate Management Software for Mandis | MandiGrow',
    description: 'Stop losing money on misplaced plastic crates. MandiGrow integrates crate management directly into your Khata for real-time tracking and dispute-free settlements.',
    keywords: [
        'crate management software',
        'sabji crate tracking',
        'mandi inventory software',
        'plastic crate tracker',
        'mandi crate ledger',
        'sabzi mandi crate app'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-crate-management-software' },
};

const FEATURES = [
    { title: 'Unified Ledger (Khata)', desc: 'Crates issued or received are automatically updated directly inside the buyer or supplier Khata. See money and crates owed together.' },
    { title: 'Live Crate Balances', desc: 'Pull up Party-wise Crate Balances instantly. Hold security deposits confidently when buyers return to settle accounts.' },
    { title: 'Automated Analytics', desc: 'Get aging reports on crates held over 15 days, and receive low-inventory alerts to recall crates before harvest.' },
    { title: 'WhatsApp Crate Statements', desc: 'Send professional Crate Account Statements directly to your buyer’s WhatsApp. Build trust and eliminate excuses.' }
];

export default function MandiCrateSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Crate Management Software', item: 'https://www.mandigrow.com/mandi-crate-management-software' },
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

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    Mandi Logistics & Inventory
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    End Supplier Disputes with <span className="text-emerald-700">Crate Management</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    If you are losing track of 20 crates a day, you are bleeding ₹1,50,000 a month. Stop relying on memory. MandiGrow links your crates directly to your financial Khata.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Try MandiGrow Free →</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-black mb-4">Stop the Ledger Leaks Today</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Crates are an expensive asset. Manage them securely without guesswork and protect your profit margins.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
