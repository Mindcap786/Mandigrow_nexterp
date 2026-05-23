import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Top Mandi Software in Indore | MP APMC Commission Agent ERP',
    description: 'The ultimate mandi software for Madhya Pradesh. Automate your Anaj and Sabji business at Choithram Mandi with native Hindi support and instant digital khata.',
    keywords: [
        'mandi software indore',
        'APMC software madhya pradesh',
        'choithram mandi software',
        'hindi mandi billing app',
        'anaj mandi software indore',
        'mp apmc erp',
        'commission agent software madhya pradesh'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-indore' },
};

export default function IndoreMandiPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'MandiGrow - Indore Mandi Software',
        description: 'Advanced Mandi ERP built for APMC markets across Madhya Pradesh, featuring Hindi language support and local Anaj mandi workflows.',
        category: 'Business Software',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR'
        }
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#e3eed4] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        <MapPin className="w-4 h-4" /> MP's #1 Mandi ERP
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for <span className="text-emerald-700">Choithram Mandi & MP</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Madhya Pradesh's massive grain (Anaj) and vegetable (Sabji) markets demand accuracy. MandiGrow is the premier software for commission agents in Indore, Bhopal, and across MP to manage farmer settlements flawlessly.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition shadow-lg">
                            Get Your Free Trial →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Rich Content / Localized Value Prop */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-black mb-6">Why Indore's Commission Agents Trust Us</h2>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                Central India is the agricultural powerhouse of the nation. Whether you are trading soybeans and wheat in the massive Anaj mandis or handling daily perishable auctions at <strong>Choithram Mandi</strong> in Indore, a small calculation error can wipe out your margin.
                            </p>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                Standard billing software like Tally is not built for MP's unique APMC cess structure, farmer advances (Ugaahi), or lot-wise yield calculations. MandiGrow automates all of this. It calculates your commission on the fly and posts everything to a secure, cloud-based Bahi-Khata.
                            </p>
                        </div>
                        <div className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-6 text-emerald-800">Designed for MP Mandis</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>100% Hindi Support:</strong> Your entire staff can operate the software in pure Hindi. Print beautiful Hindi settlement pattis for your farmers.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Anaj (Grain) Workflows:</strong> Built-in support for quintal pricing, bag tracking, and moisture deductions specific to MP grains.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Farmer Advances (Ugaahi):</strong> Automatically deduct past loans or advances when generating the final sale patti.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
