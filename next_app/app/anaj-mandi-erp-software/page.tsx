import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Anaj Mandi Software | Grain & Pulse ERP for Arhtiyas | MandiGrow',
    description: 'Specialized Anaj (Grain) Mandi ERP for Arhtiyas in Punjab, Haryana, and MP. Manage quintals, MSP compliance, J-Forms, and massive bulk inventory.',
    keywords: [
        'anaj mandi software',
        'grain mandi software',
        'arhtiya software',
        'pulse mandi erp',
        'wheat billing software',
        'J-form software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/anaj-mandi-erp-software' },
};

const FEATURES = [
    { title: 'J-Form Generation', desc: 'Automatically generate compliant J-Forms for farmer settlements, ensuring strict adherence to APMC grain trading laws.' },
    { title: 'Quintal & Tonne Math', desc: 'Trade in massive bulk. Inward by the tractor trolley, calculate dry-weight deductions, and bill by the quintal or tonne.' },
    { title: 'MSP Compliance', desc: 'Ensure that all your grain transactions meet Minimum Support Price (MSP) regulations automatically.' },
    { title: 'Arhtiya Ledger', desc: 'Manage massive credit lines given to farmers before the harvest season. Auto-settle loans when the grain is sold.' }
];

export default function AnajMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Anaj Mandi Software', item: 'https://www.mandigrow.com/anaj-mandi-erp-software' },
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
                    Built for the <span className="text-emerald-700">Anaj (Grain) Trade</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Designed for the Arhtiyas of Punjab, Haryana, and MP. Automate J-Forms, manage massive bulk inventory in quintals/tonnes, and settle farmer loans instantly.
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
                <h2 className="text-3xl font-black mb-4">Digitize Your Grain Commission Agency</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Stop drowning in manual J-Forms and ledger books. Bring your Arhtiya business online.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
