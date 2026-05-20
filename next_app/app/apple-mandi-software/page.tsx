import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Apple Mandi Software | Billing & ERP for Apple Traders | MandiGrow',
    description: 'Specialized Apple Mandi software for commission agents in Azadpur, Kashmir, and Shimla. Manage boxes, kgs, cold storage, and grower advances effortlessly.',
    keywords: [
        'apple mandi software',
        'apple trader software',
        'apple commission agent software',
        'apple billing software',
        'apple wholesale software',
        'cold storage apple software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/apple-mandi-software' },
};

const FEATURES = [
    { title: 'Box-to-Kg Conversion', desc: 'Inward apples by the box, outward by the box or kg. MandiGrow handles the conversion math instantly.' },
    { title: 'Cold Storage Tracking', desc: 'Track exactly which lots and grades are sitting in cold storage, preventing spoilage and shrinkage.' },
    { title: 'Grower Advance Ledger', desc: 'Manage the massive pre-season cash advances given to apple growers. Auto-deduct during season settlements.' },
    { title: 'High-Speed Season Billing', desc: 'When the season hits, punch 100s of bills an hour without the software slowing down or crashing.' }
];

export default function AppleMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Apple Mandi Software', item: 'https://www.mandigrow.com/apple-mandi-software' },
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
                    Built for the <span className="text-emerald-700">Apple Trade</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    From the orchards of Kashmir and Shimla to the massive wholesale yards of Azadpur. Manage boxes, grades, cold storage inventory, and grower advances with India's most powerful Apple Mandi Software.
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
                <h2 className="text-3xl font-black mb-4">Digitize Your Apple Commission Agency</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Stop losing margins to calculation errors during the peak season rush. 
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
