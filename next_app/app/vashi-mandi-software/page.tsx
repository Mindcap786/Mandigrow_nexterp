import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: "Vashi Mandi Software — #1 APMC ERP for Mumbai's Largest Vegetable Market",
    description: 'MandiGrow is the most trusted software for Vashi APMC Mandi commission agents. Handles ₹40,000 Cr annual turnover, onion/tomato billing, 8,000+ traders. Free trial.',
    keywords: ['Vashi mandi software, Mumbai APMC ERP, Vashi APMC software, onion mandi software Mumbai, commission agent software Vashi, mandi billing software Navi Mumbai'],
    alternates: { canonical: 'https://www.mandigrow.com/vashi-mandi-software' },
    openGraph: {
        title: "Vashi Mandi Software — #1 APMC ERP for Mumbai's Largest Vegetable Market",
        description: 'MandiGrow is the most trusted software for Vashi APMC Mandi commission agents. Handles ₹40,000 Cr annual turnover, onion/tomato billing, 8,000+ traders. Free trial.',
        url: 'https://www.mandigrow.com/vashi-mandi-software',
        type: 'website',
    },
};

const FAQS = [
    { q: "What is the best mandi software for Vashi APMC?", a: "MandiGrow is the highest-rated commission agent software for Vashi APMC Mandi. It handles onion, tomato, and vegetable billing with auto commission calculation, digital Khata, Maharashtra APMC Market Fee auto-deduction (1%), and GST-compliant Bijak generation — all available in Marathi and Hindi." },
    { q: "Does MandiGrow support Maharashtra APMC rules for Vashi?", a: "Yes. MandiGrow is pre-configured with Maharashtra APMC Act 1963 charges including the 1% Market Fee on sale value. All deductions appear automatically on every Parcha and are included in the periodic APMC return, saving hours of manual reconciliation." },
    { q: "Can MandiGrow handle the scale of Vashi APMC with 8,000+ traders?", a: "Yes. MandiGrow is a cloud ERP that scales without hardware investment. Multiple billing counters can run simultaneously, with data syncing in real time. During peak onion or tomato season arrivals, the system handles thousands of transactions per day without slowdown." },
];

export default function Page() {
    const faqSchema = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };

    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        🧅 Navi Mumbai · Vashi APMC · Maharashtra
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for<br /><span className="text-emerald-700">Vashi APMC Mandi, Navi Mumbai</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed"
                       dangerouslySetInnerHTML={{ __html: 'MandiGrow is the most trusted APMC ERP for <strong>Vashi Mandi</strong> commission agents. Handling ₹40,000 Cr+ annual turnover across 8,000+ traders — automate onion/tomato billing, farmer Patti, Maharashtra APMC levy, and GST in Marathi and Hindi.' }} />
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">
                            Demo in Marathi →
                        </Link>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm font-bold text-gray-600">
                        {['Free Setup', 'Marathi Support', 'APMC Auto-Levy', 'Fast Billing', 'Digital Khata'].map(b => (
                            <div key={b} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{b}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-emerald-900 text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-center mb-10">Key Facts About This Market</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        
                        <div className="bg-emerald-800 rounded-2xl p-6">
                            <div className="text-3xl font-black text-emerald-300 mb-2">₹40,000 Cr+</div>
                            <div className="font-black text-white mb-1">Annual Turnover</div>
                            <div className="text-emerald-200 text-sm">Mumbai APMC is India's highest-value agricultural market</div>
                        </div>
                        <div className="bg-emerald-800 rounded-2xl p-6">
                            <div className="text-3xl font-black text-emerald-300 mb-2">8,000+</div>
                            <div className="font-black text-white mb-1">Licensed Traders</div>
                            <div className="text-emerald-200 text-sm">The largest concentration of agricultural traders in Maharashtra</div>
                        </div>
                        <div className="bg-emerald-800 rounded-2xl p-6">
                            <div className="text-3xl font-black text-emerald-300 mb-2">1%</div>
                            <div className="font-black text-white mb-1">APMC Market Fee</div>
                            <div className="text-emerald-200 text-sm">Maharashtra APMC Act 1963 rate on sale value of produce</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-4">APMC Charges — Auto-Calculated by MandiGrow</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="p-3 text-left">Charge</th><th className="p-3">Rate</th><th className="p-3">Who Pays?</th><th className="p-3">Deposited To</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Market Fee</td><td className="p-3 text-center font-bold">1%</td><td className="p-3 text-center">Buyer</td><td className="p-3 text-center">Maharashtra APMC</td></tr>
                                <tr><td className="p-3">Gala Rent (if applicable)</td><td className="p-3 text-center font-bold">As notified</td><td className="p-3 text-center">Trader</td><td className="p-3 text-center">APMC</td></tr>
                                <tr className="bg-[#f0fdf4]"><td className="p-3">Arhat / Commission</td><td className="p-3 text-center font-bold">4–6% (F&V)</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Arhtiya (Income)</td></tr>
                                <tr><td className="p-3">Hamali / Hamal charges</td><td className="p-3 text-center font-bold">₹2–5/crate</td><td className="p-3 text-center">Farmer</td><td className="p-3 text-center">Labour</td></tr>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-5">
                        {FAQS.map(f => (
                            <div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-[#f7fbf3]">
                                <h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3>
                                <p className="text-gray-700 font-medium leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 px-6 bg-[#f0f7e8] border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Related Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/mandi-software-maharashtra" className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">Maharashtra Mandi →</Link>
                        <Link href="/mandi-software-nashik" className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">Nashik Mandi →</Link>
                        <Link href="/mandi-software-pune" className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">Pune Mandi →</Link>
                        <Link href="/onion-potato-mandi-software" className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">Onion & Potato Software →</Link>
                        <Link href="/commission-agent-software" className="px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">Commission Agent Software →</Link>
                        
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Digitize Your Vashi Mandi Operation</h2>
                    <p className="text-emerald-200 text-lg mb-8">14 days free. Marathi & Hindi support. APMC-compliant billing from day one.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
