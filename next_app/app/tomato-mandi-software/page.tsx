import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Tomato Mandi Software | Billing & ERP for Tomato Traders | MandiGrow',
    description: 'Specialized Tomato Mandi software for commission agents. Manage crates natively, auto-deduct crate deposits, and generate instant farmer settlements.',
    keywords: [
        'tomato mandi software',
        'tomato trader software',
        'tomato commission agent software',
        'tomato billing software',
        'tomato crate tracking software',
        'vegetable mandi software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/tomato-mandi-software' },
};

const FEATURES = [
    { title: 'Native Crate Tracking', desc: 'Tomatoes are entirely traded in plastic crates. MandiGrow maintains a parallel Crate Ledger to ensure you never lose a crate again.' },
    { title: 'Auto Crate Deposits', desc: 'Automatically charge crate deposits to buyers on the bill, and auto-refund them when crates are returned.' },
    { title: 'High-Volume Speed', desc: 'Tomato auctions happen incredibly fast. Our shortcut-driven system allows you to punch a buyer bill in under 5 seconds.' },
    { title: 'Farmer Settlement (Patti)', desc: 'Generate instant farmer pattis with auto-deducted commission, hamali, and market fees.' }
];

export default function TomatoMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Tomato Mandi Software', item: 'https://www.mandigrow.com/tomato-mandi-software' },
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
                    Commodity Specific ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Built for the <span className="text-emerald-700">Tomato Trade</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Stop losing money on unreturned plastic crates. Track crates, manage fast-paced auctions, and automate farmer settlements with India's most powerful Tomato Mandi Software.
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
                <h2 className="text-3xl font-black mb-4">Digitize Your Tomato Commission Agency</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Stop leaking profit through lost crates. Secure your inventory today.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
