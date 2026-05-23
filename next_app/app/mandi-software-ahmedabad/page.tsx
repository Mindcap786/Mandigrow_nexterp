import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, MapPin, TrendingUp, BookOpen, Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Ahmedabad | APMC ERP for Gujarat Traders',
    description: 'The top-rated mandi software for commission agents in Ahmedabad, Surat, and Rajkot. Handle Chimanbhai Patel APMC billing, Gujarati farmer pattis, and digital khata.',
    keywords: [
        'mandi software ahmedabad',
        'APMC software gujarat',
        'chimanbhai patel apmc software',
        'gujarati mandi billing app',
        'surat apmc software',
        'rajkot mandi erp',
        'commission agent software ahmedabad'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-ahmedabad' },
};

export default function AhmedabadMandiPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'MandiGrow - Ahmedabad Mandi Software',
        description: 'Advanced Mandi ERP built for APMC markets across Gujarat, featuring Gujarati language support and local APMC cess rules.',
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
                        <MapPin className="w-4 h-4" /> Gujarat's #1 Mandi ERP
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Powering the <span className="text-emerald-700">Ahmedabad APMC</span> Trade
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        Whether you are trading potatoes in <strong>Deesa</strong>, mangoes in <strong>Surat</strong>, or managing massive volumes at the <strong>Chimanbhai Patel APMC in Ahmedabad</strong>, generic software like Tally won't work. MandiGrow is customized for Gujarat's commission agents.
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
                            <h2 className="text-3xl font-black mb-6">Why Gujarat's Top Arhtiyas Choose MandiGrow</h2>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                The wholesale markets of Gujarat operate at lightning speed. From the massive <strong>Jamalpur Market</strong> to the grains of <strong>Rajkot APMC</strong>, traders face unique challenges: managing farmer advances, calculating fluctuating market fees, and maintaining clear Gujarati ledgers.
                            </p>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                MandiGrow automates the complex APMC calculations. The moment a lot is auctioned, our system calculates the Arhat (Commission), deducts the exact local APMC cess, and generates a detailed farmer patti that can be instantly shared via WhatsApp in <strong>Gujarati or Hindi</strong>.
                            </p>
                        </div>
                        <div className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-6 text-emerald-800">Features Built for Gujarat</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Gujarati Language Support:</strong> Print your bills and Khatas in the local language to build trust with local farmers.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Crate & Bag Management:</strong> Track your plastic crates and gunny bags flawlessly to prevent deposit losses.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Live Digital Khata:</strong> Replace your red Bahi-Khata with a secure cloud ledger that never loses data.</span>
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
