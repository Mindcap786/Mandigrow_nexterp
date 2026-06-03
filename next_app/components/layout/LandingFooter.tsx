'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShieldCheck, Twitter, Youtube, Linkedin, Phone, Boxes } from 'lucide-react'
import { callApi } from '@/lib/frappeClient'
import { FOOTER_COLUMNS } from '@/lib/seo-links'

type ContactSettings = {
    phone: string;
    whatsapp: string;
    email_support: string;
    company_name: string;
};

const FALLBACK: ContactSettings = {
    phone: '+91 82609 21301',
    whatsapp: '+91 82609 21301',
    email_support: 'support@mandigrow.com',
    company_name: 'MINDT Private Limited',
};

const digits = (s: string) => (s || '').replace(/\D+/g, '');

export function LandingFooter() {
    const [info, setInfo] = useState<ContactSettings>(FALLBACK);

    useEffect(() => {
        (async () => {
            try {
                const data: any = await callApi('mandigrow.api.get_site_contact_settings');
                if (data) setInfo({ ...FALLBACK, ...(data as ContactSettings) });
            } catch (e) {
                console.error('Failed to load site contact settings:', e);
            }
        })();
    }, []);

    // Extract top lists for Layout 4
    const coreFeatures = FOOTER_COLUMNS.find(c => c.heading === 'Product')?.links.slice(0, 6) || [];
    const topMarkets = FOOTER_COLUMNS.find(c => c.heading === 'By City')?.links.slice(0, 5) || [];
    const companyLinks = FOOTER_COLUMNS.find(c => c.heading === 'Company')?.links.slice(0, 6) || [];

    return (
        <footer className="bg-[#0d1f14] text-white relative overflow-hidden mt-auto border-t border-emerald-900/50">
            
            {/* Pre-Footer Action Banner */}
            <div className="bg-[#dce7c8] py-12 px-6 relative overflow-hidden z-20">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
                            Join thousands of Arhtiyas trading digitally across India.
                        </h2>
                        <p className="text-gray-700 font-medium">
                            Stop wasting hours on manual bahi khata. Modernize your Mandi business today.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <Link href="/subscribe" className="w-full sm:w-auto bg-emerald-700 text-white px-8 py-4 rounded-full font-black text-sm hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20 text-center">
                            Start 14-Day Free Trial
                        </Link>
                        <a href={`tel:${digits(info.phone)}`} className="w-full sm:w-auto bg-white text-emerald-900 border-2 border-emerald-900/10 px-8 py-3.5 rounded-full font-black text-sm hover:bg-emerald-50 transition-all text-center flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" /> Call Sales
                        </a>
                    </div>
                </div>
            </div>

            {/* Main footer grid */}
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    
                    {/* Col 1: Brand & Trust */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-[#0d1f14] font-black text-xl shadow-lg shadow-emerald-500/30">M</div>
                            <span className="text-2xl font-black tracking-tighter text-white">MandiGrow</span>
                        </Link>
                        <p className="text-emerald-300/70 text-sm leading-relaxed">
                            The Global Operating System for Modern Mandis.
                        </p>
                        
                        <div className="space-y-3">
                            <a href={`tel:${digits(info.phone)}`} className="flex items-center gap-3 text-emerald-100 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sales & Support</div>
                                    <div className="text-sm font-bold">{info.phone}</div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Core Product */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] uppercase font-black tracking-widest text-emerald-500 mb-2">Core Features</h3>
                        
                        {/* Highlighted Repack & UOM link */}
                        <Link href="/blog/repack-multi-uom-inventory-management-software" className="flex items-center gap-2 text-[13px] font-bold text-emerald-300 hover:text-emerald-100 transition-colors bg-emerald-900/40 p-2 rounded-lg border border-emerald-500/20 -mx-2">
                            <Boxes className="w-4 h-4 text-emerald-400" />
                            <span>Repack & Multi-UOM</span>
                        </Link>
                        
                        {coreFeatures.map((link) => (
                            <Link key={link.href} href={link.href} className="text-[13px] font-medium text-emerald-100/70 hover:text-emerald-300 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Col 3: Top Markets (SEO Focus) */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] uppercase font-black tracking-widest text-emerald-500 mb-2">Top Markets</h3>
                        {topMarkets.map((link) => (
                            <Link key={link.href} href={link.href} className="text-[13px] font-medium text-emerald-100/70 hover:text-emerald-300 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/mandi-directory" className="text-[13px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-2 flex items-center gap-1">
                            View All Markets &rarr;
                        </Link>
                    </div>

                    {/* Col 4: Company */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] uppercase font-black tracking-widest text-emerald-500 mb-2">Company</h3>
                        {companyLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-[13px] font-medium text-emerald-100/70 hover:text-emerald-300 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>

                </div>

                {/* Divider */}
                <div className="mt-16 h-px w-full bg-white/10" />

                {/* Bottom bar */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-[11px] font-bold text-emerald-300/40 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                        <p>© {new Date().getFullYear()} {info.company_name}. All rights reserved.</p>
                        <Link href="/terms" className="hover:text-emerald-300/70 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-emerald-300/70 transition-colors">Privacy</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500/50 hover:text-emerald-400 transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500/50 hover:text-emerald-400 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500/50 hover:text-emerald-400 transition-colors">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>SOC-2 Type II Certified</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Decorative glows */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-10 right-0 w-[400px] h-[250px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        </footer>
    )
}
