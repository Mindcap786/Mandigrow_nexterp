import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Agriculture Billing Software India | Agri ERP — MandiGrow',
    description: 'Cloud ERP and agriculture billing software for commission agents, wholesale agricultural traders, and APMC markets. Manage GST, khata, and farmer settlements.',
    keywords: [
        'agriculture billing software',
        'agriculture ERP software India',
        'agri commodity trading software',
        'APMC agriculture software',
        'commission agent software',
        'mandi accounting software',
        'farmer billing software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/agriculture-billing-software' },
    openGraph: {
        title: 'Agriculture Billing Software India | Agri ERP — MandiGrow',
        description: 'Manage GST, khata, and farmer settlements with India\'s top agriculture billing software.',
        url: 'https://www.mandigrow.com/agriculture-billing-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'What types of agricultural commodities can I trade using this software?',
        a: 'MandiGrow is highly flexible. It supports all agricultural commodities, including fruits, vegetables, grains (wheat, rice), pulses (dal, soybean), and spices. You can configure unit metrics like quintals, crates, or kilograms for each commodity.',
    },
    {
        q: 'Does it manage APMC compliance and Mandi Tax?',
        a: 'Yes. Agricultural trade in India is heavily regulated. MandiGrow automatically applies state-specific APMC Mandi Cess and generates compliance reports for market committees.',
    },
    {
        q: 'Is it suitable for B2B wholesale and GST billing?',
        a: 'Absolutely. MandiGrow handles B2B invoicing with full GST compliance, including automatic HSN code assignment, CGST/SGST/IGST calculations, and JSON exports for GSTR-1 and GSTR-3B.',
    },
    {
        q: 'Can multiple branches or mandis use the same account?',
        a: 'Yes. If your business operates across multiple mandis or cities, MandiGrow scales with you. Your master data (farmers, buyers, items) is synced across all branches, while keeping reporting segmented.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Multi-Commodity Billing', desc: 'Trade fruits, vegetables, and grains on a single platform. Set up custom units and rates.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'APMC & Commission Rules', desc: 'Automate complex commission structures and Mandi Cess calculations automatically.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'GST & Farmer Settlements', desc: 'Generate GST-compliant B2B invoices and detailed farmer settlement pattis in one click.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Centralized Digital Khata', desc: 'Manage your financial ledgers securely. Track advances, credits, and payables instantly.' },
];

export default function AgricultureBillingSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Agriculture Billing Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/agriculture-billing-software',
        description: 'India\'s leading agriculture billing software and cloud ERP for commission agents and wholesale agricultural traders.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '102' },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🌾 Agriculture Billing Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Agriculture Billing Software<br />
                        <span className="text-emerald-700">for Indian Traders</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        A powerful, cloud-based ERP to manage agricultural trade. Automate APMC compliance, farmer settlements, and wholesale GST billing across all your commodities.
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
                        {['Free Training', '₹0 Setup Cost', 'Hindi Support', 'Mobile App', 'GST Ready'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Comprehensive Agriculture ERP</h2>
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

            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
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

            <LandingFooter />
        </main>
    );
}
