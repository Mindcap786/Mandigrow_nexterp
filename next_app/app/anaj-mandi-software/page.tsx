import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight, Package, BarChart3, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Anaj Mandi Software India | Top ERP for Grain & Pulse Traders',
    description: 'MandiGrow is India\'s #1 anaj mandi software. Handle quintal billing, GST, and farmer khata. Trusted by APMC grain traders in Kurnool, Guntur, Vijayawada, and Punjab.',
    keywords: [
        'anaj mandi software',
        'mandi erp software india',
        'grain mandi software India',
        'wheat mandi software',
        'rice mandi software',
        'dal trader software India',
        'pulse trading software',
        'Kurnool anaj mandi software',
        'Guntur grain APMC ERP',
        'Vijayawada mandi software',
        'Punjab arhtiya software',
        'grain commission agent software',
        'anaj mandi khata software',
        'APMC grain software India',
        'arhtiya software for grain',
        'anaj mandi billing software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/anaj-mandi-software' },
    openGraph: {
        title: 'Anaj Mandi Software India | Grain & Pulse APMC ERP',
        description: 'Complete ERP for anaj mandi operators in AP, Telangana, and North India — commission, GST billing, farmer payments, and stock management.',
        url: 'https://www.mandigrow.com/anaj-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    {
        q: 'What is the best anaj mandi software in India?',
        a: 'MandiGrow is the best anaj mandi software in India for commission agents and grain traders. It handles quintal billing, sack tracking, commission auto-calculation, hamali, and farmer settlements for wheat, rice, dal, and pulses — all with full GST compliance and Hindi language support.',
    },
    {
        q: 'Does MandiGrow support quintal-based grain billing?',
        a: 'Yes. MandiGrow supports quintal, kg, and sack-based billing natively. You can create purchase bills from farmers and sale invoices to buyers in any unit. Weight, rate, commission, market fee, and net payable are all calculated automatically.',
    },
    {
        q: 'Can MandiGrow handle farmer payments for anaj traders?',
        a: 'Yes. MandiGrow\'s farmer payment module records advances, calculates final settlements after commission and charges, and generates a full farmer payment report (patti) with one click — in Hindi and English.',
    },
    {
        q: 'Is MandiGrow compliant with APMC rules for grain markets?',
        a: 'Yes. MandiGrow is built for APMC compliance. Commission rates, market fee percentages, and regulated charges are configurable per APMC rules. The system auto-calculates deductions as per your state\'s APMC Act.',
    },
    {
        q: 'Does MandiGrow support GST billing for anaj traders?',
        a: 'Yes. MandiGrow generates GST-compliant invoices for B2B and B2C anaj transactions. It supports HSN codes for grains and pulses, auto-applies CGST/SGST or IGST, and helps you stay ready for GSTR-1 and GSTR-3B filing.',
    },
    {
        q: 'Is MandiGrow available in Hindi for anaj mandi operators?',
        a: 'Yes. MandiGrow is fully available in Hindi, Telugu, Tamil, Kannada, Malayalam, Urdu, and English. All bills, reports, and pattis can be printed in the language of your choice — making it ideal for anaj mandi operators across India.',
    },
];

const FEATURES = [
    { icon: <Package className="w-6 h-6 text-emerald-600" />, title: 'Quintal & Sack Billing', desc: 'Bill grain in quintals, kilograms, or sacks. Auto-calculate weight, rate, and total for every lot.' },
    { icon: <BarChart3 className="w-6 h-6 text-emerald-600" />, title: 'Commission Auto-Calculation', desc: 'Set APMC commission rates once. Every sale auto-calculates arhat, market fee, hamali, and net farmer payable.' },
    { icon: <FileText className="w-6 h-6 text-emerald-600" />, title: 'GST & Patti Generation', desc: 'Generate GST-compliant invoices and farmer pattis in Hindi or English with one click. HSN codes for all grains.' },
    { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: 'Mandi Khata & Ledgers', desc: 'Digital khata for every farmer and buyer. Track advances, outstanding balances, and complete settlements.' },
];

