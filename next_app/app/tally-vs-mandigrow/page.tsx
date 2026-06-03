import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Tally vs MandiGrow | Why APMC Commission Agents are Switching',
    description: 'Compare Tally ERP 9 / Tally Prime with MandiGrow. Learn why fruit & vegetable commission agents prefer specialized Mandi software over generic accounting tools.',
    keywords: [
        'Tally vs MandiGrow',
        'Tally for Mandi',
        'Tally for commission agent',
        'Tally alternative for Mandi',
        'sabji mandi software vs tally',
        'APMC billing tally'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/tally-vs-mandigrow' },
};

const COMPARISONS = [
    { feature: 'Lot & Box Level Tracking', tally: 'Requires complex custom fields', mandigrow: 'Native support (Bags, Crates, Kgs)' },
    { feature: 'Farmer Khata & Advances', tally: 'Standard debtors ledger', mandigrow: 'Dedicated Farmer Ledger with auto-deductions' },
    { feature: 'Commission Auto-Calculation', tally: 'Manual calculation on total', mandigrow: 'Auto-calculated per item & per party' },
    { feature: 'APMC Levy & Gate Pass', tally: 'No native support', mandigrow: '1-click APMC compliant reports' },
    { feature: 'WhatsApp Integration', tally: 'Paid third-party plugin', mandigrow: 'Free native WhatsApp sharing' },
    { feature: 'Local Languages', tally: 'Complex to configure', mandigrow: 'Hindi, Marathi, Telugu built-in' }
];

export default function TallyVsMandiGrowPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Tally vs MandiGrow', item: 'https://www.mandigrow.com/tally-vs-mandigrow' },
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
                    Tally vs <span className="text-emerald-700">MandiGrow</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Tally is a phenomenal general accounting tool, but the chaotic, high-speed APMC mandi trade requires specialized software. See why hundreds of Arhtiyas are switching to MandiGrow.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Try MandiGrow Free →</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-3 bg-emerald-50 p-4 border-b border-emerald-100 font-bold text-emerald-900">
                        <div>Feature</div>
                        <div className="text-gray-500">Tally Prime</div>
                        <div className="text-emerald-700">MandiGrow</div>
                    </div>
                    {COMPARISONS.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 p-4 border-b border-gray-100 items-center">
                            <div className="font-bold text-gray-800">{row.feature}</div>
                            <div className="text-gray-500 text-sm pr-4">❌ {row.tally}</div>
                            <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-2 rounded-lg">✅ {row.mandigrow}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-12 text-left">
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-12">
                    <h2 className="text-3xl font-black mb-4 text-emerald-950">Why Generic ERPs like Tally Fail Mandi Commission Agents</h2>
                    <p className="text-lg text-emerald-900/80 mb-4 leading-relaxed">
                        If you run an agricultural wholesale business, you've likely tried to force-fit your operations into Tally. And you've likely felt the pain of their static inventory models. Generic ERPs are built for manufacturing and traditional retail—they assume an item arrives in a box and leaves in that exact same box.
                    </p>
                    <p className="text-lg text-emerald-900/80 mb-4 leading-relaxed">
                        Agricultural produce is fluid. It shrinks, it spoils, and most importantly, it is constantly repackaged. <strong>MandiGrow's proprietary Repack & Multi-UOM engine</strong> is built precisely for this.
                    </p>
                    <p className="text-lg text-emerald-900/80 leading-relaxed">
                        While a Tally user is forced to create complex "Manufacturing Assemblies" just to move apples from a 20kg crate into four 5kg boxes, a MandiGrow user does this in a single click. We don't treat repacking as a manufacturing process; we treat it as a fundamental state change of the produce. This prevents the severe stock discrepancies that plague Tally users in the agri-sector.
                    </p>
                </div>

                <h2 className="text-3xl font-black mb-4 text-center">You Don't Need an Accounting Degree to Trade</h2>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    Tally requires a trained accountant to operate effectively. MandiGrow's shortcut-driven, intuitive interface is built so that anyone in your shop can generate bills, farmer pattis, and APMC gate passes in seconds.
                </p>
                <div className="flex justify-center">
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
