import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { CheckCircle2, Scale, FileText, Truck, Calculator } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Indore | APMC ERP for Choithram Mandi',
    description: 'MandiGrow is the leading APMC and commission agent software in Indore. Automate Patti, APMC cess, and accounting at Choithram Mandi and grain markets across MP with full Hindi support.',
    keywords: [
        'mandi software Indore',
        'APMC software MP',
        'Choithram Mandi software',
        'Devi Ahilya Bai Holkar Mandi software',
        'commission agent software Indore',
        'soyabean mandi software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-indore' },
    openGraph: {
        title: 'Best Mandi Software in Indore | APMC ERP for Choithram Mandi',
        description: 'Automate farmer accounting, APMC cess, and Patti generation for Choithram Mandi and other Indore markets with complete Hindi language support.',
        url: 'https://www.mandigrow.com/mandi-software-indore',
        type: 'website',
    },
};

export default function MandiSoftwareIndorePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        "@type": "Question",
                        "name": "Can MandiGrow handle operations for both the vegetable market and the grain market in Indore?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. MandiGrow is highly adaptable. It handles high-speed perishable auctions at Choithram Mandi (fruits and vegetables) as well as bulk trading for Soyabean, Wheat, and Chana in the grain markets."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is the software available in Hindi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow offers complete Hindi language support. You can generate farmer sales slips (Patti), invoices, and ledger reports entirely in Hindi, making it easy for farmers across Madhya Pradesh to understand their accounts."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does the software automate MP Mandi Board compliance and cess?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. MandiGrow automatically calculates and deducts the correct APMC market fees and commission rates based on Madhya Pradesh State Agricultural Marketing Board regulations."
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
                    INDORE · CHOITHRAM MANDI · HINDI SUPPORTED
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    The #1 Mandi Software for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Indore APMCs</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Designed for the massive scale of Madhya Pradesh’s trading hubs. MandiGrow automates commission billing, farmer ledgers, and APMC cess for traders at Choithram Mandi and Indore grain markets—with full Hindi language support.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Demo in Indore</Link>
                </div>
            </section>

            {/* Why Indore Section */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Built for Central India's Largest Markets</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Whether you are dealing with daily perishable auctions at Choithram Mandi (Devi Ahilya Bai Holkar Market) or bulk trading of Soyabean and Wheat, manual accounting leads to delays. MandiGrow digitizes the entire process for Adatyas in MP.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Full Hindi Localization</h3>
                                    <p className="text-gray-600 text-sm mt-1">Generate Patti (sale slips), invoices, and ledger statements in Hindi. Ensure complete transparency with farmers without any language barriers.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Calculator className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Automated MP Mandi Board Compliance</h3>
                                    <p className="text-gray-600 text-sm mt-1">Automatically calculate and deduct the correct APMC market fees and commission rates based on MP State Agricultural Marketing Board rules.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Scale className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Multi-Commodity Weighbridge Integration</h3>
                                    <p className="text-gray-600 text-sm mt-1">Directly import gross and tare weights from electronic scales at the APMC gate, perfect for bulk Soyabean, Wheat, and Chana transactions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Trusted Across MP Markets</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Choithram Mandi (Fruits & Vegetables)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Indore Grain Market (Soyabean & Wheat)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Laxmibai Nagar Mandi</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Ujjain & Dewas APMCs</span>
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Can MandiGrow handle operations for both the vegetable market and the grain market in Indore?</h3>
                        <p className="text-gray-600">Yes. MandiGrow is highly adaptable. It handles high-speed perishable auctions at Choithram Mandi (fruits and vegetables) as well as bulk trading for Soyabean, Wheat, and Chana in the grain markets.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Is the software available in Hindi?</h3>
                        <p className="text-gray-600">Yes, MandiGrow offers complete Hindi language support. You can generate farmer sales slips (Patti), invoices, and ledger reports entirely in Hindi, making it easy for farmers across Madhya Pradesh to understand their accounts.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Does the software automate MP Mandi Board compliance and cess?</h3>
                        <p className="text-gray-600">Absolutely. MandiGrow automatically calculates and deducts the correct APMC market fees and commission rates based on Madhya Pradesh State Agricultural Marketing Board regulations.</p>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Upgrade Your Commission Agency Today</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Join the leading Adatyas and commission agents in Indore who rely on MandiGrow for error-free accounting and faster settlements.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Start Your 14-Day Free Trial</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
