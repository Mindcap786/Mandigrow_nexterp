import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight } from 'lucide-react';
export const metadata: Metadata = {
    title: 'Mandi Software Tamil Nadu | APMC & Fruit Trader ERP — MandiGrow',
    description: 'MandiGrow is the best mandi software for Tamil Nadu traders and commission agents in Chennai, Coimbatore, Madurai, Salem, and Tiruchirappalli. GST billing, farmer patti, khata in Tamil. Free trial.',
    keywords: ['mandi software Tamil Nadu','APMC software Tamil Nadu','fruit mandi software Chennai','commission agent software Tamil Nadu','regulated market software Tamil Nadu','vegetable trader software Tamil Nadu','Coimbatore mandi software','Salem mandi software'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-tamil-nadu' },
    openGraph: { title: 'Mandi Software Tamil Nadu | APMC ERP — MandiGrow', description: 'MandiGrow for Tamil Nadu mandi operators — GST billing, APMC compliance, Tamil language support, farmer payments.', url: 'https://www.mandigrow.com/mandi-software-tamil-nadu', type: 'website' },
};
const FAQS = [
    { q: 'Is MandiGrow available in Tamil for Tamil Nadu mandi operators?', a: 'Yes. MandiGrow is fully available in Tamil. Bills, pattis, and reports can be printed in Tamil, making it the preferred mandi software for Tamil Nadu regulated market traders.' },
    { q: 'Does MandiGrow support Tamil Nadu regulated market compliance?', a: 'Yes. MandiGrow supports Tamil Nadu Agricultural Marketing Act compliance with configurable commission rates, market fee, cess, and other regulated deductions as per state rules.' },
    { q: 'Can MandiGrow handle banana, mango and tomato billing in Tamil Nadu?', a: 'Yes. MandiGrow handles all major Tamil Nadu commodities — banana, mango, tomato, onion, brinjal, drumstick, and more. Each variety is tracked separately by lot and weight.' },
    { q: 'Does MandiGrow work for Chennai wholesale market operators?', a: 'Yes. MandiGrow is used by commission agents and wholesale traders in Koyambedu (Chennai), Coimbatore, Madurai, and other regulated markets across Tamil Nadu.' },
];
export default function MandiSoftwareTamilNaduPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }} />
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌿 Tamil Nadu Mandi Software</div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Tamil Nadu<br /><span className="text-emerald-700">Regulated Market & APMC Traders</span></h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">MandiGrow serves commission agents and wholesale traders across Tamil Nadu regulated markets. GST billing, farmer payments, digital khata — available in Tamil and English. Free setup and training.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
                    </div>
                </div>
            </section>
            <section className="py-16 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow for Tamil Nadu Regulated Markets</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">Tamil Nadu has a vast network of regulated markets (uzhavar sandhai) and APMC yards handling fruits, vegetables, flowers, and grains. MandiGrow is designed for Tamil Nadu market operators — with Tamil-language billing, configurable regulated market charges, GST compliance, and digital khata management.</p>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">Cities we serve: Chennai (Koyambedu), Coimbatore, Madurai, Salem, Tiruchirappalli, Tirunelveli, Vellore, Erode, Namakkal, Dharmapuri — and all Tamil Nadu regulated market districts.</p>
                    <div className="flex flex-wrap gap-3">{['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Erode','Namakkal','Vellore','Tirunelveli','Dharmapuri'].map(c => <span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}</div>
                </div>
            </section>
            <section className="py-16 px-6 bg-[#f7fbf3]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs</h2>
                    <div className="space-y-5">{FAQS.map(f => (<div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>))}</div>
                </div>
            </section>
            <section className="py-12 px-6 bg-white border-t border-emerald-100">
                <div className="max-w-5xl mx-auto flex flex-wrap gap-3">
                    {[{href:'/anaj-mandi-software',label:'Anaj Mandi'},{href:'/fruit-vegetable-billing',label:'Fruit & Veg Billing'},{href:'/commission-agent-software',label:'Commission Agent'},{href:'/mandi-software-karnataka',label:'Karnataka'},{href:'/mandi-software-andhra-pradesh',label:'Andhra Pradesh'},{href:'/mandi-software-telangana',label:'Telangana'},{href:'/mandi-software-maharashtra',label:'Maharashtra'},{href:'/mandi-software-punjab',label:'Punjab'}].map(l=>(
                        <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
                    ))}
                </div>
            </section>
            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Start Free in Tamil Nadu Today</h2>
                    <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free training in Tamil & Hindi. No setup cost. Ready in under 2 hours.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}
