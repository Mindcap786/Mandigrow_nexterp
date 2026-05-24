import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { CheckCircle2, Factory, Scale, FileText, Truck, Globe } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Ahmedabad | APMC ERP for Gujarat',
    description: 'MandiGrow is the leading APMC and commission agent software in Ahmedabad. Automate auction billing, APMC cess, and farmer ledgers at Chimanbhai Patel, Jamalpur, and Naroda APMC markets with full Gujarati support.',
    keywords: [
        'mandi software Ahmedabad',
        'APMC software Gujarat',
        'Chimanbhai Patel market yard software',
        'Jamalpur APMC software',
        'commission agent software Ahmedabad',
        'Naroda fruit market software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-ahmedabad' },
    openGraph: {
        title: 'Best Mandi Software in Ahmedabad | APMC ERP for Gujarat',
        description: 'MandiGrow automates auction billing, APMC cess, and farmer ledgers for Ahmedabad\'s major APMC markets including Chimanbhai Patel and Jamalpur.',
        url: 'https://www.mandigrow.com/mandi-software-ahmedabad',
        type: 'website',
    },
};

export default function MandiSoftwareAhmedabadPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        "@type": "Question",
                        "name": "Does the software support Gujarati language for APMC billing?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow offers complete Gujarati language support. You can generate farmer sales slips (Patti), invoices, and ledger reports entirely in Gujarati, ensuring clear communication with local farmers."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can MandiGrow handle operations for the Naroda Fruit Market?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. MandiGrow is highly adaptable. It handles high-speed fruit auctions, bulk container billing, and commission rates specific to the Naroda Fruit Market and Chimanbhai Patel Market Yard."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is the software compatible with e-NAM for Gujarat APMCs?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow is designed to simplify e-NAM (National Agriculture Market) compliance, allowing traders in Ahmedabad to easily manage inter-state trades, generate gate passes, and export transaction data."
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
                    AHMEDABAD · GUJARATI SUPPORTED · E-NAM COMPLIANT
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    The #1 Mandi Software for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Ahmedabad APMCs</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Designed for the scale of Gujarat's largest agricultural hubs. MandiGrow automates commission billing, farmer ledgers, and APMC cess for traders at Chimanbhai Patel, Jamalpur, and Naroda markets—with full Gujarati language support.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Demo in Ahmedabad</Link>
                </div>
            </section>

            {/* Why Ahmedabad Section */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Built for Gujarat's Fastest Moving Markets</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Ahmedabad's APMC yards handle an incredible volume of vegetables, fruits, and grains every morning. Manual accounting leads to payment delays and calculation errors. MandiGrow replaces paper ledgers with a lightning-fast digital system tailored to Gujarat's trading rules.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Globe className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Full Gujarati Localization</h3>
                                    <p className="text-gray-600 text-sm mt-1">Generate Patti (sale slips), invoices, and ledger statements in Gujarati. Ensure complete transparency with farmers without any language barriers.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Automated APMC Cess & Commission</h3>
                                    <p className="text-gray-600 text-sm mt-1">Automatically calculate and deduct the correct APMC market fees and commission rates based on whether you are trading vegetables at Jamalpur or fruits at Naroda.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Truck className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Gate Pass & Inventory Automation</h3>
                                    <p className="text-gray-600 text-sm mt-1">Manage In-Gate arrivals, track stock across godowns, and generate Out-Gate passes instantly to reduce congestion in the busy Chimanbhai Patel market yard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Trusted Across Ahmedabad</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Shri Chimanbhai Jivabhai Patel Market Yard</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Sardar Patel Market (Jamalpur)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Naroda Fruit Market</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Pandit Dindayal Daskroi Grain Market</span>
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Does the software support Gujarati language for APMC billing?</h3>
                        <p className="text-gray-600">Yes, MandiGrow offers complete Gujarati language support. You can generate farmer sales slips (Patti), invoices, and ledger reports entirely in Gujarati, ensuring clear communication with local farmers.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Can MandiGrow handle operations for the Naroda Fruit Market?</h3>
                        <p className="text-gray-600">Absolutely. MandiGrow is highly adaptable. It handles high-speed fruit auctions, bulk container billing, and commission rates specific to the Naroda Fruit Market and Chimanbhai Patel Market Yard.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Is the software compatible with e-NAM for Gujarat APMCs?</h3>
                        <p className="text-gray-600">Yes, MandiGrow is designed to simplify e-NAM (National Agriculture Market) compliance, allowing traders in Ahmedabad to easily manage inter-state trades, generate gate passes, and export transaction data.</p>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Upgrade Your Commission Agency Today</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Join the leading Adatyas and commission agents in Ahmedabad who rely on MandiGrow for error-free accounting and faster settlements.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Start Your 14-Day Free Trial</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
