import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Vyapar App vs MandiGrow | The Best APMC Commission Agent Software',
    description: 'Compare Vyapar with MandiGrow for Mandi Commission Agents. Discover why MandiGrow handles lot tracking, APMC levies, and farmer ledger (Khata) much better.',
    keywords: [
        'Vyapar vs MandiGrow',
        'Vyapar for Mandi',
        'Vyapar for commission agent',
        'Vyapar alternative for Mandi',
        'sabji mandi software vs vyapar',
        'APMC billing vyapar'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/vyapar-vs-mandigrow' },
};

const COMPARISONS = [
    { feature: 'Commission (Arhtiya) Workflow', vyapar: 'Missing natively', mandigrow: 'Built-in auto deduction' },
    { feature: 'APMC Market Fee Calculation', vyapar: 'No native APMC support', mandigrow: 'Auto-calculates state-specific Mandi Levy' },
    { feature: 'Multi-Unit Billing (Boxes to Kgs)', vyapar: 'Manual unit conversions', mandigrow: 'Native box/lot to Kg conversion' },
    { feature: 'Farmer Advance Tracking', vyapar: 'General ledger only', mandigrow: 'Dedicated farmer Khata with advance recovery' },
    { feature: 'Crate Tracking Ledger', vyapar: 'Handled via inventory hacks', mandigrow: 'Native Crate Ledger parallel to cash' },
    { feature: 'High-Volume Speed', vyapar: 'Standard GST retail speed', mandigrow: 'Keyboard-shortcut optimized for morning rush' }
];

export default function VyaparVsMandiGrowPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Vyapar vs MandiGrow', item: 'https://www.mandigrow.com/vyapar-vs-mandigrow' },
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
                    Vyapar vs <span className="text-emerald-700">MandiGrow</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Vyapar is a great app for standard retail GST billing, but APMC commission agents require more. See why Mandi traders upgrade to MandiGrow for handling Hamali, Levy, and Khata.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Try MandiGrow Free →</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-3 bg-emerald-50 p-4 border-b border-emerald-100 font-bold text-emerald-900">
                        <div>Feature</div>
                        <div className="text-gray-500">Vyapar App</div>
                        <div className="text-emerald-700">MandiGrow</div>
                    </div>
                    {COMPARISONS.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 p-4 border-b border-gray-100 items-center">
                            <div className="font-bold text-gray-800">{row.feature}</div>
                            <div className="text-gray-500 text-sm pr-4">❌ {row.vyapar}</div>
                            <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-2 rounded-lg">✅ {row.mandigrow}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-black mb-4">Stop Hacking Retail Software for Mandi Trade</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Trying to make Vyapar work for an Arhtiya business involves messy workarounds for commission and APMC cess. MandiGrow is built specifically for this workflow from day one.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
