import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Marg ERP vs MandiGrow | Which is the Best Mandi Software?',
    description: 'A detailed comparison between Marg ERP and MandiGrow for APMC commission agents. Discover why India\'s top fruit and sabji traders are switching to MandiGrow.',
    keywords: [
        'marg erp vs mandigrow',
        'marg mandi software',
        'marg erp for commission agents',
        'best mandi software',
        'mandi accounting software comparison'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/marg-erp-vs-mandigrow' },
};

export default function MargVsMandiGrowPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#e3eed4] to-[#f7fbf3]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        Software Comparison
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Marg ERP vs <span className="text-emerald-700">MandiGrow</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        Marg ERP is a powerhouse for pharmacies, FMCG distributors, and supermarkets. But if you are an Arhtiya trading in an Indian APMC mandi, trying to force Marg to understand crate tracking, hamali, and farmer advances will cost you months of frustration.
                    </p>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Detailed Argumentative Sections */}
                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
                            <h2 className="text-2xl font-black text-red-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" /> Why Marg ERP Fails for Mandis
                            </h2>
                            <p className="text-gray-600 font-medium leading-relaxed mb-4">
                                Retail software assumes a world of fixed barcodes and MRPs. But a mandi operates on dynamic lots, live auction prices, and varying bag weights.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-2 text-gray-700 font-medium"><XCircle className="w-5 h-5 text-red-500 shrink-0"/> Cannot calculate weight shortages automatically.</li>
                                <li className="flex gap-2 text-gray-700 font-medium"><XCircle className="w-5 h-5 text-red-500 shrink-0"/> Setting up Hamali, Palledari, and APMC Cess requires complicated custom formulas.</li>
                                <li className="flex gap-2 text-gray-700 font-medium"><XCircle className="w-5 h-5 text-red-500 shrink-0"/> No native support for farmer 'Ugaahi' (Advances) tied to daily auctions.</li>
                                <li className="flex gap-2 text-gray-700 font-medium"><XCircle className="w-5 h-5 text-red-500 shrink-0"/> Desktop-bound. Your Munim must sit at the computer rather than in the yard.</li>
                            </ul>
                        </div>
                        <div className="bg-emerald-900 p-8 rounded-3xl text-white shadow-xl">
                            <h2 className="text-2xl font-black text-emerald-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6" /> Why MandiGrow is the Solution
                            </h2>
                            <p className="text-emerald-100 font-medium leading-relaxed mb-4">
                                We did not build retail software. We built Mandi software. Every button and workflow in MandiGrow is designed specifically for Commission Agents and wholesale traders.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex gap-2 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Auto-calculates your Arhat, Market Fee, and Labour on every lot instantly.</li>
                                <li className="flex gap-2 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Generates exact traditional 'Farmer Pattis' in Hindi/Gujarati/Marathi.</li>
                                <li className="flex gap-2 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> Native Crate & Bag inventory ledger that runs parallel to the financial Khata.</li>
                                <li className="flex gap-2 text-emerald-50 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0"/> 100% Cloud-based Mobile App. Run your business from the auction platform.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black mb-6">Stop Forcing Retail Software into a Mandi</h2>
                        <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8">
                            Customizing generic ERPs costs thousands of rupees in developer fees and still results in a clunky experience. Switch to MandiGrow and start billing seamlessly on Day 1.
                        </p>
                        <Link href="/subscribe" className="inline-block bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition shadow-lg">
                            Switch to MandiGrow Today →
                        </Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
