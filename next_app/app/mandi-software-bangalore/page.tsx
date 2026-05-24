import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { CheckCircle2, Factory, Scale, FileText, Truck, Landmark } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Bangalore | APMC ERP for Yeshwanthpur',
    description: 'MandiGrow is the #1 APMC software for Bangalore. Manage massive wholesale volumes at Yeshwanthpur APMC, KR Puram, and Dasanapura. Generate Patti in Kannada, manage weighbridges, and automate APMC cess.',
    keywords: [
        'mandi software Bangalore',
        'APMC software Karnataka',
        'Yeshwanthpur APMC software',
        'Bangalore mandi software',
        'commission agent software Bangalore',
        'KR Puram market software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-bangalore' },
    openGraph: {
        title: 'Best Mandi Software in Bangalore | APMC ERP for Yeshwanthpur',
        description: 'Automate accounting, farmer settlements, and APMC cess for Yeshwanthpur, KR Puram, and Dasanapura markets in Bangalore with full Kannada support.',
        url: 'https://www.mandigrow.com/mandi-software-bangalore',
        type: 'website',
    },
};

export default function MandiSoftwareBangalorePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        "@type": "Question",
                        "name": "Can MandiGrow handle the massive scale of Yeshwanthpur APMC Yard?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow is cloud-based and built for high-volume transactions. Whether you are dealing with hundreds of onion trucks daily or bulk dry produce and grains, the software handles unlimited daily entries without slowing down."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is the software available in Kannada?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow provides comprehensive Kannada language support. You can print Patti (sale slips), ledger statements, and invoices directly in Kannada to ensure clear communication with local Karnataka farmers."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does the software support multiple markets like KR Puram and Dasanapura?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. You can manage multi-branch operations. If you operate in the Yeshwanthpur main yard and have a sub-branch in Dasanapura or deal in perishables at KR Puram, MandiGrow unifies all your accounts."
                        }
                    }
                ]
            }) }} />

            <nav className="w-full border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter">MandiGrow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/features" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Features</Link>
                        <Link href="/pricing" className="text-sm font-bold text-gray-700 hover:text-emerald-800 hidden md:block">Pricing</Link>
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">Free Trial →</Link>
                    </div>
                </div>
            </nav>

            {/* Hyper-Local Hero Section */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-6 border border-emerald-200">
                    BENGALURU · YESHWANTHPUR · KANNADA SUPPORTED
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    The #1 Mandi Software for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Bangalore APMCs</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Yeshwanthpur APMC is one of South India's largest trading hubs. MandiGrow provides the speed and scale required to manage bulk grains, onions, and perishables. Automate your weighbridge, APMC cess, and Patti generation with native Kannada support.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Demo in Bengaluru</Link>
                </div>
            </section>

            {/* Why Bangalore Section */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Built for South India's Mega Markets</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Managing operations in a sprawling market like Yeshwanthpur or coordinating perishables at KR Puram requires robust logistics and accounting. Handwritten ledgers can't keep up with the daily truck volume. MandiGrow brings cloud-based speed to Bangalore's commission agents.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Scale className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">High-Volume Weighbridge Automation</h3>
                                    <p className="text-gray-600 text-sm mt-1">Directly connect electronic weighbridges to the software for instant weight capture. Perfect for bulk dry produce, ragi, maize, and massive onion arrivals.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Kannada Language Patti & Ledgers</h3>
                                    <p className="text-gray-600 text-sm mt-1">Generate farmer sale slips, invoices, and payment receipts entirely in Kannada, ensuring complete transparency and trust with local suppliers.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Landmark className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Multi-Market Branch Management</h3>
                                    <p className="text-gray-600 text-sm mt-1">Consolidate accounts if you have a main office at Yeshwanthpur and sub-yards at Dasanapura or Binny Mill Market. Track inventory and cash flow across all locations seamlessly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform -rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Trusted Across Bengaluru Markets</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Yeshwanthpur APMC Yard (Main)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">KR Puram Market (Perishables)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Dasanapura Sub-Yard</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Binny Mill Market</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 max-w-4xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Can MandiGrow handle the massive scale of Yeshwanthpur APMC Yard?</h3>
                        <p className="text-gray-600">Yes, MandiGrow is cloud-based and built for high-volume transactions. Whether you are dealing with hundreds of onion trucks daily or bulk dry produce and grains, the software handles unlimited daily entries without slowing down.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Is the software available in Kannada?</h3>
                        <p className="text-gray-600">Yes, MandiGrow provides comprehensive Kannada language support. You can print Patti (sale slips), ledger statements, and invoices directly in Kannada to ensure clear communication with local Karnataka farmers.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Does the software support multiple markets like KR Puram and Dasanapura?</h3>
                        <p className="text-gray-600">Absolutely. You can manage multi-branch operations. If you operate in the Yeshwanthpur main yard and have a sub-branch in Dasanapura or deal in perishables at KR Puram, MandiGrow unifies all your accounts into one dashboard.</p>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Scale Your Bengaluru Commission Business</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Join the leading Adatyas and commission agents in Yeshwanthpur who rely on MandiGrow for error-free accounting and faster settlements.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Start Your 14-Day Free Trial</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
