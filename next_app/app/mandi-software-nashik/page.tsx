import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { CheckCircle2, Factory, Scale, FileText, Truck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Nashik | APMC ERP for Lasalgaon & Pimpalgaon',
    description: 'MandiGrow is the leading APMC and commission agent software in Nashik. Built specifically for India\'s onion capital—automating weighbridge, farmer ledgers, APMC cess, and e-NAM integration at Lasalgaon, Pimpalgaon, and Panchavati mandis.',
    keywords: [
        'mandi software Nashik',
        'APMC software Nashik',
        'Lasalgaon onion market software',
        'Pimpalgaon APMC software',
        'commission agent software Nashik',
        'weighbridge integration mandi software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-nashik' },
    openGraph: {
        title: 'Best Mandi Software in Nashik | APMC ERP for Lasalgaon & Pimpalgaon',
        description: 'MandiGrow is the leading APMC and commission agent software in Nashik. Automating weighbridge, farmer ledgers, and APMC cess for the onion capital of India.',
        url: 'https://www.mandigrow.com/mandi-software-nashik',
        type: 'website',
    },
};

export default function MandiSoftwareNashikPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        "@type": "Question",
                        "name": "Does MandiGrow support weighbridge integration for onion trucks at Lasalgaon APMC?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow provides direct hardware integration with electronic weighbridges. When a truck of onions or grapes arrives at Lasalgaon or Pimpalgaon, the gross and tare weights are automatically captured directly into the software to eliminate manual errors."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can the software calculate APMC cess and generate Mathadi reports?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. MandiGrow automatically deducts the specific APMC market fees, labor (Mathadi) charges, and commission rates applicable in Maharashtra, generating compliance-ready reports for the APMC committee."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is MandiGrow available in Marathi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow offers full Marathi language support, making it easy for local farmers, agents, and APMC staff in Nashik to use the platform in their native language."
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
                    NASHIK · LASALGAON · PIMPALGAON · MARATHI SUPPORTED
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    The #1 Mandi Software for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Nashik&apos;s APMCs</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Nashik handles India's largest volume of onions, grapes, and pomegranates. MandiGrow is custom-built to handle the massive truck volumes at Lasalgaon and Pimpalgaon with automated weighbridge integration, local Marathi billing, and instant farmer settlements.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Demo in Nashik</Link>
                </div>
            </section>

            {/* Why Nashik Section */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Built Specifically for the Scale of Nashik Mandis</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            With 17 APMC markets in the district—including Asia's largest onion market at Lasalgaon—Nashik commission agents face unique challenges. Manual entry slows down gate operations, handwritten farmer ledgers lead to disputes, and calculating APMC cess on high volumes is prone to error. MandiGrow digitizes the entire supply chain.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Scale className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Weighbridge Integration</h3>
                                    <p className="text-gray-600 text-sm mt-1">Directly import gross and tare weights from electronic scales at the APMC gate, eliminating manual entry for massive onion and tomato truckloads.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Automated Mathadi & APMC Cess</h3>
                                    <p className="text-gray-600 text-sm mt-1">Automatically deduct Mathadi (labor) charges, market fees, and adatyas (commission) exactly according to Maharashtra State Agricultural Marketing Board (MSAMB) rules.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Truck className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">e-NAM & Export Ready</h3>
                                    <p className="text-gray-600 text-sm mt-1">Exporting Nashik grapes or pomegranates? Generate GST-compliant invoices, track out-gate passes, and sync with e-NAM effortlessly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Trusted Across Nashik District</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Lasalgaon APMC (Onion)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Pimpalgaon Baswant (Tomato & Grape)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Panchavati APMC (Nashik City)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Sinnar & Niphad Markets</span>
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Does MandiGrow support weighbridge integration for onion trucks at Lasalgaon APMC?</h3>
                        <p className="text-gray-600">Yes, MandiGrow provides direct hardware integration with electronic weighbridges. When a truck of onions or grapes arrives at Lasalgaon or Pimpalgaon, the gross and tare weights are automatically captured directly into the software to eliminate manual errors and speed up the gate process.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Can the software calculate APMC cess and generate Mathadi reports?</h3>
                        <p className="text-gray-600">Absolutely. MandiGrow automatically deducts the specific APMC market fees, labor (Mathadi) charges, and commission rates applicable in Maharashtra, generating compliance-ready reports for the APMC committee instantly.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Is MandiGrow available in Marathi?</h3>
                        <p className="text-gray-600">Yes, MandiGrow offers full Marathi language support. You can print Patti (sale slips) and invoices in Marathi, making it incredibly easy for local farmers and agents to understand their ledgers.</p>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Ready to Digitize Your Nashik APMC Business?</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Join the hundreds of commission agents across Maharashtra who have switched to MandiGrow for faster auctions and error-free accounting.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Start Your 14-Day Free Trial</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
