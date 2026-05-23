import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Bangalore | Yeshwanthpur APMC ERP',
    description: 'Transform your mandi business in Bangalore, Hubli, and Mysore with MandiGrow. Complete software for Yeshwanthpur APMC commission agents with native Kannada support.',
    keywords: [
        'mandi software bangalore',
        'APMC software karnataka',
        'yeshwanthpur apmc software',
        'kannada mandi billing app',
        'kr market billing software',
        'hubli mandi erp',
        'commission agent software bangalore'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-bangalore' },
};

export default function BangaloreMandiPage() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'MandiGrow - Bangalore Mandi Software',
        description: 'Advanced Mandi ERP built for APMC markets across Karnataka, featuring Kannada language support and local APMC cess rules.',
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
                        <MapPin className="w-4 h-4" /> Karnataka's Top Mandi ERP
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for <span className="text-emerald-700">Yeshwanthpur & KR Market</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                        South India's massive agricultural trade requires speed and precision. MandiGrow is the ultimate software for commission agents in Bangalore, automating your box billing, hamali, and digital khata.
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
                            <h2 className="text-3xl font-black mb-6">Why Karnataka Traders Trust MandiGrow</h2>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                Bangalore is the heart of South India's fresh produce supply chain. From the massive onion and potato trades in <strong>Yeshwanthpur APMC</strong> to the bustling daily vegetable auctions at <strong>KR Market</strong> and Singena Agrahara, traders face intense volume pressure.
                            </p>
                            <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                                We studied the exact workflows of Karnataka's commission agents. When you use MandiGrow, you aren't fighting against generic accounting rules. The software natively understands dynamic weight shortages, Karnataka APMC cess calculations, and complex farmer advance settlements.
                            </p>
                        </div>
                        <div className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-6 text-emerald-800">Designed for Bangalore</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Kannada Interface:</strong> Operate the app and print professional farmer pattis entirely in Kannada, ensuring total transparency with local farmers.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>Onion & Potato Workflows:</strong> Specialized logic for lot-based billing and gunny bag weight deductions.</span>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <span className="font-medium text-gray-700"><strong>WhatsApp Invoicing:</strong> Share instant settlement PDFs to your buyer's WhatsApp the moment an auction concludes.</span>
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
