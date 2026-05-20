import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Marg ERP vs MandiGrow | The Best Mandi Accounting Software',
    description: 'Compare Marg ERP with MandiGrow for agricultural commission agents. See why MandiGrow offers a faster, cloud-based solution for APMC billing and Khata.',
    keywords: [
        'Marg ERP vs MandiGrow',
        'Marg for Mandi',
        'Marg ERP commission agent',
        'Marg alternative for Mandi',
        'sabji mandi software vs marg',
        'APMC billing marg'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/marg-erp-vs-mandigrow' },
};

const COMPARISONS = [
    { feature: 'Cloud Access (Anywhere)', marg: 'Primarily desktop/local', mandigrow: '100% Cloud-native (Web, iOS, Android)' },
    { feature: 'Farmer (Arhtiya) Patti', marg: 'Requires complex customization', mandigrow: 'Instant generation in local languages' },
    { feature: 'Interface Complexity', marg: 'Steep learning curve', mandigrow: 'Simple, modern, intuitive interface' },
    { feature: 'Crate & Bag Tracking', marg: 'Inventory workarounds needed', mandigrow: 'Native parallel crate ledger' },
    { feature: 'APMC Market Fee (Levy)', marg: 'Manual setup required', mandigrow: 'Pre-configured state-specific APMC reports' },
    { feature: 'Live WhatsApp Reminders', marg: 'Requires add-ons', mandigrow: 'Built-in 1-click sharing' }
];

export default function MargVsMandiGrowPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Marg ERP vs MandiGrow', item: 'https://www.mandigrow.com/marg-erp-vs-mandigrow' },
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
                    Software Comparison
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Marg ERP vs <span className="text-emerald-700">MandiGrow</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Marg ERP is powerful for pharma and retail, but APMC wholesale trade is vastly different. Learn why agricultural commission agents choose MandiGrow's modern cloud platform.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Try MandiGrow Free →</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-3 bg-emerald-50 p-4 border-b border-emerald-100 font-bold text-emerald-900">
                        <div>Feature</div>
                        <div className="text-gray-500">Marg ERP</div>
                        <div className="text-emerald-700">MandiGrow</div>
                    </div>
                    {COMPARISONS.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 p-4 border-b border-gray-100 items-center">
                            <div className="font-bold text-gray-800">{row.feature}</div>
                            <div className="text-gray-500 text-sm pr-4">❌ {row.marg}</div>
                            <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-2 rounded-lg">✅ {row.mandigrow}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-black mb-4">Move Your Mandi Business to the Cloud</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Stop being tied to a single desktop computer in your shop. MandiGrow lets you check live farmer balances, crate inventory, and daily sales directly from your phone while standing in the auction yard.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
