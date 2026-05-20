import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi ERP Software India | Commission Agent ERP — MandiGrow',
    description: 'The most comprehensive Mandi ERP software in India. Digitize your daily arrivals, auctions, buyer billing, farmer khata, and APMC compliance.',
    keywords: [
        'mandi erp software',
        'mandi erp software India',
        'APMC erp software',
        'agricultural erp software',
        'arhtiya erp software',
        'commission agent erp',
        'mandi management software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-erp-software' },
    openGraph: {
        title: 'Mandi ERP Software India | Commission Agent ERP',
        description: 'Digitize your daily arrivals, auctions, buyer billing, farmer khata, and APMC compliance with India\'s best Mandi ERP.',
        url: 'https://www.mandigrow.com/mandi-erp-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'Why should I switch from Tally to a Mandi ERP?',
        a: 'Tally is a great general accounting tool, but it doesn\'t understand mandi workflows like lot tracking, crates, APMC cess, hamali, or automatic arhat deductions. MandiGrow is a true Mandi ERP built specifically for commission agents to automate these daily tasks natively.',
    },
    {
        q: 'How long does it take to migrate to this ERP?',
        a: 'Most mandi traders migrate to MandiGrow in less than 24 hours. You can upload your existing farmer and buyer master data, enter their opening balances, and start billing the very next morning.',
    },
    {
        q: 'Can my munim use it on their phone at the auction?',
        a: 'Yes. MandiGrow features a native mobile app designed for fast data entry right at the auction lot, so you don\'t have to re-enter data back at the office.',
    },
    {
        q: 'What reports can I generate?',
        a: 'You can generate daily sales registers, farmer payment pattis, outstanding buyer reports (Khata), GST GSTR-1 data, and APMC Mandi Cess compliance reports instantly.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'End-to-End Workflow', desc: 'Manage the entire lifecycle of produce from gate arrival to final buyer settlement.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Real-Time Insights', desc: 'Track your daily profit, total sales, and outstanding advances in a live dashboard.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'Automated Compliance', desc: 'Mandi Cess, GST, and APMC reporting are generated automatically as you bill.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Secure Cloud Infrastructure', desc: 'Your data is backed up daily and secured on enterprise-grade AWS cloud servers.' },
];

export default function MandiERPSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Mandi ERP Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/mandi-erp-software',
        description: 'India\'s most comprehensive Mandi ERP software for commission agents.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '210' },
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
                        📈 Mandi ERP Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        India's #1 Mandi ERP Software<br />
                        <span className="text-emerald-700">for Arhtiyas & Traders</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Upgrade from basic accounting tools to a complete Enterprise Resource Planning (ERP) system designed exclusively for the Indian agricultural market.
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Transform Your Mandi Operations</h2>
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
