import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'Mandi Software Hyderabad — APMC ERP for Hyderabad Traders | MandiGrow',
    description: 'MandiGrow is the best mandi software for Hyderabad. Complete APMC billing, commission agent software, and farmer ledger for Bowenpally, Gudimalkapur, and Kothapet mandis.',
    keywords: [
        'mandi software Hyderabad',
        'APMC software Hyderabad',
        'mandi ERP Bowenpally',
        'commission agent software Hyderabad'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-hyderabad' },
    openGraph: {
        title: 'Mandi Software Hyderabad — APMC ERP for Hyderabad Traders | MandiGrow',
        description: 'MandiGrow is the best mandi software for Hyderabad. Complete APMC billing, commission agent software, and farmer ledger for Bowenpally, Gudimalkapur, and Kothapet mandis.',
        url: 'https://www.mandigrow.com/mandi-software-hyderabad',
        type: 'website',
    },
};

export default function MandiSoftwareHyderabadPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'Mandi Software Hyderabad', item: 'https://www.mandigrow.com/mandi-software-hyderabad' },
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
                    Hyderabad · Telugu Supported · APMC Ready
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]" dangerouslySetInnerHTML={{ __html: 'Best Mandi Software for <span className="text-emerald-700">Hyderabad</span>' }}></h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-8 font-medium leading-relaxed">
                    MandiGrow is the #1 APMC and commission agent software for Hyderabad. Auto commission calculation, farmer ledger, APMC levy reporting and GST billing — for mandis in Bowenpally, Gudimalkapur, Kothapet and across Telangana.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free 14-Day Trial →</Link>
                    <Link href="/features" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">See All Features</Link>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="text-5xl">⚡</div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">Built for the Speed of Indian Mandis</h2>
                        <p className="text-emerald-200">MandiGrow is designed to operate at the speed of the morning auction. Generate bills, compute commission, and settle accounts without touching a calculator. Works offline and syncs instantly.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 py-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-10">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Start Your Free Trial Today</h2>
                    <p className="text-emerald-100 mb-6">14 days free. No credit card required. Experience the best Mandi ERP.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Get Started →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
