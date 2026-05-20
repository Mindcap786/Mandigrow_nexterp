import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'J-Form Billing Software | Punjab & Haryana Mandi ERP | MandiGrow',
    description: 'The ultimate J-Form Billing Software for Commission Agents (Arhtiyas) in Punjab, Haryana, and Rajasthan. Automate I-Form, J-Form, MSP compliance, and gate passes.',
    keywords: [
        'J-Form Billing Software',
        'I-Form software',
        'Arhtiya software Punjab',
        'Haryana Mandi software',
        'MSP billing software',
        'Grain mandi ERP'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/j-form-billing-software' },
};

const FEATURES = [
    { title: 'Automated J-Form Generation', desc: 'Instantly generate govt-compliant J-Forms (Kacha/Pakka arhtiya) for farmers with accurate MSP calculations and tax deductions.' },
    { title: 'I-Form & Gate Pass', desc: 'Seamlessly link inward gate passes to I-Forms for buyers. Track entire grain lots from entry to dispatch.' },
    { title: 'MSP & Cess Compliance', desc: 'Stay 100% compliant. Rural Development Fund (RDF), Market Fee, and Dami are automatically calculated on the latest MSP rates.' },
    { title: 'Inventory & Gunny Bags (Bardana)', desc: 'Track wheat, paddy, and mustard in quintals. Manage Bardana (gunny bags) inventory issued to farmers and laborers.' },
];

export default function JFormBillingPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                    { '@type': 'ListItem', position: 2, name: 'J-Form Billing Software', item: 'https://www.mandigrow.com/j-form-billing-software' },
                ],
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Start Free Trial →</Link>
                </div>
            </nav>

            <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6">
                    PUNJAB & HARYANA'S TOP ERP
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Flawless <span className="text-emerald-700">J-Form</span> & <br />MSP Billing
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
                    Built specifically for Anaj Mandi Arhtiyas. Automate J-Forms, I-Forms, Bardana tracking, and Kisan Ledgers with zero errors.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">Start Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:border-emerald-400 transition">Request Demo</Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {FEATURES.map((m) => (
                        <div key={m.title} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-black text-emerald-800 mb-2">{m.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-emerald-700 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-black mb-3">Digitize Your Anaj Mandi Business</h2>
                    <p className="text-emerald-100 mb-6">Join thousands of Arhtiyas saving hours of paperwork every season.</p>
                    <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">Get Started →</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
