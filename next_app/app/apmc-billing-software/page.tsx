import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Shield, FileText, BarChart3, Package } from 'lucide-react';

export const metadata: Metadata = {
    title: 'APMC Billing Software India | Commission Agent ERP for All APMCs — MandiGrow',
    description: 'MandiGrow is India\'s #1 APMC billing software for commission agents and mandi operators. Auto commission, market fee, GST billing, farmer patti, and APMC compliance across all Indian states. Free trial.',
    keywords: [
        'APMC billing software',
        'APMC software India',
        'APMC commission agent software',
        'APMC mandi ERP',
        'APMC compliance software India',
        'regulated market software India',
        'arhtiya software APMC',
        'APMC market fee software',
        'APMC farmer payment software',
        'mandi ERP APMC',
        'APMC billing system India',
        'APMC software for traders',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/apmc-billing-software' },
    openGraph: {
        title: 'APMC Billing Software India | Commission Agent ERP — MandiGrow',
        description: 'Complete APMC billing software — auto commission, market fee, GST, farmer patti, and regulated market compliance for all Indian states.',
        url: 'https://www.mandigrow.com/apmc-billing-software',
        type: 'website',
    },
};

const FAQS = [
    { q: 'What is APMC billing software?', a: 'APMC billing software is a specialized ERP system built for commission agents (arhatias) and traders operating in APMC-regulated markets. It automates the calculation of arhat (commission), market fee, hamali, palledari, rural development cess, and other APMC-regulated deductions — generating farmer pattis, buyer invoices, and GST-compliant bills automatically.' },
    { q: 'Is MandiGrow compliant with APMC rules across all Indian states?', a: 'Yes. MandiGrow is configurable for APMC rules across all Indian states — including Andhra Pradesh, Telangana, Maharashtra, Karnataka, Rajasthan, Punjab, Uttar Pradesh, Bihar, Tamil Nadu, and more. Commission rates, market fee percentages, and regulated charges can be set per your state APMC Act.' },
    { q: 'How does MandiGrow handle APMC commission calculation?', a: 'MandiGrow automatically calculates arhat (commission) as a percentage of the sale value for each lot. Market fee, hamali, palledari, and other charges are added based on your APMC configuration. The system generates the farmer patti showing gross value, all deductions, and net payable in one click.' },
    { q: 'Does MandiGrow generate APMC-compliant farmer pattis?', a: 'Yes. MandiGrow generates farmer pattis (settlement statements) that are fully compliant with APMC format requirements. Each patti shows commodity, quantity, rate, gross amount, commission, market fee, other charges, and net farmer payable — in Hindi or the regional language of your state.' },
    { q: 'Can MandiGrow handle GST billing within APMC mandis?', a: 'Yes. MandiGrow generates GST-compliant invoices for all APMC transactions. It supports B2B and B2C billing, applies correct HSN codes for agricultural commodities, calculates CGST/SGST/IGST, and keeps your GSTR-1 filing ready.' },
    { q: 'Is MandiGrow suitable for small APMC commission agents?', a: 'Yes. MandiGrow works for arhatias of all sizes — from small 20-farmer operations to large commission houses handling hundreds of daily transactions. There is no minimum transaction requirement, and pricing is based on your needs.' },
];

const FEATURES = [
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'APMC Compliance Engine', desc: 'Configurable per-state APMC rules — commission rate, market fee, cess, hamali, palledari. Always compliant.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'Farmer Patti Generation', desc: 'One-click farmer patti showing gross value, all APMC deductions, and net payable — in Hindi or regional language.' },
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Lot & Stock Tracking', desc: 'Track every commodity lot from arrival to sale. Know exactly how much stock is in your yard at any moment.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'GST-Ready Billing', desc: 'APMC-compliant buyer invoices with GST, HSN codes, and auto-calculations. GSTR-1 filing made simple.' },
];

const STATES = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Gujarat', 'Madhya Pradesh', 'Haryana', 'West Bengal', 'Odisha', 'Chhattisgarh'];

export default function APMCBillingSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — APMC Billing Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/apmc-billing-software',
        description: 'India\'s #1 APMC billing software for commission agents. Auto commission, market fee, GST billing, farmer patti, and APMC compliance for all Indian states.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '48' },
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }} />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🏛️ APMC Billing Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        India's #1 APMC Billing Software<br />
                        <span className="text-emerald-700">for Commission Agents & Arhatias</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        MandiGrow automates APMC commission, market fee, hamali, farmer patti, and GST billing for all regulated markets across India. Trusted by 200+ arhatias in 15+ states. Available in Hindi and 6 regional languages.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Talk to Us →
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm font-bold text-gray-600">
                        {['All Indian States', 'Free Training', '₹0 Setup Cost', 'Hindi + Regional Languages', 'APMC Compliant'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-4">Complete APMC Billing & Compliance Platform</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-10">MandiGrow is built from the ground up for APMC regulated market operations — understanding the unique billing logic, regulated charges, and compliance requirements of Indian agricultural markets. Unlike generic accounting software, MandiGrow speaks the language of the mandi.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-[#f7fbf3] border border-emerald-100 rounded-2xl p-6 flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">{f.icon}</div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 mb-1">{f.title}</h3>
                                    <p className="text-gray-600 font-medium leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* States coverage */}
            <section className="py-20 px-6 bg-[#f0f7e8]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-4 text-center">Serving APMC Mandis Across All Indian States</h2>
                    <p className="text-gray-700 text-lg text-center mb-10">MandiGrow is configurable for APMC rules in every Indian state. Our team sets up your specific commission rates, market fee, and compliance requirements during free onboarding.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {STATES.map(s => (
                            <span key={s} className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{s}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-10 text-center">APMC Billing Software — FAQs</h2>
                    <div className="space-y-6">
                        {FAQS.map(f => (
                            <div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-[#f7fbf3]">
                                <h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3>
                                <p className="text-gray-700 font-medium leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Internal links */}
            <section className="py-16 px-6 bg-[#f0f7e8] border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Explore MandiGrow by State & Category</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/anaj-mandi-software', label: 'Anaj Mandi Software' },
                            { href: '/sabji-billing-software', label: 'Sabji Billing Software' },
                            { href: '/fruit-vegetable-billing', label: 'Fruit & Veg Billing' },
                            { href: '/commission-agent-software', label: 'Commission Agent ERP' },
                            { href: '/mandi-khata-software', label: 'Mandi Khata Software' },
                            { href: '/gst-mandi-compliance', label: 'GST Mandi Compliance' },
                            { href: '/mandi-software-andhra-pradesh', label: 'Andhra Pradesh' },
                            { href: '/mandi-software-telangana', label: 'Telangana' },
                            { href: '/mandi-software-maharashtra', label: 'Maharashtra' },
                            { href: '/mandi-software-karnataka', label: 'Karnataka' },
                            { href: '/mandi-software-punjab', label: 'Punjab' },
                            { href: '/mandi-software-rajasthan', label: 'Rajasthan' },
                            { href: '/mandi-software-uttar-pradesh', label: 'Uttar Pradesh' },
                            { href: '/mandi-software-tamil-nadu', label: 'Tamil Nadu' },
                        ].map(l => (
                            <Link key={l.href} href={l.href} className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                                {l.label} →
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Ready to Modernize Your APMC Operations?</h2>
                    <p className="text-emerald-200 text-lg font-medium mb-8">Free onboarding. Free training. No setup cost. Our team configures MandiGrow to your exact APMC rules — in your language.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
