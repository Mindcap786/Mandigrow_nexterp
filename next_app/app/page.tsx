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
import { InteractivePattiGenerator } from '@/components/landing/InteractivePattiGenerator'

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


            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'MandiGrow — Fruit & Sabzi Mandi Software',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Android, Web',
                url: 'https://www.mandigrow.com/',
                description: 'India\'s #1 mandi ERP software for commission agents and wholesale fruit/vegetable traders.',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free trial' },
                aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '210' },
            }) }} />
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

            {/* Hero Section — Full-width premium layout */}
            <main className="relative pt-28 pb-0 overflow-hidden">
                {/* Multi-layer background glows */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-400/10 rounded-full blur-[130px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center pt-10">
                    
                    {/* Centered Hero Text */}
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/60 text-[10px] sm:text-xs font-bold text-emerald-800 mb-8 backdrop-blur-sm shadow-sm">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                            </span>
                            Enterprise-Grade Mandi Software
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 block drop-shadow-sm pb-1">India's Best Mandi ERP Software</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 block mt-1 pb-2">for Fruit, Sabji, Anaj & Commission Agents.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-700 mb-10 font-medium leading-relaxed max-w-3xl mx-auto">
                            Sabji lot billing, fruit invoicing, anaj mandi, commission, GST, and live khata — works on Android at the mandi gate and desktop in your office. Hindi, Telugu, Tamil, Kannada, Malayalam & Urdu.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
                            <Link href="/login?mode=signup" className="w-full sm:w-auto bg-emerald-700 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(4,120,87,0.5)]">
                                Start Free Trial <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-emerald-800 border border-emerald-300 hover:border-emerald-500 hover:bg-white/50 transition-all flex items-center justify-center gap-2">
                                <Headphones className="w-5 h-5" /> Contact Us to Onboard
                            </Link>
                        </div>

                        {/* Trust Bar */}
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-gray-600 mb-16">
                            <div className="flex items-center gap-1.5"><span className="text-yellow-500">★</span> 200+ mandis</div>
                            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full hidden sm:block"></div>
                            <div className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> No credit card</div>
                            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full hidden sm:block"></div>
                            <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-emerald-700" /> Free Training</div>
                            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full hidden sm:block"></div>
                            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-black">₹0</span> Setup Cost</div>
                        </div>
                    </div>

                    {/* Massive Edge-to-Edge Mockup */}
                    <div className="w-full relative px-2 sm:px-8 mt-4">
                        {/* Outer glow ring */}
                        <div className="absolute -inset-4 bg-gradient-to-t from-emerald-400/40 via-emerald-300/10 to-transparent rounded-[40px] blur-3xl -z-10" />
                        
                        <div className="w-full bg-white rounded-t-[24px] rounded-b-[12px] sm:rounded-[32px] border border-emerald-100 shadow-[0_50px_120px_-20px_rgba(4,120,87,0.4),0_0_0_1px_rgba(4,120,87,0.05)] overflow-hidden transform-gpu hover:scale-[1.01] transition-transform duration-700">
                            {/* Browser top bar */}
                            <div className="w-full h-12 bg-gray-50/90 border-b border-gray-200/60 flex items-center px-5 gap-4 backdrop-blur-md">
                                <div className="flex gap-2 flex-shrink-0">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                                </div>
                                <div className="flex-1 max-w-xl mx-auto h-7 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 flex items-center justify-center font-mono gap-1.5 shadow-inner">
                                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> mandigrow.com/dashboard
                                </div>
                                <div className="flex gap-2 flex-shrink-0 opacity-40">
                                    <div className="w-5 h-5 rounded-md bg-gray-200"></div>
                                    <div className="w-5 h-5 rounded-md bg-gray-200"></div>
                                </div>
                            </div>
                            
                            {/* Content Window - Enormous display */}
                            <div className="w-full aspect-[16/9] lg:aspect-[21/9] relative bg-white">
                                <HeroSlider />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom fade-into-next-section */}
                <div className="h-16 bg-gradient-to-b from-transparent to-[#e8f1d4] mt-12" />
            </main>

            {/* Interactive Lead Magnet */}
            <InteractivePattiGenerator />

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-[#e8f1d4] relative z-10 border-t border-[#c8d6b0]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-gray-900">{t('landing.enterprise_title')}</h2>
                        <p className="text-gray-700 text-lg font-medium">{t('landing.enterprise_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
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

                        {/* Feature 4: Crate Management */}
                        <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-400 transition-colors group shadow-sm">
                            <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                                <LayoutGrid className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900">Advanced Crate Management</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">Auto-track crate deposits, returns, and outstanding balances. Integrated directly with the party Ledger (Khata) to generate real-time crate reports and prevent supplier disputes.</p>
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

            {/* SEO Local Mandi & Commodity Links Hub */}
            <section className="py-16 px-6 bg-[#0a2313] text-emerald-50 border-t border-[#123920]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black mb-2">India's Top Mandi Software by Location & Commodity</h2>
                        <p className="text-emerald-400 text-sm font-medium">Find specialized billing, ERP, and khata solutions tailored for your local APMC market.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4 text-xs font-medium text-emerald-200">
                        {/* Column 1: Top Commodities */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-white text-sm mb-2 uppercase tracking-wider text-emerald-400">By Commodity</h3>
                            <Link href="/fruit-mandi-software" className="hover:text-white transition">Fruit Mandi Software</Link>
                            <Link href="/sabji-mandi-software" className="hover:text-white transition">Sabji Mandi Software</Link>
                            <Link href="/anaj-mandi-erp-software" className="hover:text-white transition">Anaj Mandi ERP Software</Link>
                            <Link href="/sabji-crate-management-app" className="hover:text-white transition">Sabji Crate Management App</Link>
                            <Link href="/apple-mandi-software" className="hover:text-white transition">Apple Trader Software</Link>
                            <Link href="/mango-mandi-software" className="hover:text-white transition">Mango Commission Agent Software</Link>
                            <Link href="/onion-potato-mandi-software" className="hover:text-white transition">Onion & Potato Billing Software</Link>
                            <Link href="/tomato-mandi-software" className="hover:text-white transition">Tomato APMC Software</Link>
                        </div>
                        {/* Column 2: Local Mandis */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-white text-sm mb-2 uppercase tracking-wider text-emerald-400">Top Mandis</h3>
                            <Link href="/azadpur-mandi-software" className="hover:text-white transition">Azadpur Mandi Software (Delhi)</Link>
                            <Link href="/vashi-mandi-software" className="hover:text-white transition">Vashi APMC Software (Mumbai)</Link>
                            <Link href="/bowenpally-mandi-software" className="hover:text-white transition">Bowenpally Mandi Software (HYD)</Link>
                            <Link href="/ghazipur-mandi-software" className="hover:text-white transition">Ghazipur Sabzi Mandi Software</Link>
                            <Link href="/okhla-mandi-software" className="hover:text-white transition">Okhla Mandi ERP</Link>
                            <Link href="/yeshwanthpur-mandi-software" className="hover:text-white transition">Yeshwanthpur APMC Software</Link>
                        </div>
                        {/* Column 3: By State */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-white text-sm mb-2 uppercase tracking-wider text-emerald-400">By State</h3>
                            <Link href="/mandi-software-maharashtra" className="hover:text-white transition">APMC Software Maharashtra</Link>
                            <Link href="/mandi-software-telangana" className="hover:text-white transition">Mandi Software Telangana</Link>
                            <Link href="/mandi-software-andhra-pradesh" className="hover:text-white transition">Mandi Software Andhra Pradesh</Link>
                            <Link href="/mandi-software-karnataka" className="hover:text-white transition">Mandi ERP Karnataka</Link>
                            <Link href="/mandi-software-punjab" className="hover:text-white transition">Arhtiya Software Punjab</Link>
                            <Link href="/mandi-software-uttar-pradesh" className="hover:text-white transition">Sabji Mandi Software UP</Link>
                        </div>
                        {/* Column 4: Core Solutions */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-white text-sm mb-2 uppercase tracking-wider text-emerald-400">Core Solutions</h3>
                            <Link href="/mandi-khata-software" className="hover:text-white transition">Digital Mandi Khata App</Link>
                            <Link href="/mandi-billing-software" className="hover:text-white transition">Mandi Billing Software</Link>
                            <Link href="/mandi-crate-management-software" className="hover:text-white transition">Mandi Crate Tracking Software</Link>
                            <Link href="/commission-agent-software" className="hover:text-white transition">Commission Agent Software</Link>
                            <Link href="/farmer-payment-management" className="hover:text-white transition">Farmer Payment Management</Link>
                            <Link href="/gst-mandi-compliance" className="hover:text-white transition">GST Mandi Compliance</Link>
                            <Link href="/apmc-gate-pass-software" className="hover:text-white transition">APMC Gate Pass Software</Link>
                        </div>
                        {/* Column 5: Comparisons */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-white text-sm mb-2 uppercase tracking-wider text-emerald-400">Comparisons</h3>
                            <Link href="/tally-vs-mandigrow" className="hover:text-white transition">Tally vs MandiGrow</Link>
                            <Link href="/vyapar-vs-mandigrow" className="hover:text-white transition">Vyapar vs MandiGrow</Link>
                            <Link href="/marg-erp-vs-mandigrow" className="hover:text-white transition">Marg ERP vs MandiGrow</Link>
                            <Link href="/zoho-vs-mandigrow" className="hover:text-white transition">Zoho Books vs MandiGrow</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <LandingFooter />
        </div>
    )
}
