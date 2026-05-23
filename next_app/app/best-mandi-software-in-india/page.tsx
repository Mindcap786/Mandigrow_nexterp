import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in India (2026) | APMC Commission Agent ERP',
    description: 'Looking for the best mandi software in India? MandiGrow automates commission, farmer pattis, APMC cess, and digital khata. Trusted by 10,000+ Arhtiyas nationwide.',
    keywords: [
        'best mandi software in india',
        'top mandi erp',
        'no 1 mandi billing app',
        'mandi accounting software india',
        'apmc commission agent software',
        'arhtiya software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/best-mandi-software-in-india' },
};

export default function BestMandiSoftwarePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#e3eed4] to-[#f7fbf3]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🏆 The Industry Standard
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        The Best Mandi Software in <span className="text-emerald-700">India</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        There is a reason the largest commission agents in Azadpur, Vashi, and Yeshwanthpur are migrating to MandiGrow. It is the only cloud ERP built exclusively for Indian APMC mandis.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition shadow-lg">
                            Claim Your Free Trial →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Why is MandiGrow Ranked #1?</h2>
                        <p className="text-gray-600 font-medium max-w-2xl mx-auto">
                            Generic accounting software fails in the mandi. MandiGrow succeeds because it embraces the chaos of daily auctions, dynamic lot pricing, and complex farmer settlements.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrendingUp className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">Instant Commission (Arhat)</h3>
                            <p className="text-gray-600 font-medium">
                                Configure your Arhat percentages once. MandiGrow auto-calculates your commission, Hamali, and state APMC Cess on every single sale instantly.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">Live Digital Khata</h3>
                            <p className="text-gray-600 font-medium">
                                Throw away the red Bahi-Khata. Track farmer advances (Ugaahi), buyer outstanding, and crate deposits in real-time on our bank-grade secure cloud.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">7 Regional Languages</h3>
                            <p className="text-gray-600 font-medium">
                                Build absolute trust with your farmers by printing settlement pattis in Hindi, Gujarati, Marathi, Tamil, Telugu, or Kannada.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
