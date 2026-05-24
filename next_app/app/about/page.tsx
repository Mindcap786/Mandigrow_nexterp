import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { ShieldCheck, Users, Target, Building2, MapPin, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About MandiGrow | The Operating System for Indian APMC Mandis',
    description: 'Learn about the team behind MandiGrow. Built by experts who understand the chaotic, rapid-fire reality of India\'s agricultural wholesale markets and commission agents.',
    keywords: [
        'about MandiGrow',
        'mandi software company',
        'APMC software developers',
        'Indian agriculture ERP team',
        'arhtiya software company'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/about' },
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            <LandingHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#dce7c8] to-[#f7fbf3]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 mb-8">
                        Our Mission
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-tight">
                        Built for the reality of <br className="hidden md:block"/>
                        <span className="text-emerald-700">Indian Mandis.</span>
                    </h1>
                    <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                        We did not build generic accounting software in an air-conditioned office. We built MandiGrow by standing at the mandi gates at 4:00 AM, watching how real commission agents operate.
                    </p>
                </div>
            </section>

            {/* The Story */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-emerald-100">
                    <h2 className="text-3xl font-black mb-6 text-gray-900">Why We Started MandiGrow</h2>
                    <div className="prose prose-lg text-gray-600 prose-emerald max-w-none">
                        <p className="font-medium leading-relaxed">
                            For decades, India's agricultural backbone—the APMC mandis—have run on red cloth-bound <em>bahi-khatas</em> and mental math. While corporate India moved to the cloud, mandi traders were left behind, forced to use generic retail billing software (like Tally or Vyapar) that completely failed to understand how a mandi works.
                        </p>
                        <p className="font-medium leading-relaxed mt-4">
                            <strong>A regular shop sells a fixed item at a fixed price. A mandi trader deals with dynamic lots, varying crate weights, live auction pricing, wastage, farmer advances, and complex APMC cess rules.</strong>
                        </p>
                        <p className="font-medium leading-relaxed mt-4">
                            We realized that Arhtiyas and commission agents needed an ecosystem specifically tailored to their vocabulary. They needed auto-calculating commission, instant WhatsApp farmer pattis, and digital khatas that updated in real-time. That is why MandiGrow was born.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values / EEAT */}
            <section className="py-16 px-6 bg-[#0d1f14] text-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12 text-center text-emerald-50">Our Engineering Philosophy</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-emerald-900/40 rounded-2xl border border-emerald-800/50">
                            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
                            <h3 className="text-xl font-black mb-2">Zero Data Loss</h3>
                            <p className="text-emerald-200/80 font-medium leading-relaxed">
                                A single lost ledger page can cost lakhs. We engineered MandiGrow on secure, enterprise-grade cloud architecture to ensure your financial data is backed up instantly and permanently.
                            </p>
                        </div>
                        <div className="p-6 bg-emerald-900/40 rounded-2xl border border-emerald-800/50">
                            <Users className="w-10 h-10 text-emerald-400 mb-4" />
                            <h3 className="text-xl font-black mb-2">Built for the Munim</h3>
                            <p className="text-emerald-200/80 font-medium leading-relaxed">
                                Software is useless if your staff cannot operate it. We designed an interface so intuitive—and available in 7 regional languages—that your clerks can master it in 15 minutes.
                            </p>
                        </div>
                        <div className="p-6 bg-emerald-900/40 rounded-2xl border border-emerald-800/50">
                            <Target className="w-10 h-10 text-emerald-400 mb-4" />
                            <h3 className="text-xl font-black mb-2">Speed Above All</h3>
                            <p className="text-emerald-200/80 font-medium leading-relaxed">
                                Mandi auctions are chaotic and fast. MandiGrow is heavily optimized to generate hundreds of GST-compliant invoices and gate entries per hour without slowing down.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Transparency (EEAT) */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-8">Real Humans, Real Support</h2>
                    <p className="text-lg text-gray-600 mb-12 font-medium max-w-2xl mx-auto">
                        We do not hide behind automated chatbots. When you trust us with your mandi operations, you get direct access to our team. We visit your mandi. We train your staff. We ensure your success.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col gap-3">
                            <Building2 className="w-6 h-6 text-emerald-600" />
                            <h3 className="font-black text-gray-900">Headquarters</h3>
                            <p className="text-gray-700 text-sm">
                                MINDT Private Limited<br />
                                Rayachoti, Annamayya District
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col gap-3">
                            <Phone className="w-6 h-6 text-emerald-600" />
                            <h3 className="font-black text-gray-900">Sales & Support</h3>
                            <p className="text-gray-600 text-sm font-medium">
                                Mon-Sat, 9:00 AM - 7:00 PM<br/>
                                Call us directly from the app.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col gap-3">
                            <Mail className="w-6 h-6 text-emerald-600" />
                            <h3 className="font-black text-gray-900">Email</h3>
                            <p className="text-gray-600 text-sm font-medium">
                                support@mandigrow.com<br/>
                                partners@mandigrow.com
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
