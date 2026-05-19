import type { Metadata } from 'next'; import Link from 'next/link'; import { LandingFooter } from '@/components/layout/LandingFooter'; import { LandingHeader } from '@/components/layout/LandingHeader'; import { ArrowRight } from 'lucide-react';
export const metadata: Metadata = { title: 'Mandi Software Uttar Pradesh | APMC & Grain Trader ERP — MandiGrow', description: 'MandiGrow is the best mandi software for Uttar Pradesh. Trusted by commission agents in Lucknow, Kanpur, Agra, Varanasi, Meerut, and all UP APMC mandis. Hindi GST billing, khata, farmer patti. Free trial.', keywords: ['mandi software Uttar Pradesh','mandi software UP','APMC software UP','grain mandi software UP','arhtiya software UP','Lucknow mandi software','Kanpur mandi software','Agra mandi software','sabzi mandi software UP','commission agent software UP'], alternates: { canonical: 'https://www.mandigrow.com/mandi-software-uttar-pradesh' }, openGraph: { title: 'Mandi Software Uttar Pradesh | APMC ERP — MandiGrow', description: 'MandiGrow for UP mandi operators — Hindi billing, APMC compliance, farmer khata, GST.', url: 'https://www.mandigrow.com/mandi-software-uttar-pradesh', type: 'website' } };
const FAQS = [
  { q: 'Is MandiGrow available in Hindi for UP mandi operators?', a: 'Yes. MandiGrow is fully available in Hindi. All bills, pattis, daybook reports, and khata entries are in Hindi — making it the ideal mandi software for Uttar Pradesh arhatias.' },
  { q: 'Does MandiGrow support UP APMC mandi compliance?', a: 'Yes. MandiGrow supports all UP APMC charges — arhat, market fee, vikas shulk, and other regulated deductions as per UP Krishi Utpadan Mandi Parishad rules.' },
  { q: 'Can MandiGrow handle potato, onion, and grain billing in UP?', a: 'Yes. MandiGrow handles all major UP commodities — potato (Agra, Kanpur), onion, garlic, wheat, rice, sugarcane-related products, and all vegetable varieties.' },
  { q: 'Is MandiGrow used in Lucknow, Agra, and Kanpur mandis?', a: 'Yes. MandiGrow is actively used by commission agents in Lucknow (Gaughat Mandi), Agra, Kanpur, Varanasi, Meerut, Bareilly, and Mathura.' },
];
export default function MandiSoftwareUPPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf3] text-gray-900"><LandingHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage', mainEntity: FAQS.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) }) }} />
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌾 UP Mandi Software</div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Uttar Pradesh<br /><span className="text-emerald-700">Hindi APMC Billing for UP Arhatias</span></h1>
        <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">MandiGrow is the most trusted mandi software for UP commission agents — Hindi billing, auto arhat calculation, farmer patti, GST compliance, and digital khata. Serving Lucknow, Agra, Kanpur, Varanasi, and all UP APMC yards.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
          <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
        </div>
      </div>
    </section>
    <section className="py-16 px-6 bg-white"><div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow for Uttar Pradesh Mandi Operators</h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-6">Uttar Pradesh has India's largest mandi network with over 250 principal APMC yards and thousands of sub-yards. MandiGrow brings full digital operations to UP arhatias — with Hindi-language billing, configurable UP APMC rates, lot tracking, and farmer payment management that replaces paper registers instantly.</p>
      <p className="text-gray-700 text-lg leading-relaxed mb-8">Whether you are in Lucknow's Gaughat Mandi, Agra's potato market, Kanpur's grain market, or Varanasi's spice trade — MandiGrow works for every commodity and every operation size.</p>
      <div className="flex flex-wrap gap-3">{['Lucknow','Agra','Kanpur','Varanasi','Meerut','Bareilly','Mathura','Aligarh','Moradabad','Saharanpur'].map(c=><span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}</div>
    </div></section>
    <section className="py-16 px-6 bg-[#f7fbf3]"><div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs — UP Mandi Software</h2>
      <div className="space-y-5">{FAQS.map(f=><div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>)}</div>
    </div></section>
    <section className="py-12 px-6 bg-white border-t border-emerald-100"><div className="max-w-5xl mx-auto flex flex-wrap gap-3">
      {[{href:'/anaj-mandi-software',label:'Anaj Mandi'},{href:'/sabji-billing-software',label:'Sabji Billing'},{href:'/commission-agent-software',label:'Commission Agent'},{href:'/mandi-khata-software',label:'Mandi Khata'},{href:'/mandi-software-punjab',label:'Punjab'},{href:'/mandi-software-rajasthan',label:'Rajasthan'},{href:'/mandi-software-maharashtra',label:'Maharashtra'}].map(l=>(
        <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
      ))}
    </div></section>
    <section className="py-20 px-6 bg-emerald-900 text-center"><div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-black text-white mb-4">UP Ki Mandi Ko Digital Banayein</h2>
      <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free Hindi training. Zero setup cost. Our team sets everything up in under 2 hours.</p>
      <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
    </div></section>
    <LandingFooter /></main>
  );
}
