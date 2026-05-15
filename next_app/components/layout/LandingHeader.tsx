'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'

export function LandingHeader() {
    const { t } = useLanguage()

    return (
        <div className="fixed top-0 w-full z-50 flex flex-col">
            {/* Dynamic Promotional Banner */}
            <div className="bg-emerald-900 text-emerald-50 text-[10px] sm:text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 tracking-wide w-full border-b border-emerald-800/50 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{t('auth.enterprise_live')}</span>
            </div>
            
            {/* Navigation */}
            <nav className="w-full border-b border-[#c8d6b0] bg-[#dce7c8]/90 backdrop-blur-md relative">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                        <div className="relative group">
                            <button className="flex items-center gap-1 hover:text-emerald-800 transition-colors py-4">
                                {t('landing.nav_features')} <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
                            </button>
                            <div className="absolute top-full -left-4 mt-0 w-[480px] bg-white rounded-2xl shadow-xl shadow-emerald-900/10 border border-emerald-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-6 grid grid-cols-2 gap-x-8 gap-y-4 pointer-events-none group-hover:pointer-events-auto z-50">
                                <div>
                                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4">Core Software</h4>
                                    <div className="space-y-3">
                                        <Link href="/mandi-billing" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Mandi Billing</Link>
                                        <Link href="/commission-agent-software" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Commission Agent Software</Link>
                                        <Link href="/mandi-khata-software" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Mandi Khata (Ledger)</Link>
                                        <Link href="/gst-mandi-compliance" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">GST &amp; Mandi Compliance</Link>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4">Commodity &amp; State</h4>
                                    <div className="space-y-3">
                                        <Link href="/sabji-billing-software" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Sabji Billing Software</Link>
                                        <Link href="/fruit-vegetable-billing" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Fruit &amp; Veg Billing</Link>
                                        <Link href="/mandi-software-andhra-pradesh" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Andhra Pradesh APMC</Link>
                                        <Link href="/mandi-software-telangana" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Telangana AMC</Link>
                                        <Link href="/mandi-software-maharashtra" className="block text-gray-900 hover:text-emerald-700 font-bold text-sm">Maharashtra APMC</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Link href="/#solutions" className="hover:text-emerald-800 transition-colors">{t('landing.nav_solutions')}</Link>
                        <Link href="/subscribe" className="hover:text-emerald-800 transition-colors font-bold text-emerald-800">{t('nav.subscription_billing')}</Link>
                        <Link href="/partners" className="hover:text-emerald-800 transition-colors">Partner Program</Link>
                        <Link href="/#compliance" className="hover:text-emerald-800 transition-colors">{t('nav.compliance')}</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-emerald-800 transition-colors">
                            {t('auth.sign_in_btn')}
                        </Link>
                        <Link href="/login" className="hidden md:flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all hover:scale-105">
                            {t('landing.get_started')} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    )
}
