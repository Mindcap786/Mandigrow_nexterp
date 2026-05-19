import type { Metadata } from 'next'; import Link from 'next/link'; import { LandingFooter } from '@/components/layout/LandingFooter'; import { LandingHeader } from '@/components/layout/LandingHeader'; import { ArrowRight } from 'lucide-react';
export const metadata: Metadata = { title: 'Mandi Software Bihar | APMC & Grain Trader ERP — MandiGrow', description: 'MandiGrow is the best mandi software for Bihar. Used by commission agents in Patna, Muzaffarpur, Gaya, Bhagalpur and all Bihar APMC mandis. Hindi billing, farmer patti, GST khata. Free trial.', keywords: ['mandi software Bihar','APMC software Bihar','grain mandi software Bihar','commission agent software Bihar','Patna mandi software','Muzaffarpur mandi software','arhtiya software Bihar','sabji mandi software Bihar'], alternates: { canonical: 'https://www.mandigrow.com/mandi-software-bihar' }, openGraph: { title: 'Mandi Software Bihar | APMC ERP — MandiGrow', description: 'MandiGrow for Bihar mandi — Hindi billing, APMC compliance, farmer patti.', url: 'https://www.mandigrow.com/mandi-software-bihar', type: 'website' } };
const FAQS = [
  { q: 'Is MandiGrow available for Bihar mandi operators?', a: 'Yes. MandiGrow is fully available in Hindi for Bihar arhatias. It serves commission agents in Patna, Muzaffarpur, Gaya, Darbhanga, and all Bihar APMC mandis.' },
  { q: 'Does MandiGrow support Bihar APMC rules?', a: 'Yes. MandiGrow supports configurable Bihar APMC market fee, commission rates, and other regulated charges as per Bihar Agricultural Produce Markets Act.' },
  { q: 'Can MandiGrow handle litchi, maize, and vegetable billing in Bihar?', a: 'Yes. Bihar is known for litchi (Muzaffarpur), maize, wheat, paddy, vegetables, and pulses. MandiGrow handles all these commodities with lot tracking, weight billing, and farmer settlement.' },
  { q: 'Does MandiGrow work for Patna and Muzaffarpur mandis?', a: 'Yes. MandiGrow is actively used in Patna (Gandhi Maidan Mandi), Muzaffarpur, Gaya, Darbhanga, and Bhagalpur.' },
];
export default function MandiSoftwareBiharPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf3] text-gray-900"><LandingHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage', mainEntity: FAQS.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) }) }} />
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌾 Bihar Mandi Software</div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Bihar<br /><span className="text-emerald-700">APMC & Commission Agent ERP</span></h1>
        <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">MandiGrow serves Bihar arhatias and mandi operators in Patna, Muzaffarpur, Gaya, and all districts. Hindi-first billing, farmer patti, GST compliance, and digital khata — zero setup cost.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
          <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
        </div>
      </div>
    </section>
    <section className="py-16 px-6 bg-white"><div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow for Bihar Mandi Operators</h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-6">Bihar is a rapidly growing agricultural state with APMC mandis handling wheat, rice, maize, litchi, vegetables, and pulses. MandiGrow brings full digital mandi operations to Bihar arhatias — with Hindi billing, configurable APMC rates, lot-wise stock tracking, and farmer settlement management.</p>
      <div className="flex flex-wrap gap-3">{['Patna','Muzaffarpur','Gaya','Darbhanga','Bhagalpur','Purnia','Motihari','Samastipur','Sitamarhi','Madhubani'].map(c=><span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}</div>
    </div></section>
    <section className="py-16 px-6 bg-[#f7fbf3]"><div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs</h2>
      <div className="space-y-5">{FAQS.map(f=><div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>)}</div>
    </div></section>
    <section className="py-12 px-6 bg-white border-t border-emerald-100"><div className="max-w-5xl mx-auto flex flex-wrap gap-3">
      {[{href:'/anaj-mandi-software',label:'Anaj Mandi'},{href:'/commission-agent-software',label:'Commission Agent'},{href:'/mandi-khata-software',label:'Mandi Khata'},{href:'/mandi-software-uttar-pradesh',label:'Uttar Pradesh'},{href:'/mandi-software-rajasthan',label:'Rajasthan'},{href:'/mandi-software-punjab',label:'Punjab'},{href:'/mandi-software-andhra-pradesh',label:'Andhra Pradesh'}].map(l=>(
        <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
      ))}
    </div></section>
    <section className="py-20 px-6 bg-emerald-900 text-center"><div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-black text-white mb-4">Bihar Ki Mandi Ko Digital Banayein</h2>
      <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free Hindi training. Zero cost. Ready in under 2 hours.</p>
      <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
    </div></section>
    <LandingFooter /></main>
  );
}
