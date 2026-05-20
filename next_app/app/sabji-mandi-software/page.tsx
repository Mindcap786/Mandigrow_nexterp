import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Sabji Mandi Software India | Vegetable Commission Agent ERP',
    description: 'India\'s fastest sabji mandi software. Automate daily auction billing, hamali, farmer khata, and APMC commission for vegetable wholesale traders.',
    keywords: [
        'sabji mandi software',
        'sabzi mandi software',
        'vegetable mandi software',
        'sabji mandi billing software',
        'commission agent software',
        'APMC sabji software',
        'vegetable wholesale software',
        'mandi erp software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/sabji-mandi-software' },
    openGraph: {
        title: 'Sabji Mandi Software India | Vegetable ERP — MandiGrow',
        description: 'Automate daily auction billing, hamali, farmer khata, and APMC commission for vegetable wholesale traders.',
        url: 'https://www.mandigrow.com/sabji-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'Why do I need specific sabji mandi software instead of normal accounting software?',
        a: 'Because sabji mandi trade moves too fast for regular accounting software. You need to record vehicle arrivals, manage fast-paced lot auctions, bill in varying units (crates, bags, kgs), and automatically deduct your Arhtiya commission and hamali charges before paying the farmer. Standard accounting software like Tally cannot do this automatically.',
    },
    {
        q: 'Does it support Hindi language for my staff?',
        a: 'Yes, MandiGrow is built for Indian mandis. The interface, the printed bills, and the farmer pattis can all be generated in Hindi, Marathi, Telugu, Tamil, and English.',
    },
    {
        q: 'Can I manage advance payments given to farmers?',
        a: 'Yes. The software features a dedicated Mandi Khata (digital ledger) for every farmer. If you give a cash advance before the harvest, it is logged. When the farmer sells their sabji, the software automatically deducts the advance from their final payment patti.',
    },
    {
        q: 'Is it easy to use for someone who is not tech-savvy?',
        a: 'Extremely easy. We designed MandiGrow specifically for mandi operators, not IT professionals. Your munim can learn how to generate a bill and farmer patti in less than 15 minutes.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Fast Sabji Billing', desc: 'Create sales pattis and gate passes in seconds. Built for the 5 AM morning rush.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Automatic Commission', desc: 'Stop calculating by hand. MandiGrow auto-deducts your commission, market fee, and labor charges.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'GST & APMC Compliant', desc: 'Generate GST invoices and APMC Mandi Cess reports automatically for your state.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Digital Sabji Khata', desc: 'Maintain live balances for all buyers and farmers. Never lose track of outstanding payments again.' },
];

export default function SabjiMandiSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Sabji Mandi Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/sabji-mandi-software',
        description: 'India\'s #1 sabji mandi ERP software for vegetable commission agents and wholesale traders.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '124' },
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
                        🥬 Sabji Mandi Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        India's Fastest Sabji Mandi Software<br />
                        <span className="text-emerald-700">for Commission Agents</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Replace your paper bahis with a digital Khata. Automate farmer pattis, buyer billing, crate tracking, and commission calculation. The ultimate ERP for Indian Sabzi Mandis.
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Why Sabji Mandi Traders Choose MandiGrow</h2>
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
