import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Mandi Software Andhra Pradesh — APMC ERP for AP Traders | MandiGrow',
    description:
        'MandiGrow is the best mandi software for Andhra Pradesh. Complete APMC billing, commission agent software, and farmer ledger for mandis in Guntur, Kurnool, Vijayawada, Rajamahendravaram and across AP. Telugu supported.',
    keywords: [
        'mandi software Andhra Pradesh',
        'APMC software Andhra Pradesh',
        'mandi ERP AP',
        'commission agent software Andhra Pradesh',
        'mandi billing Guntur',
        'mandi software Vijayawada',
        'APMC software Telugu',
        'agricultural market software Andhra Pradesh',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-andhra-pradesh' },
    openGraph: {
        title: 'Mandi Software Andhra Pradesh — MandiGrow APMC ERP',
        description: 'The best APMC and mandi commission software for Andhra Pradesh. Full Telugu support. Free trial.',
        url: 'https://www.mandigrow.com/mandi-software-andhra-pradesh',
        type: 'website',
    },
};

const AP_MANDIS = [
    { city: 'Guntur', desc: 'One of India\'s largest chilli and cotton APMC markets. MandiGrow handles multi-commodity lot tracking and commission for Guntur\'s high-volume commission agents.' },
    { city: 'Kurnool', desc: 'Major hub for groundnut and onion trade. MandiGrow\'s auto-commission and farmer settlement features are built for the pace of Kurnool APMC.' },
    { city: 'Vijayawada (Krishna)', desc: 'Central AP\'s largest wholesale market. MandiGrow is used by dozens of commission agents in the Krishna and West Godavari belts.' },
    { city: 'Rajamahendravaram', desc: 'Major paddy and vegetable market. MandiGrow\'s Telugu interface helps Rajahmundry-area agents bill and settle without English.' },
    { city: 'Nellore', desc: 'Aquaculture and rice trading hub. MandiGrow supports non-traditional produce categories alongside standard fruits and vegetables.' },
    { city: 'Tirupati', desc: 'Growing hub for tomato and vegetable trade. MandiGrow\'s mobile app lets agents bill on Android at the market gate.' },
];

export default function MandiSoftwareAndhraPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Mandi Software Andhra Pradesh', item: 'https://www.mandigrow.com/mandi-software-andhra-pradesh' },
                ],
            }) }} />

            {/* Nav */}
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

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    Andhra Pradesh · Telugu Supported · APMC Ready
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    India's Best Mandi Software for <span className="text-emerald-700">Andhra Pradesh</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 mandi ERP software for Andhra Pradesh. Purpose-built for AP commission agents, APMC secretaries and agricultural traders — with full Telugu language support, auto commission calculation, farmer ledger, and APMC billing. Trusted by mandis in Guntur, Kurnool, Vijayawada, Rajamahendravaram and across Andhra Pradesh.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">
                        Start Free 14-Day Trial →
                    </Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">
                        See All Features
                    </Link>
                </div>
            </section>

            {/* Telugu callout */}
            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-6xl">🇮🇳</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">మండి ERP తెలుగులో — MandiGrow తెలుగులో అందుబాటులో ఉంది</h2>
                        <p className="text-emerald-200 leading-relaxed">
                            MandiGrow is fully available in Telugu. Bills, pattis, ledger statements and the entire application interface can be used in Telugu — so your staff and farmers are comfortable from day one. No English required.
                        </p>
                    </div>
                </div>
            </section>

            {/* AP Mandis */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">
                    Trusted by Mandi Traders Across Andhra Pradesh
                </h2>
                <p className="text-lg text-gray-600 mb-10">
                    MandiGrow commission agent software and APMC billing software is used by traders in the following AP markets:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {AP_MANDIS.map((m) => (
                        <div key={m.city} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.city} APMC</h3>
                            <p className="text-gray-600">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features specific */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-10">
                    Why AP Traders Choose MandiGrow
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        ['Telugu Interface', 'Full Telugu language support across billing, reports and pattis. No English required for your staff.'],
                        ['APMC Levy Automation', 'AP market cess and supervision charges auto-computed and reported per AP APMC Act.'],
                        ['Chilli & Groundnut Support', 'Multi-commodity support for AP\'s major crops — chilli, groundnut, cotton, onion, paddy.'],
                        ['Mobile at Gate', 'Android app for gate entry and billing at AP mandis where desktop access is limited.'],
                        ['Farmer Patti Instantly', 'Generate and WhatsApp-share farmer pattis in Telugu in under 10 seconds.'],
                        ['GST for AP Traders', 'AP GSTIN-compliant invoices for B2B and B2C transactions. GSTR-1 export ready.'],
                    ].map(([title, desc]) => (
                        <div key={title as string} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600 text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">
                        MandiGrow Free Trial — Start Today
                    </h2>
                    <p className="text-emerald-100 mb-6">14 days free. No credit card. Demo in Telugu or Hindi.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">
                        Start Free Trial →
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
