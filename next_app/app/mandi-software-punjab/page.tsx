import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Software Punjab | Grain & Fruit Trader ERP for Punjab Mandis — MandiGrow',
    description: 'MandiGrow is the best mandi software for Punjab. Built for arhatias, grain traders, and APMC commission agents in Amritsar, Ludhiana, Jalandhar, and all Punjab mandis. Free trial.',
    keywords: ['mandi software Punjab', 'grain mandi software Punjab', 'arhtiya software Punjab', 'commission agent software Punjab', 'APMC software Punjab', 'Punjab mandi ERP', 'wheat mandi software Punjab', 'Amritsar mandi software', 'Ludhiana mandi software'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-punjab' },
    openGraph: { title: 'Mandi Software Punjab | Commission Agent ERP — MandiGrow', description: 'MandiGrow mandi ERP for Punjab arhatias and traders. Auto commission, GST billing, farmer patti, and khata.', url: 'https://www.mandigrow.com/mandi-software-punjab', type: 'website' },
};

const CITIES = ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Moga', 'Ferozepur', 'Hoshiarpur', 'Gurdaspur', 'Fazilka'];
const FAQS = [
    { q: 'Is MandiGrow available for Punjab mandi operators?', a: 'Yes. MandiGrow serves arhatias, grain traders, and commission agents across all Punjab APMCs including Amritsar, Ludhiana, Jalandhar, Patiala, and Bathinda. Our team provides setup and training in Hindi and Punjabi.' },
    { q: 'Does MandiGrow support wheat and paddy billing for Punjab?', a: 'Yes. MandiGrow supports quintal-based billing for wheat, paddy (Basmati and non-Basmati), maize, and cotton — the main commodities traded in Punjab mandis. Rates, MSP, and commission are all configurable.' },
    { q: 'What APMC compliance features does MandiGrow offer for Punjab?', a: 'MandiGrow supports configurable commission rates, market fee, rural development cess, and other regulated charges as per Punjab APMC rules. All invoices are APMC-compliant and GST-ready.' },
    { q: 'Can I use MandiGrow on mobile at the mandi gate in Punjab?', a: 'Yes. MandiGrow has a native Android app that works at the mandi gate — even in slow internet conditions. Gate entry, lot creation, and weighment can be recorded on the spot.' },
];

export default function MandiSoftwarePunjabPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'MandiGrow — Punjab Mandi Software', applicationCategory: 'BusinessApplication', operatingSystem: 'Android, Web', url: 'https://www.mandigrow.com/mandi-software-punjab', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '48' } }) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌾 Punjab Mandi Software</div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Punjab<br /><span className="text-emerald-700">Arhatias & Grain Traders</span></h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">MandiGrow is trusted by commission agents and grain traders across Punjab APMCs. Auto commission, GST billing, farmer patti, and digital khata — fully APMC compliant. Available in Hindi and Punjabi support.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow — Punjab's Trusted Mandi ERP</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">Punjab is one of India's most important agricultural states, with major APMC mandis handling wheat, paddy, maize, cotton, fruits and vegetables across districts. MandiGrow is the only cloud ERP designed specifically for Punjab mandi operations — combining commission automation, GST billing, farmer payment management, and digital khata in one seamless platform.</p>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">Our Punjab mandi customers in Amritsar, Ludhiana, Jalandhar, and Bathinda have replaced paper-based registers and Tally with MandiGrow — cutting their daily settlement time by over 60% and eliminating calculation errors from commission and market fee deductions.</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 mt-8">Punjab Cities We Serve</h3>
                    <div className="flex flex-wrap gap-3">{CITIES.map(c => <span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}</div>
                </div>
            </section>

            <section className="py-16 px-6 bg-[#f7fbf3]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs — Punjab Mandi Software</h2>
                    <div className="space-y-5">{FAQS.map(f => (<div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>))}</div>
                </div>
            </section>

            <section className="py-12 px-6 bg-white border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl font-black text-gray-900 mb-4">Other State & Category Pages</h2>
                    <div className="flex flex-wrap gap-3">
                        {[{href:'/anaj-mandi-software',label:'Anaj Mandi Software'},{href:'/commission-agent-software',label:'Commission Agent Software'},{href:'/mandi-khata-software',label:'Mandi Khata'},{href:'/mandi-software-andhra-pradesh',label:'Andhra Pradesh'},{href:'/mandi-software-maharashtra',label:'Maharashtra'},{href:'/mandi-software-telangana',label:'Telangana'},{href:'/gst-mandi-compliance',label:'GST Compliance'}].map(l => (
                            <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Start Your Punjab Mandi on MandiGrow</h2>
                    <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free training. No IT team needed. We onboard your mandi in under 2 hours.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free <ArrowRight className="w-5 h-5" /></Link>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}
