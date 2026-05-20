'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'

export function LandingFooter() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-[#c8d6b0] pt-16 pb-8 px-6 bg-[#dce7c8] relative overflow-hidden mt-auto">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    
                    {/* Beautiful Branding Column */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 shadow-lg shadow-emerald-700/20 flex items-center justify-center text-white font-black text-2xl tracking-tighter">M</div>
                            <span className="text-3xl font-black tracking-tighter text-gray-900">MandiGrow</span>
                        </div>
                        <p className="text-emerald-800/80 font-medium text-sm max-w-[280px]">
                            The Global Operating System for Modern Mandis.
                        </p>
                        
                        <div className="mt-8 flex items-center gap-3 bg-white/40 px-4 py-2 rounded-full border border-emerald-200/50 backdrop-blur-sm">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-800/60">Engineered By</span>
                            <div className="h-4 w-px bg-emerald-800/20"></div>
                            <span className="text-sm font-black text-emerald-900 tracking-tight">MINDT Private Limited</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex gap-x-8 gap-y-4 text-sm font-bold text-emerald-800/80 flex-wrap justify-center md:justify-end max-w-2xl">
                        <Link href="/features" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Features</Link>
                        <Link href="/pricing" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Pricing</Link>
                        <Link href="/mandi-billing" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Mandi Billing</Link>
                        <Link href="/mandi-billing-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Billing Software</Link>
                        <Link href="/mandi-erp-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Mandi ERP</Link>
                        <Link href="/agriculture-billing-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Agri Billing</Link>
                        <Link href="/commission-agent-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Commission Agent</Link>
                        <Link href="/digital-mandi-khata-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Digital Khata</Link>
                        <Link href="/mandi-khata-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Mandi Khata</Link>
                        <Link href="/fruit-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Fruit Mandi</Link>
                        <Link href="/sabji-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Sabji Mandi</Link>
                        <Link href="/vegetable-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Vegetable Mandi</Link>
                        <Link href="/sabji-billing-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Sabji Billing</Link>
                        <Link href="/fruit-vegetable-billing" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Fruit & Veg Billing</Link>
                        <Link href="/gst-mandi-compliance" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">GST Compliance</Link>
                        <Link href="/blog" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Blog</Link>
                        <Link href="/faq" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">FAQ</Link>
                        <Link href="/partners" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Partners</Link>
                        <Link href="/mandi-software-andhra-pradesh" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Andhra Pradesh</Link>
                        <Link href="/mandi-software-telangana" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Telangana</Link>
                        <Link href="/mandi-software-maharashtra" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Maharashtra</Link>
                        <Link href="/mandi-software-punjab" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Punjab</Link>
                        <Link href="/mandi-software-karnataka" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Karnataka</Link>
                        <Link href="/mandi-software-tamil-nadu" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Tamil Nadu</Link>
                        <Link href="/mandi-software-rajasthan" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Rajasthan</Link>
                        <Link href="/mandi-software-uttar-pradesh" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Uttar Pradesh</Link>
                        <Link href="/mandi-software-bihar" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Bihar</Link>
                        <Link href="/anaj-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Anaj Mandi</Link>
                        <Link href="/apmc-billing-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">APMC Billing</Link>
                        
                        {/* Phase 2: Local Mandis */}
                        <Link href="/azadpur-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Azadpur</Link>
                        <Link href="/vashi-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Vashi</Link>
                        <Link href="/ghazipur-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Ghazipur</Link>
                        <Link href="/yeshwanthpur-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Yeshwanthpur</Link>
                        <Link href="/bowenpally-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Bowenpally</Link>
                        <Link href="/okhla-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Okhla</Link>

                        {/* Phase 3: Competitors */}
                        <Link href="/tally-vs-mandigrow" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Tally Alternative</Link>
                        <Link href="/vyapar-vs-mandigrow" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Vyapar Alternative</Link>
                        <Link href="/marg-erp-vs-mandigrow" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Marg ERP Alternative</Link>
                        <Link href="/zoho-vs-mandigrow" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Zoho Alternative</Link>

                        {/* Phase 4: By Commodity */}
                        <Link href="/apple-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Apple Mandi</Link>
                        <Link href="/mango-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Mango Mandi</Link>
                        <Link href="/onion-potato-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Onion &amp; Potato</Link>
                        <Link href="/chilli-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Mirchi Mandi</Link>
                        <Link href="/tomato-mandi-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Tomato Mandi</Link>
                        <Link href="/anaj-mandi-erp-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Anaj/Grain Mandi</Link>
                        <Link href="/poultry-wholesale-software" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all text-emerald-900">Poultry Wholesale</Link>
                        <Link href="/privacy" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">{t('landing.privacy_policy') || 'Privacy Policy'}</Link>
                        <Link href="/terms" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">{t('landing.terms_of_service') || 'Terms of Service'}</Link>
                        <Link href="/refund-policy" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">Refund Policy</Link>
                        <Link href="/contact" className="hover:text-emerald-950 hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">{t('landing.footer_contact') || 'Contact'}</Link>
                    </div>
                </div>
                
                {/* Copyright & Bottom */}
                <div className="pt-8 border-t border-emerald-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-emerald-800/60">
                    <p>© {new Date().getFullYear()} MINDT Private Limited. All rights reserved.</p>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>SOC-2 Type II Certified Data Centers</span>
                    </div>
                </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-10 -right-20 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
        </footer>
    )
}
