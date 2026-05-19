import type { Metadata } from 'next'; import Link from 'next/link'; import { LandingFooter } from '@/components/layout/LandingFooter'; import { LandingHeader } from '@/components/layout/LandingHeader'; import { ArrowRight } from 'lucide-react';
export const metadata: Metadata = { title: 'Mandi Software Rajasthan | APMC & Grain Trader ERP — MandiGrow', description: 'MandiGrow is the best mandi software for Rajasthan. Used by commission agents in Jaipur, Jodhpur, Kota, Bikaner, Ajmer, and all Rajasthan APMC mandis. GST billing, khata, farmer patti in Hindi. Free trial.', keywords: ['mandi software Rajasthan','APMC software Rajasthan','grain mandi software Rajasthan','commission agent software Rajasthan','Jaipur mandi software','Jodhpur mandi software','Kota mandi software','arhtiya software Rajasthan'], alternates: { canonical: 'https://www.mandigrow.com/mandi-software-rajasthan' }, openGraph: { title: 'Mandi Software Rajasthan | APMC ERP — MandiGrow', description: 'MandiGrow for Rajasthan APMC mandi operators — Hindi GST billing, commission, farmer khata.', url: 'https://www.mandigrow.com/mandi-software-rajasthan', type: 'website' } };
const FAQS = [
  { q: 'Is MandiGrow available in Hindi for Rajasthan mandi operators?', a: 'Yes. MandiGrow is fully available in Hindi and English. All bills, pattis, and reports are in Hindi — perfect for Rajasthan arhatias and grain traders.' },
  { q: 'Does MandiGrow support APMC Rajasthan compliance?', a: 'Yes. MandiGrow supports configurable APMC Rajasthan commission rates, market fee, rural development cess, and other regulated deductions.' },
  { q: 'Can MandiGrow handle mustard, moong, and bajra billing for Rajasthan?', a: 'Yes. MandiGrow handles all Rajasthan commodities — mustard, moong, moth, bajra, jowar, wheat, and vegetables like onion, garlic, and coriander.' },
  { q: 'Does MandiGrow work in Jaipur, Jodhpur and Kota mandis?', a: 'Yes. MandiGrow is actively used by commission agents in Jaipur (Muhalana Mandi), Jodhpur, Kota, Bikaner, and Ajmer.' },
];
export default function MandiSoftwareRajasthanPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf3] text-gray-900"><LandingHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage', mainEntity: FAQS.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) }) }} />
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">🌾 Rajasthan Mandi Software</div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">Best Mandi Software for Rajasthan<br /><span className="text-emerald-700">APMC, Grain & Vegetable Traders</span></h1>
        <p className="text-xl text-gray-700 font-medium max-w-3xl mx-auto mb-10">MandiGrow serves Rajasthan arhatias and commission agents in Jaipur, Jodhpur, Kota, Bikaner, and Ajmer. Hindi billing, APMC compliance, farmer patti, GST — all in one platform. Free setup.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
          <Link href="/contact" className="px-10 py-4 rounded-full border-2 border-emerald-400 text-emerald-800 font-bold text-lg hover:bg-white/60 transition-all flex items-center justify-center">Contact Us →</Link>
        </div>
      </div>
    </section>
    <section className="py-16 px-6 bg-white"><div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-6">MandiGrow for Rajasthan APMC Operators</h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-6">Rajasthan is one of India's largest agricultural states with major APMC mandis handling mustard, moong, moth, bajra, wheat, coriander, and vegetables. MandiGrow brings digital operations to Rajasthan arhatias — with Hindi-language billing, configurable APMC rates, and farmer settlement management that replaces paper registers overnight.</p>
      <div className="flex flex-wrap gap-3">{['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Sikar','Alwar','Bharatpur','Nagaur'].map(c=><span key={c} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-800">{c}</span>)}</div>
    </div></section>
    <section className="py-16 px-6 bg-[#f7fbf3]"><div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">FAQs</h2>
      <div className="space-y-5">{FAQS.map(f=><div key={f.q} className="border border-emerald-100 rounded-2xl p-6 bg-white"><h3 className="font-black text-lg text-gray-900 mb-2">{f.q}</h3><p className="text-gray-700 font-medium leading-relaxed">{f.a}</p></div>)}</div>
    </div></section>
    <section className="py-12 px-6 bg-white border-t border-emerald-100"><div className="max-w-5xl mx-auto flex flex-wrap gap-3">
      {[{href:'/anaj-mandi-software',label:'Anaj Mandi'},{href:'/commission-agent-software',label:'Commission Agent'},{href:'/mandi-khata-software',label:'Mandi Khata'},{href:'/mandi-software-punjab',label:'Punjab'},{href:'/mandi-software-andhra-pradesh',label:'Andhra Pradesh'},{href:'/mandi-software-maharashtra',label:'Maharashtra'},{href:'/gst-mandi-compliance',label:'GST Compliance'}].map(l=>(
        <Link key={l.href} href={l.href} className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">{l.label} →</Link>
      ))}
    </div></section>
    <section className="py-20 px-6 bg-emerald-900 text-center"><div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-black text-white mb-4">Apna Mandi Digitize Karein Aaj</h2>
      <p className="text-emerald-200 text-lg font-medium mb-8">Free setup. Free Hindi training. Zero setup cost. Our team gets you running in under 2 hours.</p>
      <Link href="/login?mode=signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 py-4 rounded-full text-lg transition-all hover:scale-105">Start Free Trial <ArrowRight className="w-5 h-5" /></Link>
    </div></section>
    <LandingFooter /></main>
  );
}
