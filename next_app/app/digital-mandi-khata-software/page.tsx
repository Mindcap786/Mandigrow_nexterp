import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Digital Mandi Khata Software India | Cloud Ledger — MandiGrow',
    description: 'Replace paper bahis with India\'s best digital mandi khata software. Track farmer advances, buyer outstanding balances, and daily cash flow in real-time.',
    keywords: [
        'digital mandi khata software',
        'mandi khata software',
        'digital ledger for mandi',
        'mandi accounting software',
        'farmer advance tracking',
        'sabzi mandi khata',
        'arhtiya ledger software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/digital-mandi-khata-software' },
    openGraph: {
        title: 'Digital Mandi Khata Software India | MandiGrow',
        description: 'Track farmer advances, buyer outstanding balances, and daily cash flow in real-time with our digital khata.',
        url: 'https://www.mandigrow.com/digital-mandi-khata-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'How is this different from a normal digital khata app?',
        a: 'Standard khata apps only let you enter total amounts (e.g., "Received ₹500"). MandiGrow is integrated with your billing. When you generate a sale bill, the commission is calculated, APMC cess is deducted, and the net amount is automatically posted to the correct farmer and buyer khata. It is fully automated.',
    },
    {
        q: 'Can I track advance cash payments to farmers?',
        a: 'Yes. Advancing cash to farmers before harvest is standard practice. MandiGrow lets you log these advances and automatically deducts them from their final settlement patti when they bring their produce to sell.',
    },
    {
        q: 'Can my buyers see their outstanding balances?',
        a: 'Yes, you can instantly share a PDF or WhatsApp summary of a buyer\'s outstanding balance or a farmer\'s complete ledger history in just one click.',
    },
    {
        q: 'Is my financial data safe?',
        a: 'Yes. Paper bahis can be lost, damaged, or destroyed. MandiGrow securely backs up your khata data on the cloud every second. Only authorized users with secure passwords can access it.',
    },
];

const FEATURES = [
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Real-Time Balances', desc: 'Instantly know exactly who owes you money and who you need to pay, updated every second.' },
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Integrated with Billing', desc: 'No double entry. When you generate a sale patti, the ledger updates automatically.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Advance Tracking', desc: 'Log farmer advances securely and have them automatically deducted during final settlement.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'Instant Sharing', desc: 'Share complete khata statements with buyers and farmers via WhatsApp or PDF in Hindi or English.' },
];

export default function DigitalMandiKhataSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Digital Mandi Khata Software',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/digital-mandi-khata-software',
        description: 'India\'s best digital mandi khata software to replace paper bahis for commission agents.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '175' },
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
                        📓 Digital Mandi Khata Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Replace Your Paper Bahis<br />
                        <span className="text-emerald-700">with a Digital Khata</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Never lose track of a payment again. MandiGrow's integrated Digital Mandi Khata automatically updates balances from your daily billing, tracks farmer advances, and manages buyer credit securely on the cloud.
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Your Ledger, Fully Automated</h2>
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
