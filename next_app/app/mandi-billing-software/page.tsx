import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Billing Software India | GST APMC ERP & Khata',
    description: 'Fastest mandi billing software in India. Auto-calculate commission, market fees, and hamali. Generate farmer pattis and GST buyer invoices in seconds.',
    keywords: [
        'mandi billing software',
        'gst billing software for mandi',
        'mandi erp software india',
        'mandi billing software India',
        'mandi accounting software',
        'APMC billing software',
        'commission agent software',
        'arhtiya billing software',
        'agriculture billing software',
        'mandi erp',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-billing-software' },
    openGraph: {
        title: 'GST Mandi Billing Software | Commission Agent ERP',
        description: 'Auto-calculate commission, market fees, and hamali. Generate farmer pattis and buyer invoices in seconds.',
        url: 'https://www.mandigrow.com/mandi-billing-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'Does this software generate both B2B GST invoices and B2C non-GST bills?',
        a: 'Yes. MandiGrow allows you to manage both registered and unregistered buyers. You can instantly generate a B2B GST tax invoice with HSN codes, or a simple B2C cash bill for daily retail buyers.',
    },
    {
        q: 'Will it automatically deduct my Arhtiya commission from the farmer patti?',
        a: 'Yes. You configure your commission percentage (e.g., 6% or 8%) once. When you generate a sale bill, the software automatically deducts the commission, APMC cess, and labor from the gross total to calculate the net farmer payable amount.',
    },
    {
        q: 'Can I print bills in regional languages?',
        a: 'Yes, MandiGrow supports printing bills and farmer pattis in Hindi, Marathi, Telugu, Tamil, Kannada, and English.',
    },
    {
        q: 'Do I need to buy expensive computers to use this?',
        a: 'No. MandiGrow is a modern cloud ERP. You can run the entire billing software from a standard laptop, tablet, or even an Android smartphone using our mobile app at the mandi gate.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Lightning Fast Billing', desc: 'Create 50+ bills per hour during the morning rush. Scan, weigh, and print in seconds.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Automated Deductions', desc: 'Arhat, Hamali, Palledari, and Mandi Tax are auto-calculated on every sale.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'GST Ready', desc: 'Seamlessly export GSTR-1 and GSTR-3B data. Built-in HSN codes for agricultural produce.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Digital Ledger (Khata)', desc: 'Live party balances. Know exactly who owes you money and who you need to pay at all times.' },
];

export default function MandiBillingSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Mandi Billing Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/mandi-billing-software',
        description: 'India\'s fastest mandi billing software for commission agents, handling GST invoices and farmer pattis.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '156' },
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
                        🧾 Mandi Billing Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        The Fastest Mandi Billing Software<br />
                        <span className="text-emerald-700">for Commission Agents</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Say goodbye to calculation errors and missing bills. The most trusted <strong>gst billing software for mandi</strong> operators. Generate buyer invoices, farmer pattis, and GST reports instantly. The ultimate <strong>agriculture billing software</strong> for Indian APMCs.
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
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-6 text-center">Smart Billing for the Mandi</h2>
                    
                    <div className="mb-16 prose prose-lg text-gray-700 max-w-none">
                        <p className="text-xl text-center max-w-3xl mx-auto mb-10">Generic accounting software like Tally or Busy fails in the mandi because they are built for retail shops, not auction yards. MandiGrow is built specifically for the high-speed, high-volume reality of agricultural APMCs.</p>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-[#f7fbf3] border border-emerald-100 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-gray-900 mt-0 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm">1</span>
                                    The 5-Second Billing Rule
                                </h3>
                                <p className="mb-0 text-gray-700">In a morning rush between 5 AM and 9 AM, a commission agent handles hundreds of buyers. You do not have 3 minutes to generate a bill. MandiGrow's POS interface allows you to select the farmer lot, enter the auction rate, and print a thermal receipt in <strong>under 5 seconds</strong>. No mouse required.</p>
                            </div>
                            <div className="bg-[#f7fbf3] border border-emerald-100 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-gray-900 mt-0 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm">2</span>
                                    Katchi Parchi vs Pakki Parchi
                                </h3>
                                <p className="mb-0 text-gray-700">Generate a <em>Katchi Parchi</em> (rough estimate/slip) during the live auction for the buyer to take delivery of the goods. Later, easily convert these into a consolidated <em>Pakki Parchi</em> (GST Tax Invoice) for formal accounting and compliance without re-entering any data.</p>
                            </div>
                            <div className="bg-[#f7fbf3] border border-emerald-100 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-gray-900 mt-0 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm">3</span>
                                    Auto APMC 6R & J-Form
                                </h3>
                                <p className="mb-0 text-gray-700">Stop spending hours manually calculating Mandi Shulk (tax) and Nirashrit fund. MandiGrow auto-calculates all APMC cesses based on your state's active rates and automatically generates the <strong>6R form</strong> or <strong>J-Form</strong> ready for submission to the Mandi Samiti.</p>
                            </div>
                            <div className="bg-[#f7fbf3] border border-emerald-100 p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-gray-900 mt-0 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm">4</span>
                                    Regional Language Thermal Prints
                                </h3>
                                <p className="mb-0 text-gray-700">Farmers prefer to read their Pattis (settlement bills) in their native tongue. MandiGrow natively supports thermal printing in Hindi, Telugu, Marathi, Tamil, Kannada, and Urdu, building extreme trust between the Arhtiya and the Kisan.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white shadow-sm border border-emerald-100 rounded-2xl p-6 flex gap-4">
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
