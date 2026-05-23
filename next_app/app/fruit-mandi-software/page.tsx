import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Fruit Mandi Software India | Best APMC ERP for Azadpur, Vashi & Bowenpally',
    description: 'India\'s #1 fruit mandi software. Track box weights, auto-calculate commission, manage wastage, and handle digital khata for fruit commission agents across APMC markets like Azadpur, Vashi, and Bowenpally.',
    keywords: [
        'fruit mandi software',
        'fruit mandi billing software',
        'apple trader software',
        'mango mandi software',
        'fruit commission agent software',
        'APMC fruit software',
        'mandi erp for fruits',
        'fruit wholesale billing',
        'Azadpur mandi fruit software',
        'Vashi APMC billing software',
        'Bowenpally fruit market ERP',
        'Ghazipur mandi khata',
        'Okhla fruit mandi billing',
        'Maharashtra APMC software',
        'Delhi fruit market software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/fruit-mandi-software' },
    openGraph: {
        title: 'Fruit Mandi Software India | Top APMC ERP — MandiGrow',
        description: 'Manage box-wise inventory, farmer pattis, APMC cess, and buyer outstanding with India\'s fastest fruit mandi software for Azadpur, Vashi, and local markets.',
        url: 'https://www.mandigrow.com/fruit-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'What makes fruit mandi software different from regular billing software?',
        a: 'Fruit mandi trade operates on boxes, crates, and varying weights (e.g., Apple boxes vs Mango crates). A standard billing software cannot handle weight shortage, wastage, and dynamic lot pricing. MandiGrow is built to handle all these native mandi workflows.',
    },
    {
        q: 'Can it auto-calculate my commission and hamali?',
        a: 'Yes. MandiGrow automatically calculates your Arhtiya commission, hamali, palledari, and APMC cess the moment you generate a sale bill, instantly posting the net amount to the farmer\'s digital khata.',
    },
    {
        q: 'Is this software available in Hindi and regional languages?',
        a: 'Yes. MandiGrow natively supports Hindi, Marathi, Telugu, Tamil, Kannada, Malayalam, and Urdu. You can print farmer pattis and buyer bills in the language of your choice.',
    },
    {
        q: 'Can I track empty crates and boxes?',
        a: 'Absolutely. MandiGrow has a built-in crate ledger that tracks issued and returned crates for every buyer and farmer, preventing thousands of rupees in crate leakage.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Box & Weight Billing', desc: 'Bill by the box, carton, or kilogram. Instantly manage weight shortages and varying box sizes.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Auto Commission Calculation', desc: 'Set your commission rules once. Every sale automatically calculates Arhat, Market Fee, and Hamali.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'Instant Farmer Pattis', desc: 'Generate complete settlement statements for farmers in seconds, ready to be printed or WhatsApped in Hindi.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Digital Party Khata', desc: 'Real-time ledger for farmers and buyers. Track advance payments and outstanding dues with zero calculation errors.' },
];

export default function FruitMandiSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Fruit Mandi Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/fruit-mandi-software',
        description: 'India\'s #1 fruit mandi ERP software for commission agents and wholesale fruit traders.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '62' },
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

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🍎 Fruit Mandi Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        India's #1 Fruit Mandi Software<br />
                        <span className="text-emerald-700">for APMC Commission Agents</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Stop losing money on weight calculation errors and empty crates. Automate your fruit wholesale business with India's most powerful mandi ERP. Trusted by top traders in <strong>Azadpur Mandi, Vashi APMC, Bowenpally, Ghazipur, and Okhla</strong>. Handle Apple, Mango, Banana, and Citrus workflows with ease.
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

            {/* Features */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-4 text-center">Built for Local Fruit Markets & APMCs</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto font-medium">From Delhi's Azadpur to Mumbai's Vashi and Hyderabad's Bowenpally, MandiGrow handles regional APMC cess rules, local languages, and complex box-weight math effortlessly.</p>
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

            {/* FAQ */}
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
            {/* SEO Topical Authority Links */}
            <section className="py-16 px-6 bg-[#0d1f14] text-white">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-black mb-8">Explore the MandiGrow Ecosystem</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/apple-mandi-software" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Apple Mandi Billing</Link>
                        <Link href="/mango-mandi-software" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Mango Commission Agent App</Link>
                        <Link href="/sabji-mandi-software" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Sabji Mandi ERP</Link>
                        <Link href="/mandi-crate-management-software" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Crate Tracking Ledger</Link>
                        <Link href="/digital-mandi-khata-software" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Digital Farmer Khata</Link>
                        <Link href="/best-mandi-software-in-india" className="px-5 py-2.5 rounded-full bg-emerald-900/50 border border-emerald-800 hover:bg-emerald-800 transition font-medium text-sm">Why We Are #1 in India</Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