export default function AnajMandiSoftwarePage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'MandiGrow — Anaj Mandi Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, Web',
        url: 'https://www.mandigrow.com/anaj-mandi-software',
        description: 'India\'s #1 anaj mandi ERP software for wheat, rice, dal and pulse traders. Commission agent software with GST billing, farmer payments, and mandi khata.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '48' },
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
                        🌾 Anaj Mandi Software
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        India's #1 Anaj Mandi Software<br />
                        <span className="text-emerald-700">for Grain & Pulse Traders</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Purpose-built <strong>mandi ERP software india</strong> for anaj mandi operators — auto commission, quintal billing, farmer payments, GST, and full mandi khata. Widely used in <strong>Kurnool, Guntur, Vijayawada, and Punjab</strong> for wheat, rice, dal, and pulses.
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
                        {['Free Training', '₹0 Setup Cost', 'No Credit Card', 'Hindi Support', '200+ Mandis'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What is Anaj Mandi Software */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-6">What is Anaj Mandi Software?</h2>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                        <p>Anaj mandi software is a specialized ERP system built for commission agents (arhatias), grain traders, and APMC mandi operators who deal in wheat, rice, dal, maize, soybean, and other agricultural commodities. Unlike generic accounting software, anaj mandi software understands the language of the grain market — quintals, sacks, hamali, palledari, market fee, and farmer patti.</p>
                        <p className="mt-4">MandiGrow is India's most advanced anaj mandi software, used by over 200 mandi businesses across Andhra Pradesh, Telangana, Maharashtra, Punjab, Rajasthan, Uttar Pradesh, and more. Our system automates the entire grain trade workflow — from farmer arrival and auction to buyer billing and settlement — in one seamless cloud platform.</p>
                        <p className="mt-4">Whether you are a small arhtiya with 50 daily transactions or a large grain commission house handling crores of rupees in weekly turnover, MandiGrow scales to your operation without requiring an IT team or manual data entry.</p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid md:grid-cols-2 gap-6 mt-12">
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

            {/* Who uses */}
            <section className="py-20 px-6 bg-[#f0f7e8]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-10 text-center">Who Uses MandiGrow Anaj Mandi Software?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'Grain Commission Agents (Arhatias)', desc: 'Automate commission on every sale. Generate farmer pattis, buyer bills, and settlement reports without manual calculation.' },
                            { title: 'Wheat & Rice Traders', desc: 'Track lot-wise stock, manage buyer credit, record purchase bills from farmers, and reconcile daily accounts with full GST compliance.' },
                            { title: 'Dal & Pulse Merchants', desc: 'Manage multiple commodity lots, track varieties separately, and handle clearing of party outstanding balances with the digital khata.' },
                        ].map(u => (
                            <div key={u.title} className="bg-white border border-emerald-100 rounded-2xl p-7 shadow-sm">
                                <h3 className="font-black text-xl text-gray-900 mb-3">{u.title}</h3>
                                <p className="text-gray-600 font-medium leading-relaxed">{u.desc}</p>
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

            {/* Internal links to state/related pages */}
            <section className="py-16 px-6 bg-[#f0f7e8] border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Explore MandiGrow for Your Region & Business</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: '/sabji-billing-software', label: 'Sabji Billing Software' },
                            { href: '/fruit-vegetable-billing', label: 'Fruit & Veg Billing' },
                            { href: '/commission-agent-software', label: 'Commission Agent Software' },
                            { href: '/mandi-khata-software', label: 'Mandi Khata Software' },
                            { href: '/mandi-software-andhra-pradesh', label: 'Andhra Pradesh Mandi' },
                            { href: '/mandi-software-telangana', label: 'Telangana Mandi' },
                            { href: '/mandi-software-maharashtra', label: 'Maharashtra Mandi' },
                            { href: '/gst-mandi-compliance', label: 'GST Compliance' },
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
                    <h2 className="text-4xl font-black text-white mb-4">Ready to Digitize Your Anaj Mandi?</h2>
                    <p className="text-emerald-200 text-lg font-medium mb-8">Free onboarding. Free training. No setup cost. Our team sets everything up for you — in Hindi.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
