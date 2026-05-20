import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Chilli Mandi Software | Billing & ERP for Chilli Traders | MandiGrow',
    description: 'Specialized Chilli (Mirchi) Mandi software for commission agents in Guntur, Byadgi, and Khammam. Manage bags, grades, and farmer khata easily.',
    keywords: [
        'chilli mandi software',
        'mirchi mandi software',
        'chilli trader software',
        'Guntur chilli software',
        'mirchi commission agent software',
        'chilli wholesale billing software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/chilli-mandi-software' },
};

const FEATURES = [
    { title: 'Grade-Based Pricing', desc: 'Chilli trade heavily depends on grades (Teja, Byadgi, etc.). Our software tracks lot quality and separates pricing automatically.' },
    { title: 'Bag-to-Quintal Math', desc: 'Inward mirchi by the bag, outward by the quintal or bag. MandiGrow handles the conversion instantly without manual calculation.' },
    { title: 'Farmer Advance Ledger', desc: 'Manage the massive pre-season cash advances given to chilli farmers. Auto-deduct during season settlements.' },
    { title: 'Cold Storage Integration', desc: 'Track exactly which chilli lots are in cold storage to manage shrinkage, rent, and quality over time.' }
];

export default function ChilliMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Chilli Mandi Software', item: 'https://www.mandigrow.com/chilli-mandi-software' },
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
                    Built for the <span className="text-emerald-700">Chilli Trade</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    From the massive yards of Guntur and Khammam to cold storage facilities. Manage grades, bags, quintals, and grower advances with India's most powerful Mirchi Mandi Software.
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
                <h2 className="text-3xl font-black mb-4">Digitize Your Mirchi Commission Agency</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Stop losing margins to manual errors. Digitize your entire workflow today.
                </p>
                <Link href="/subscribe" className="inline-block px-8 py-4 bg-emerald-700 text-white font-black rounded-xl hover:bg-emerald-800 transition">Start Free Trial →</Link>
            </section>

            <LandingFooter />
        </main>
    );
}
