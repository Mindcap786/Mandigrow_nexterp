import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { CheckCircle2, Factory, Scale, FileText, Truck, Users } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Best Mandi Software in Pune | APMC ERP for Gultekdi Market Yard',
    description: 'MandiGrow is the #1 APMC and commission agent software in Pune. Automate Patti (sale slip) generation, Mathadi labor calculations, and farmer settlements at Gultekdi Market Yard and other Pune district APMCs.',
    keywords: [
        'mandi software Pune',
        'APMC software Pune',
        'Gultekdi Market Yard software',
        'Pune mandi software',
        'commission agent software Pune',
        'Mathadi charge software'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-pune' },
    openGraph: {
        title: 'Best Mandi Software in Pune | APMC ERP for Gultekdi Market Yard',
        description: 'MandiGrow automates Patti generation, Mathadi labor calculations, and farmer settlements for Pune\'s wholesale fruit, vegetable, and flower markets.',
        url: 'https://www.mandigrow.com/mandi-software-pune',
        type: 'website',
    },
};

export default function MandiSoftwarePunePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                    {
                        "@type": "Question",
                        "name": "How does the software handle complex Mathadi (labor) charges at Gultekdi Market Yard?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "MandiGrow has a dedicated Mathadi module that automatically calculates loading, unloading, and weighing labor charges based on the specific commodity and bag weight. It generates accurate Mathadi reports for the labor board, saving hours of manual calculation."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Does it support the flower and jaggery markets in Pune?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, MandiGrow is multi-commodity. Whether you are dealing with rapid vegetable auctions, specialized flower market billing, or bulk jaggery (Gur) trading in Pune APMC, the system adapts to your specific unit types and commission rates."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can I print farmer slips (Patti) in Marathi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. You can generate and print Patti in Marathi so farmers from Khed, Junnar, and Manchar can clearly understand their deductions, net amounts, and auction rates."
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
                    PUNE · GULTEKDI · MATHADI AUTOMATION · MARATHI SUPPORTED
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.1]">
                    The #1 Mandi Software for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">Pune's Market Yard</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed">
                    Built for the diverse trade of Pune's Gultekdi APMC. MandiGrow automates your Patti (sale slip) generation, solves complex Mathadi (labor) calculations, and ensures instant, error-free farmer settlements in Marathi and English.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-all hover:-translate-y-0.5">Start 14-Day Free Trial →</Link>
                    <Link href="/contact" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all">Book a Demo in Pune</Link>
                </div>
            </section>

            {/* Why Pune Section */}
            <section className="bg-white border-y border-emerald-100 py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Solve the Toughest APMC Challenges in Pune</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Pune APMC (Gultekdi) handles an incredible variety of commodities—from delicate flowers to bulk jaggery and seasonal fruits. This diversity requires a flexible software system capable of adapting to different commission rates, bag sizes, and statutory Mathadi board reports.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Automated Mathadi Calculations</h3>
                                    <p className="text-gray-600 text-sm mt-1">No more manual tracking of labor charges. The system automatically computes weighing, loading, and unloading charges per bag or per quintal to generate accurate Mathadi Board reports.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Instant Patti & Ledger Updates</h3>
                                    <p className="text-gray-600 text-sm mt-1">The moment the morning auction finishes, generate farmer sale slips (Patti) instantly via WhatsApp or print. The farmer ledger is updated automatically, preventing payment disputes.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <Scale className="w-6 h-6 text-emerald-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Multi-Commodity Support</h3>
                                    <p className="text-gray-600 text-sm mt-1">Whether you are an Adatya in the flower section, vegetable block, or grain market of Gultekdi, MandiGrow's flexible unit settings adapt to your specific trade.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-3xl transform -rotate-3"></div>
                        <div className="relative bg-white border border-emerald-100 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black mb-6 border-b pb-4">Trusted Across Pune District</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Gultekdi Market Yard (Pune)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Manchar APMC</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Khed & Junnar Markets</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium text-gray-800">Baramati APMC</span>
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">How does the software handle complex Mathadi (labor) charges at Gultekdi Market Yard?</h3>
                        <p className="text-gray-600">MandiGrow has a dedicated Mathadi module that automatically calculates loading, unloading, and weighing labor charges based on the specific commodity and bag weight. It generates accurate Mathadi reports for the labor board, saving hours of manual calculation.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Does it support the flower and jaggery markets in Pune?</h3>
                        <p className="text-gray-600">Yes, MandiGrow is multi-commodity. Whether you are dealing with rapid vegetable auctions, specialized flower market billing, or bulk jaggery (Gur) trading in Pune APMC, the system adapts to your specific unit types and commission rates.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Can I print farmer slips (Patti) in Marathi?</h3>
                        <p className="text-gray-600">Absolutely. You can generate and print Patti in Marathi so farmers from Khed, Junnar, and Manchar can clearly understand their deductions, net amounts, and auction rates without any language barrier.</p>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-900 text-white py-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tighter mb-6">Modernize Your Pune APMC Operations</h2>
                    <p className="text-emerald-100 mb-10 text-lg">Stop relying on handwritten ledgers. Join the top commission agents in Gultekdi using MandiGrow to scale their business.</p>
                    <Link href="/subscribe" className="inline-block px-10 py-5 bg-white text-emerald-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">Start Your 14-Day Free Trial</Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
