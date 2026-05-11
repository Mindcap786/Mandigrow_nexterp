import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Mandi Software Telangana — APMC ERP for TS Traders | MandiGrow',
    description:
        'MandiGrow is the best mandi software for Telangana. APMC commission management, farmer ledger, and billing for mandis in Hyderabad, Warangal, Nizamabad, Karimnagar. Telugu & Urdu supported.',
    keywords: [
        'mandi software Telangana',
        'APMC software Telangana',
        'mandi ERP Hyderabad',
        'commission agent software Telangana',
        'mandi billing Warangal',
        'APMC software Nizamabad',
        'agricultural market software Telangana',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-telangana' },
    openGraph: {
        title: 'Mandi Software Telangana — MandiGrow APMC ERP',
        description: 'Best APMC and commission agent software for Telangana. Telugu & Urdu supported. Free 14-day trial.',
        url: 'https://www.mandigrow.com/mandi-software-telangana',
        type: 'website',
    },
};

const TS_MANDIS = [
    { city: 'Hyderabad / Bowenpally', desc: 'Telangana\'s largest vegetable market. MandiGrow handles hundreds of daily transactions for Bowenpally commission agents.' },
    { city: 'Warangal', desc: 'Major hub for paddy, cotton and maize. MandiGrow\'s multi-commodity support is built for the Warangal trading belt.' },
    { city: 'Nizamabad', desc: 'Known for turmeric, soya and maize trading. MandiGrow manages APMC levy computation for Nizamabad traders.' },
    { city: 'Karimnagar', desc: 'Cotton and vegetable trading centre. MandiGrow\'s gate entry and lot management fit Karimnagar\'s high-volume operations.' },
    { city: 'Khammam', desc: 'Paddy and cotton hub near AP border. MandiGrow supports cross-border trade accounting between TS and AP traders.' },
    { city: 'Mahbubnagar', desc: 'Growing centre for mango and other fruits. MandiGrow\'s seasonal commodity support handles irregular produce volumes.' },
];

export default function MandiSoftwareTelanganaPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Mandi Software Telangana', item: 'https://www.mandigrow.com/mandi-software-telangana' },
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

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    Telangana · Telugu & Urdu Supported · APMC Ready
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Best Mandi Software for <span className="text-emerald-700">Telangana</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 APMC and commission agent software for Telangana. Full Telugu and Urdu support, auto commission calculation, real-time farmer khata, and APMC levy reporting — for mandis in Hyderabad, Warangal, Nizamabad, Karimnagar and across TS.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free 14-Day Trial →</Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">See All Features</Link>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-6xl">🌿</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">మండీ సాఫ్ట్‌వేర్ తెలుగులో — MandiGrow Telugu మరియు Urdu లో అందుబాటులో</h2>
                        <p className="text-emerald-200">MandiGrow is available in Telugu and Urdu — covering both the major language communities in Telangana's agricultural markets. Bills, farmer pattis and reports are generated in the language your customers speak.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">Mandis in Telangana Using MandiGrow</h2>
                <p className="text-lg text-gray-600 mb-10">Commission agents and APMC market traders across these Telangana markets use MandiGrow daily:</p>
                <div className="grid md:grid-cols-2 gap-6">
                    {TS_MANDIS.map((m) => (
                        <div key={m.city} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.city}</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Start Free — Telangana Mandis</h2>
                    <p className="text-emerald-100 mb-6">14 days free. Demo in Telugu. No credit card required.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Start Free Trial →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
