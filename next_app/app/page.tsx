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
                        '@type': 'SoftwareApplication',
                        name: 'MandiGrow',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any, Web, Android',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'INR',
                        },
                        description: 'India\'s leading APMC Mandi ERP software for commission agents and wholesale fruit & vegetable traders.',
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'What is mandi software?',
                                acceptedAnswer: { '@type': 'Answer', text: 'Mandi software is an ERP designed specifically for Indian agricultural wholesale markets to automate lot billing, commission, hamali, and digital khata.' }
                            },
                            {
                                '@type': 'Question',
                                name: 'Can I use MandiGrow on my mobile?',
                                acceptedAnswer: { '@type': 'Answer', text: 'Yes, MandiGrow has a native Android app designed for fast gate entries during morning auctions.' }
                            }
                        ]
                    }),
                }}
            />

            {/* Hero Section */}
            <main className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Left Content */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/50 text-[10px] sm:text-xs font-bold text-emerald-800 mb-8 backdrop-blur-sm shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                        </span>
                        Enterprise-Grade Mandi Software
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tighter">
                        <span className="text-gray-900 block">India's Best Mandi ERP Software</span>
                        <span className="text-emerald-700 block mt-2">for Commission Agents & Traders.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10 font-medium leading-relaxed">
                        Auto commission, GST billing, mandi khata, and APMC compliance — 
                        works on Android at the mandi gate and desktop in your office. 
                        Available in Hindi, Telugu, Tamil, Kannada, Malayalam & Urdu.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
                        <Link href="/login?mode=signup" className="w-full sm:w-auto bg-emerald-700 text-white px-8 py-4 rounded-full font-black text-lg hover:bg-emerald-800 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(4,120,87,0.4)]">
                            Start Free Trial <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-emerald-800 border border-emerald-300 hover:border-emerald-500 hover:bg-white/50 transition-all flex items-center justify-center">
                            Already have an account? Sign in.
                        </Link>
                    </div>

                    {/* Trust Bar */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-sm font-bold text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <span className="text-yellow-500 text-lg leading-none">★</span> 
                            Trusted by 200+ mandis
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-emerald-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-emerald-500 text-lg leading-none">✓</span> 
                            No credit card required
                        </div>
                        <div className="hidden md:block w-1 h-1 bg-emerald-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-emerald-700" />
                            Free Training
                        </div>
                        <div className="hidden md:block w-1 h-1 bg-emerald-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                            <Headphones className="w-4 h-4 text-emerald-700" />
                            Dedicated Support
                        </div>
                        <div className="hidden md:block w-1 h-1 bg-emerald-300 rounded-full"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 font-black">₹0</span> 
                            Setup Cost
                        </div>
                    </div>
                </div>

                {/* Right Content - Screenshot */}
                <div className="flex-1 w-full max-w-[520px] relative z-10 mt-12 lg:mt-0 perspective-1000">
                    <div className="hero-screenshot w-full aspect-[4/3] bg-white rounded-2xl border border-emerald-200 shadow-[0_30px_60px_-15px_rgba(4,120,87,0.3)] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-white overflow-hidden transition-all duration-700 hover:transform-none"
                         style={{ transform: 'perspective(1000px) rotateY(-12deg) rotateX(4deg) translateZ(0)', transformStyle: 'preserve-3d' }}>
                        
                        {/* Mockup Header */}
                        <div className="w-full h-12 bg-gray-50 border-b border-emerald-100 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="mx-auto w-1/2 h-5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 flex items-center justify-center font-mono">
                                mandigrow.com/billing
                            </div>
                        </div>

                        {/* Mockup Body Image */}
                        <div className="flex-1 w-full relative overflow-hidden bg-slate-900 border-t border-emerald-100">
                            {/* The user will place the dashboard screenshot here */}
                            <img 
                                src="/dashboard-screenshot.png" 
                                alt="MandiGrow Command Center Dashboard" 
                                className="absolute inset-0 w-full h-full object-cover object-top origin-top"
                            />
                            {/* Subtle inner shadow for depth inside the browser window */}
                            <div className="absolute inset-0 shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)] pointer-events-none" />
                        </div>
                    </div>
                    {/* Decorative Blob Behind Image */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-3xl blur-2xl -z-10 transform translate-x-4 translate-y-4"></div>
                </div>
            </main>

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
                        <a href="tel:+918008000000" className="flex items-center gap-2 px-8 py-5 rounded-full border-2 border-emerald-400 text-emerald-800 font-black text-lg hover:bg-white/60 transition-all">
                            <Phone className="w-5 h-5" /> Call Us to Onboard
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-6">Our team will call you back within 30 minutes during business hours.</p>
                </div>
            </section>

            {/* Footer */}
            <LandingFooter />
        </div>
    )
}
