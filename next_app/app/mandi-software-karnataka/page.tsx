import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mandi Software Karnataka | APMC & Fruit Trader ERP — MandiGrow',
    description: 'MandiGrow is the best mandi software for Karnataka. Trusted by commission agents and traders in Bangalore, Mysore, Hubli, Belgaum and all APMC Karnataka mandis. GST billing, khata, farmer payments. Free trial.',
    keywords: ['mandi software Karnataka', 'APMC software Karnataka', 'fruit mandi software Karnataka', 'commission agent software Karnataka', 'mandi ERP Bangalore', 'Hubli mandi software', 'Mysore mandi software', 'Belgaum mandi software'],
    alternates: { canonical: 'https://www.mandigrow.com/mandi-software-karnataka' },
    openGraph: { title: 'Mandi Software Karnataka | APMC ERP — MandiGrow', description: 'MandiGrow mandi ERP for Karnataka. Auto commission, GST billing, APMC compliance, and farmer khata.', url: 'https://www.mandigrow.com/mandi-software-karnataka', type: 'website' },
};

const FAQS = [
    { q: 'Is MandiGrow available in Kannada for Karnataka mandi operators?', a: 'Yes. MandiGrow is fully available in Kannada and English. Bills, pattis, and reports can be printed in Kannada, making it ideal for Karnataka APMC operators who work in the local language.' },
    { q: 'Does MandiGrow support APMC Karnataka compliance?', a: 'Yes. MandiGrow is configurable for Karnataka APMC commission rates, market fee, cess, and regulated deductions. It helps you stay fully compliant with Karnataka Agricultural Produce Marketing Act.' },
    { q: 'Can MandiGrow handle tomato, onion, and potato billing for Karnataka?', a: 'Yes. MandiGrow handles all vegetable varieties including tomato, onion, potato, chilli, grapes, pomegranate, and other commodities traded in major Karnataka APMCs like Kolar, Hubli, and Belgaum.' },
    { q: 'Does MandiGrow work for fruit traders in Bangalore?', a: 'Yes. MandiGrow is used by fruit commission agents and wholesale traders in Bangalore\'s KR Market and other APMC yards. The software handles lot-wise fruit billing, buyer credit, and farmer settlement.' },
];

export default function MandiSoftwareKarnatakaPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'MandiGrow — Karnataka Mandi Software', applicationCategory: 'BusinessApplication', operatingSystem: 'Android, Web', url: 'https://www.mandigrow.com/mandi-software-karnataka', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '48' } }) }} />

            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌿 Karnataka Mandi Software</div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Karnataka<br /><span className="text-emerald-700">APMC, Fruit & Vegetable Traders</span></h1>
                    <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">Trusted by commission agents across Bangalore, Hubli, Mysore, Belgaum, and Kolar. MandiGrow handles APMC billing, GST, farmer payments, and digital khata — in Kannada and English.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                        <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow for Karnataka APMC Operators</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">Karnataka has one of India's largest APMC networks with major yards in Bangalore (KR Market), Hubli, Mysore, Belgaum, Kolar (tomato), Bagalkot (grapes), and Bidar. MandiGrow is built to handle the full complexity of Karnataka mandi operations — including multiple commodity lots, buyer credit management, APMC market fee compliance, and Kannada-language billing.</p>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">Our Karnataka customers have reduced their daily settlement time by more than 60% by switching from paper registers and Excel to MandiGrow. With free training and zero setup cost, getting started is completely risk-free.</p>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {['Bangalore', 'Hubli', 'Mysore', 'Belgaum', 'Kolar', 'Mangalore', 'Bidar', 'Bagalkot', 'Davangere', 'Shimoga'].map(c => <span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-[#f7fbf3]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs — Karnataka Mandi Software</h2>
                    <div className="space-y-5">{FAQS.map(f => (<div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>))}</div>
                </div>
            </section>

            <section className="py-12 px-6 bg-white border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap gap-3">
                        {[{href:'/anaj-mandi-software',label:'Anaj Mandi Software'},{href:'/fruit-vegetable-billing',label:'Fruit & Veg Billing'},{href:'/commission-agent-software',label:'Commission Agent'},{href:'/mandi-khata-software',label:'Mandi Khata'},{href:'/mandi-software-andhra-pradesh',label:'Andhra Pradesh'},{href:'/mandi-software-telangana',label:'Telangana'},{href:'/mandi-software-maharashtra',label:'Maharashtra'},{href:'/mandi-software-punjab',label:'Punjab'}].map(l => (
                            <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-emerald-900 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">Start Free in Karnataka Today</h2>
                    <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free training in Kannada & Hindi. No setup cost. Ready in under 2 hours.</p>
                    <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
                </div>
            </section>
            <LandingFooter />
        </main>
    );
}
