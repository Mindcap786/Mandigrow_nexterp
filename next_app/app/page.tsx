'use client'

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, Globe, BarChart3, Package, Users, LayoutGrid, Calculator, Workflow, CheckCircle2, Lock, FileText, ClipboardCheck, Sparkles, Menu, X, Phone, GraduationCap, Headphones, Star } from 'lucide-react'
import { HeroTitle } from '@/components/i18n/hero-title'
import { useLanguage } from '@/components/i18n/language-provider'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { callApi } from '@/lib/frappeClient'
import { useEffect } from 'react'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { HeroSlider } from '@/components/landing/HeroSlider'
export default function LandingPage() {
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [playstoreLink, setPlaystoreLink] = useState('');

    useEffect(() => {
        (async () => {
            const { data } = await supabase.schema('core').from('site_contact_settings').select('playstore_app_link').maybeSingle();
            if (data?.playstore_app_link) {
                setPlaystoreLink(data.playstore_app_link);
            }
        })();
    }, []);
    return (
        <div className="min-h-screen bg-[#dce7c8] text-gray-900 selection:bg-emerald-600 selection:text-white font-sans overflow-x-hidden">

            <LandingHeader />


            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'What is the best mandi ERP software in India?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'MandiGrow is widely considered the best mandi ERP software in India because it is built specifically for fruits and vegetable merchants, commission agents and wholesale traders. Unlike generic tools, it handles lots, crates, weight, commission, market fees and khata natively in both Hindi and English.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is MandiGrow better than Tally for fruits and vegetable traders?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes. Tally is a general accounting tool, while MandiGrow is a complete fruits and vegetable ERP. You get everything Tally offers — ledgers, GST, daybook — plus mandi-specific features like commission auto-calculation, lot tracking, wastage and farmer settlements.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Can MandiGrow handle commission agent accounts?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes. MandiGrow is a full commission agent software for mandi businesses. It auto-calculates commission, market fees and hamali for every sale, posts entries to khatas instantly, and generates party-wise settlement reports in one click.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Does MandiGrow support GST billing for vegetable wholesalers?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes. MandiGrow generates GST-compliant invoices, supports B2B and B2C billing, and is ready for e-invoicing. You can file GSTR-1 and GSTR-3B faster because all your sales and purchase data is already organized.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is MandiGrow available in Hindi and regional languages?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes. MandiGrow ships fully bilingual and supports Hindi, English, Tamil, Telugu, Kannada, Malayalam and Urdu. Bills, prints and reports are available in every supported language.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is there a free trial of MandiGrow?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes. MandiGrow offers a 14-day free trial with no credit card required. You can also book a free live demo in Hindi or English to see how it fits your mandi business.',
                                },
                            },
                        ],
                    }),
                }}
            />

            {/* Hero Section */}
            <main className="relative pt-40 pb-10 px-6 max-w-7xl mx-auto">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
                
                <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center relative z-10">
                    {/* Left Column */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/50 text-[10px] sm:text-xs font-bold text-emerald-800 mb-8 backdrop-blur-sm shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Enterprise-Grade Mandi Software
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black mb-6 leading-[1.05] tracking-tighter max-w-3xl">
                            <span className="text-gray-900 block">India's Best Mandi</span>
                            <span className="text-gray-900 block">ERP Software</span>
                            <span className="text-emerald-700 block mt-1">for Commission</span>
                            <span className="text-emerald-700 block">Agents.</span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-2xl mb-10 font-medium leading-relaxed">
                            Auto commission, GST billing, mandi khata, and APMC compliance — works on Android at the mandi gate and desktop in your office. Available in Hindi, Telugu, Tamil, Kannada, Malayalam & Urdu.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto mb-8">
                            <Link href="/subscribe" className="w-full sm:w-auto bg-emerald-800 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-emerald-900 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 shadow-[0_10px_40px_-10px_rgba(4,120,87,0.5)]">
                                Start Free Trial <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-emerald-900 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 bg-white">
                                <FileText className="w-5 h-5" />
                                Book a Free Demo
                            </Link>
                        </div>
                        
                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-[11px] sm:text-sm font-bold text-gray-600 mb-10">
                            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Trusted by 200+ mandis</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free training & support</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ₹0 Setup Cost</span>
                        </div>

                        {/* Mandi Logos */}
                        <div className="w-full text-center lg:text-left">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Trusted by mandi businesses across India</p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                                <span className="flex items-center gap-2 font-black text-gray-800"><Package className="w-5 h-5" /> Azadpur Mandi</span>
                                <span className="flex items-center gap-2 font-black text-gray-800"><Package className="w-5 h-5" /> Nashik Mandi</span>
                                <span className="flex items-center gap-2 font-black text-gray-800"><Package className="w-5 h-5" /> Kolar Mandi</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Slider */}
                    <div className="w-full aspect-square lg:aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(4,120,87,0.15)] relative">
                        <HeroSlider />
                    </div>
                </div>
            </main>

            {/* Feature Strip */}
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 mb-24 z-20">
                <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] rounded-[32px] p-8 md:p-10 relative overflow-hidden">
                    <h3 className="text-center text-xl sm:text-2xl font-black text-gray-900 mb-10">Everything your mandi business needs</h3>
                    
                    <div className="flex flex-wrap justify-center items-center gap-y-10 gap-x-6 lg:gap-x-12">
                        {/* Auto Commission */}
                        <div className="flex items-center gap-4 max-w-[200px]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                <Calculator className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Auto Commission</h4>
                                <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Accurate & transparent</p>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                        {/* Mandi Khata */}
                        <div className="flex items-center gap-4 max-w-[200px]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Mandi Khata</h4>
                                <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Real-time ledger</p>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 hidden lg:block"></div>

                        {/* GST Billing */}
                        <div className="flex items-center gap-4 max-w-[200px]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">GST Billing</h4>
                                <p className="text-xs text-gray-600 font-medium leading-tight mt-1">HSN-ready invoices</p>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 hidden md:block"></div>

                        {/* APMC Compliance */}
                        <div className="flex items-center gap-4 max-w-[200px]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">APMC Compliance</h4>
                                <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Stay audit-ready</p>
                            </div>
                        </div>

                        <div className="w-px h-12 bg-gray-200 hidden lg:block"></div>

                        {/* Reports */}
                        <div className="flex items-center gap-4 max-w-[200px]">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                <BarChart3 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Reports & Insights</h4>
                                <p className="text-xs text-gray-600 font-medium leading-tight mt-1">Powerful analytics</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Fruits */}
                <div className="absolute -left-12 -bottom-20 w-56 h-56 z-30 pointer-events-none hidden xl:block">
                    <img src="/assets/fruits/pomegranate.png" alt="Fruits" className="w-full h-full object-contain filter drop-shadow-xl" />
                </div>
                <div className="absolute -right-8 -bottom-16 w-48 h-48 z-30 pointer-events-none hidden xl:block">
                    <img src="/assets/fruits/mango.png" alt="Fruits" className="w-full h-full object-contain filter drop-shadow-xl" />
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-[#e8f1d4] relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-gray-900">{t('landing.enterprise_title')}</h2>
                        <p className="text-gray-700 text-lg font-medium">{t('landing.enterprise_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-400 transition-colors group shadow-sm">
                            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                                <Package className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('landing.feature_logistics_title')}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">{t('landing.feature_logistics_desc')}</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-400 transition-colors group shadow-sm">
                            <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('landing.feature_fintech_title')}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">{t('landing.feature_fintech_desc')}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-400 transition-colors group shadow-sm">
                            <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('landing.feature_compliance_title')}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">{t('landing.feature_compliance_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ZERO RISK ONBOARDING BANNER ─────────────────────────────────── */}
            <section className="relative overflow-hidden bg-emerald-900 py-20 px-6">
                {/* Background texture */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #86efac 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6ee7b7 0%, transparent 40%)' }} />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 bg-emerald-800/60 text-emerald-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-700">
                            <Zap className="w-3.5 h-3.5" /> Zero Risk to Get Started
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                            We Set You Up. <span className="text-emerald-400">You Just Run Your Mandi.</span>
                        </h2>
                        <p className="text-emerald-200 text-lg font-medium max-w-2xl mx-auto">
                            No IT team needed. No setup fees. No long training sessions. 
                            Our team comes to you — onboarding is on us.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                        {/* Card 1 */}
                        <div className="bg-white/5 border border-emerald-700/50 rounded-3xl p-8 flex flex-col items-start gap-4 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                                <GraduationCap className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <div className="inline-block bg-emerald-500 text-emerald-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">100% Free</div>
                                <h3 className="text-2xl font-black text-white mb-2">Free Training Included</h3>
                                <p className="text-emerald-300 font-medium leading-relaxed">
                                    Our trainers will visit your mandi (or call you) and teach your staff how to use every module — billing, khata, arrivals, and reports. Training is always free, for life.
                                </p>
                            </div>
                            <ul className="space-y-2 mt-2">
                                {['1-on-1 onboarding session', 'Team training included', 'Training in Hindi/Regional languages', 'Repeat sessions on request'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-emerald-200 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/5 border border-emerald-700/50 rounded-3xl p-8 flex flex-col items-start gap-4 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                                <Package className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <div className="inline-block bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">₹0 Setup</div>
                                <h3 className="text-2xl font-black text-white mb-2">No Setup Cost. Ever.</h3>
                                <p className="text-emerald-300 font-medium leading-relaxed">
                                    Account creation, data migration, master data setup — all done by our team at zero cost. Pay only your monthly/annual subscription. Nothing extra.
                                </p>
                            </div>
                            <ul className="space-y-2 mt-2">
                                {['Free account setup', 'Free data migration', 'Free master data entry', 'No hidden implementation fees'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-emerald-200 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/5 border border-emerald-700/50 rounded-3xl p-8 flex flex-col items-start gap-4 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                                <Headphones className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <div className="inline-block bg-blue-400 text-blue-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3">Always On</div>
                                <h3 className="text-2xl font-black text-white mb-2">Dedicated Support Team</h3>
                                <p className="text-emerald-300 font-medium leading-relaxed">
                                    A dedicated support manager is assigned to your mandi from day one. Reach us via WhatsApp, phone, or in-app chat — we respond during mandi hours.
                                </p>
                            </div>
                            <ul className="space-y-2 mt-2">
                                {['Dedicated account manager', 'WhatsApp & phone support', 'Support in your language', 'Morning mandi hours available'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-emerald-200 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Social Proof Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 border border-emerald-700/40 rounded-2xl px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {['A','B','C','D','E'].map((l, i) => (
                                    <div key={i} className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-emerald-900 flex items-center justify-center text-white text-xs font-black">{l}</div>
                                ))}
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">200+ mandis already onboarded</p>
                                <p className="text-emerald-400 text-xs font-bold">Average onboarding time: under 2 hours</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                            <span className="text-white font-black ml-2">4.9/5</span>
                            <span className="text-emerald-400 font-bold text-sm ml-1">from mandi operators</span>
                        </div>
                        <Link href="/login?mode=signup" className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-900/50 flex items-center gap-2">
                            Start Free — We'll Set You Up <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SEO Keyword Section — Sabji Billing & Sabzi Mandi Software */}
            <section className="py-20 px-6 bg-white relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-center text-[1.75rem] font-bold text-[#0b2e14] mb-2">
                            Complete Mandi Software for Every Market & Trader
                        </h2>
                        <p className="text-center text-[#5a6355] mb-8">
                            From sabzi mandi to anaj mandi — MandiGrow handles billing, khata, GST and settlements.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {[
                            { title: 'Sabji Lot Billing in Seconds', desc: 'Bill by crate, carton, or kilogram. Auto-calculate totals for any sabji variety at the mandi gate.', href: '/sabji-billing-software' },
                            { title: 'Fruit Billing Software', desc: 'Complete fruit billing software — manage purchase bills, sales invoices, and GST for any fruit variety or lot size. Auto-valuation for perishable inventory.', href: '/fruit-vegetable-billing' },
                            { title: 'Vegetable Billing Made Fast', desc: 'Vegetable billing made fast — scan crates, auto-calculate weights, and print GST-compliant pattis in seconds.', href: '/fruit-vegetable-billing' },
                            { title: 'Digital Mandi Khata Software', desc: 'Replace paper bahis with digital mandi khata software. Every party balance is live, every settlement clean. Track advances, payments, and credits instantly.', href: '/mandi-khata-software' },
                            { title: 'Anaj Mandi Software', desc: 'Also for Anaj Mandi — grain and pulse traders. MandiGrow handles commodity lot tracking, sacks, quintal billing, and trader settlements for wheat, rice, dal, and pulses.', href: '/anaj-mandi-software' },
                            { title: 'Why MandiGrow is the Best Sabzi Mandi Software', desc: 'Built for the morning auction and evening settlement — not adapted from a shop billing app. The only cloud mandi software with mobile, Hindi, GST, and khata all in one.', href: '/sabzi-mandi-software' },
                        ].map(({ title, desc, href }) => (
                            <Link 
                                key={title} 
                                href={href} 
                                aria-label={`Learn more about ${title}`}
                                className="p-8 rounded-3xl bg-[#f7fbf3] border border-emerald-100 hover:border-emerald-400 transition-all shadow-sm flex flex-col h-full group"
                            >
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">{desc}</p>
                                <span className="text-emerald-700 font-bold text-sm mt-auto group-hover:text-emerald-800 transition-colors">
                                    Learn more →
                                </span>
                            </Link>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/sabji-billing-software" className="px-6 py-3 bg-emerald-700 text-white font-bold rounded-full hover:bg-emerald-800 transition text-sm">
                            Sabji Billing Software →
                        </Link>
                        <Link href="/fruit-vegetable-billing" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-full border border-emerald-300 hover:bg-emerald-50 transition text-sm">
                            Fruit & Vegetable Billing →
                        </Link>
                        <Link href="/gst-mandi-compliance" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-full border border-emerald-300 hover:bg-emerald-50 transition text-sm">
                            GST Mandi Compliance →
                        </Link>
                        <Link href="/mandi-billing" className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-full border border-emerald-300 hover:bg-emerald-50 transition text-sm">
                            Mandi Billing Software →
                        </Link>
                    </div>
                </div>
            </section>


            <section id="solutions" className="py-24 px-6 bg-[#dce7c8] relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 px-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-gray-900">{t('landing.solutions_title')}</h2>
                        <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto">{t('landing.solutions_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-emerald-900 text-emerald-50 p-10 rounded-[40px] flex flex-col justify-between">
                            <div>
                                <LayoutGrid className="w-10 h-10 mb-6 text-emerald-400" />
                                <h3 className="text-3xl font-black mb-4">{t('landing.solution_commission_title')}</h3>
                                <p className="text-emerald-200 font-medium mb-8">{t('landing.solution_commission_desc')}</p>
                            </div>
                            <ul className="space-y-3 font-bold text-sm">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t('landing.feature_fintech_title')}</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t('landing.feature_logistics_title')}</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t('landing.feature_compliance_title')}</li>
                            </ul>
                        </div>
                        <div className="bg-white border border-emerald-100 p-10 rounded-[40px] flex flex-col justify-between">
                            <div>
                                <Calculator className="w-10 h-10 mb-6 text-emerald-600" />
                                <h3 className="text-3xl font-black mb-4 text-gray-900">{t('landing.solution_wholesaler_title')}</h3>
                                <p className="text-gray-600 font-medium mb-8">{t('landing.solution_wholesaler_desc')}</p>
                            </div>
                            <ul className="space-y-3 font-bold text-sm text-gray-700">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('sales.title')}</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('purchase.title')}</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('nav.gst_compliance')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compliance Section */}
            <section id="compliance" className="py-24 px-6 bg-white relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 text-gray-900">{t('landing.compliance_title')}</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Lock className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{t('landing.feature_compliance_title')}</h4>
                                        <p className="text-gray-600 font-medium">{t('landing.trust_security_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{t('nav.gst_compliance')}</h4>
                                        <p className="text-gray-600 font-medium">{t('landing.feature_compliance_desc')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{t('landing.trust_audit_desc')}</h4>
                                        <p className="text-gray-600 font-medium">{t('auth.secure_connection')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-emerald-50 p-1 rounded-[40px] rotate-2">
                             <div className="bg-white p-8 rounded-[38px] border border-emerald-100 shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="font-black text-xl tracking-tighter">{t('landing.compliance_health')}</div>
                                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase">{t('landing.status_secure')}</div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs">{i}</div>
                                            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${70 + (i * 5)}%` }} />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400">{t('landing.status_active')}</div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA SECTION ───────────────────────────────────────────── */}
            <section className="py-24 px-6 bg-[#dce7c8] relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest mb-8 border border-emerald-200">
                        <Zap className="w-3.5 h-3.5" /> Ready in Under 2 Hours
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6">
                        Start Today. <span className="text-emerald-700">We Handle the Rest.</span>
                    </h2>
                    <p className="text-xl text-gray-600 font-medium mb-4 max-w-2xl mx-auto">
                        Join 200+ mandi operators across India who switched to digital in under a day.
                    </p>

                    {/* Reassurance chips */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                        {[
                            { icon: <GraduationCap className="w-4 h-4" />, label: 'Free Training' },
                            { icon: <Package className="w-4 h-4" />, label: '₹0 Setup Cost' },
                            { icon: <Headphones className="w-4 h-4" />, label: 'Dedicated Support' },
                            { icon: <CheckCircle2 className="w-4 h-4" />, label: 'No Credit Card' },
                            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Cancel Anytime' },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-emerald-200 text-sm font-bold text-emerald-800 shadow-sm">
                                <span className="text-emerald-600">{icon}</span>{label}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login?mode=signup" className="bg-emerald-700 text-white px-10 py-5 rounded-full font-black text-xl hover:bg-emerald-800 transition-all hover:scale-105 flex items-center gap-3 shadow-[0_0_60px_-10px_rgba(4,120,87,0.5)]">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 px-8 py-5 rounded-full border-2 border-emerald-400 text-emerald-800 font-black text-lg hover:bg-white/60 transition-all group">
                            <Headphones className="w-5 h-5 group-hover:scale-110 transition-transform" /> Contact Us to Onboard
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-6">Our team will call you back within 30 minutes during business hours.</p>
                </div>
            </section>

            {/* Footer */}
            <LandingFooter />
        </div>
    )
}
