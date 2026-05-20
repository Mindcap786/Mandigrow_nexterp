import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Vegetable Mandi Software India | APMC Billing ERP — MandiGrow',
    description: 'Cloud-based vegetable mandi software for commission agents. Manage lot tracking, daily auctions, khata, APMC cess, and GST billing all in one place.',
    keywords: [
        'vegetable mandi software',
        'vegetable mandi billing software',
        'APMC vegetable software',
        'vegetable commission agent software',
        'sabzi mandi ERP software',
        'vegetable wholesale software',
        'mandi accounting software',
        'arhtiya software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/vegetable-mandi-software' },
    openGraph: {
        title: 'Vegetable Mandi Software India | APMC ERP — MandiGrow',
        description: 'Manage lot tracking, daily auctions, khata, APMC cess, and GST billing all in one place.',
        url: 'https://www.mandigrow.com/vegetable-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'How does this software help in the vegetable mandi?',
        a: 'Vegetable trade involves daily fluctuating rates, varying weights, and rapid auctions. MandiGrow allows your munim to capture auction rates instantly, auto-calculates arhat (commission), applies mandi tax, and generates the final farmer patti without manual math.',
    },
    {
        q: 'Can I track wastage and shortage?',
        a: 'Yes. Vegetables are highly perishable. MandiGrow allows you to record weight shortages and spoilage per lot, ensuring your inventory and accounting remain perfectly balanced without taking a financial loss on unaccounted stock.',
    },
    {
        q: 'Is my data secure in the cloud?',
        a: 'Absolutely. MandiGrow uses bank-grade encryption. Unlike desktop software that can crash or lose data due to hardware failure, your mandi data is backed up automatically on secure AWS servers.',
    },
    {
        q: 'Does it generate GSTR-1 for my business?',
        a: 'Yes. All B2B and B2C sales are recorded with the correct HSN codes. MandiGrow exports a ready-to-file GSTR-1 JSON for your CA.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Lot & Auction Management', desc: 'Track every vegetable lot from arrival to auction. Record winning bids instantly.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Arhat & Mandi Tax Automation', desc: 'Commission, APMC cess, and labor charges are automatically applied to the final bill.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'GST Billing & E-Way Bills', desc: 'Create tax-compliant invoices for large buyers and generate e-way bill data seamlessly.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Advance & Settlement Tracking', desc: 'Manage cash advances to farmers and clear their dues digitally through the Mandi Khata.' },
];

export default function VegetableMandiSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Vegetable Mandi Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/vegetable-mandi-software',
        description: 'India\'s #1 vegetable mandi software for commission agents and wholesale traders.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.7', reviewCount: '89' },
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
                        🍅 Vegetable Mandi Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Vegetable Mandi Software<br />
                        <span className="text-emerald-700">for Modern Traders</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        The ultimate cloud ERP for vegetable commission agents and wholesalers. Ditch the paper diaries. Manage daily arrivals, auctions, khata, and GST billing on desktop and mobile.
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Built for Vegetable Wholesale</h2>
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
