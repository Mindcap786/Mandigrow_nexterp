'use client'

import Link from 'next/link'
import { ShieldCheck, Twitter, Youtube, Linkedin, Instagram } from 'lucide-react'
import { useLanguage } from '@/components/i18n/language-provider'

const FOOTER_COLUMNS = [
    {
        heading: 'Product',
        links: [
            { label: 'Features',           href: '/features' },
            { label: 'Pricing',            href: '/pricing' },
            { label: 'Blog',               href: '/blog' },
            { label: 'Mandi Billing',      href: '/mandi-billing' },
            { label: 'Mandi ERP',          href: '/mandi-erp-software' },
            { label: 'Commission Agent',   href: '/commission-agent-software' },
            { label: 'Digital Khata',      href: '/digital-mandi-khata-software' },
            { label: 'Mandi Accounting',   href: '/mandi-accounting-software' },
            { label: 'J-Form Billing',     href: '/j-form-billing-software' },
            { label: 'APMC Gate Pass',     href: '/apmc-gate-pass-software' },
            { label: 'GST Compliance',     href: '/gst-mandi-compliance' },
        ],
    },
    {
        heading: 'By Commodity',
        links: [
            { label: 'Fruit Mandi',           href: '/fruit-mandi-software' },
            { label: 'Sabji / Vegetable',     href: '/sabji-mandi-software' },
            { label: 'Apple Mandi',           href: '/apple-mandi-software' },
            { label: 'Mango Mandi',           href: '/mango-mandi-software' },
            { label: 'Onion & Potato',        href: '/onion-potato-mandi-software' },
            { label: 'Mirchi Mandi',          href: '/chilli-mandi-software' },
            { label: 'Tomato Mandi',          href: '/tomato-mandi-software' },
            { label: 'Anaj / Grain',          href: '/anaj-mandi-erp-software' },
            { label: 'Poultry Wholesale',     href: '/poultry-wholesale-software' },
        ],
    },
    {
        heading: 'By State',
        links: [
            { label: 'Andhra Pradesh',   href: '/mandi-software-andhra-pradesh' },
            { label: 'Telangana',        href: '/mandi-software-telangana' },
            { label: 'Maharashtra',      href: '/mandi-software-maharashtra' },
            { label: 'Punjab',           href: '/mandi-software-punjab' },
            { label: 'Karnataka',        href: '/mandi-software-karnataka' },
            { label: 'Tamil Nadu',       href: '/mandi-software-tamil-nadu' },
            { label: 'Rajasthan',        href: '/mandi-software-rajasthan' },
            { label: 'Uttar Pradesh',    href: '/mandi-software-uttar-pradesh' },
            { label: 'In Hindi',         href: '/mandi-software-hindi' },
            { label: 'In Marathi',       href: '/mandi-software-marathi' },
        ],
    },
    {
        heading: 'By City',
        links: [
            { label: 'Azadpur Mandi',       href: '/azadpur-mandi-software' },
            { label: 'Vashi Mandi',         href: '/vashi-mandi-software' },
            { label: 'Ghazipur Mandi',      href: '/ghazipur-mandi-software' },
            { label: 'Yeshwanthpur',        href: '/yeshwanthpur-mandi-software' },
            { label: 'Bowenpally',          href: '/bowenpally-mandi-software' },
            { label: 'Okhla Mandi',         href: '/okhla-mandi-software' },
        ],
    },
    {
        heading: 'Compare',
        links: [
            { label: 'MandiGrow vs Tally',    href: '/tally-vs-mandigrow' },
            { label: 'MandiGrow vs Vyapar',   href: '/vyapar-vs-mandigrow' },
            { label: 'MandiGrow vs Marg ERP', href: '/marg-erp-vs-mandigrow' },
            { label: 'MandiGrow vs Zoho',     href: '/zoho-vs-mandigrow' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'Blog',           href: '/blog' },
            { label: 'FAQ',            href: '/faq' },
            { label: 'Partners',       href: '/partners' },
            { label: 'Contact',        href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Refund Policy',  href: '/refund-policy' },
        ],
    },
]

export function LandingFooter() {
    const { t } = useLanguage();

    return (
        <footer className="bg-[#0d1f14] text-white relative overflow-hidden mt-auto">

            {/* Top gradient accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

            {/* Main footer grid */}
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">

                {/* Brand + columns row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-10">

                    {/* Brand column — spans 1 col on lg */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-[#0d1f14] font-black text-xl shadow-lg shadow-emerald-500/30">M</div>
                            <span className="text-2xl font-black tracking-tighter text-white">MandiGrow</span>
                        </Link>
                        <p className="text-emerald-300/60 text-sm leading-relaxed max-w-[200px]">
                            The Global Operating System for Modern Mandis.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="text-[9px] uppercase font-black tracking-widest text-emerald-400/40">By</div>
                            <div className="text-sm font-black text-emerald-300/70 tracking-tight">MINDT Pvt Ltd</div>
                        </div>
                        {/* Social links */}
                        <div className="flex items-center gap-3 mt-2">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex items-center justify-center transition-all">
                                <Linkedin className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex items-center justify-center transition-all">
                                <Twitter className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex items-center justify-center transition-all">
                                <Youtube className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns — each in its own col */}
                    {FOOTER_COLUMNS.map((col) => (
                        <div key={col.heading} className="flex flex-col gap-3">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-emerald-400/60 mb-1 pb-2 border-b border-white/5">
                                {col.heading}
                            </h3>
                            {col.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-[13px] font-medium text-emerald-100/55 hover:text-emerald-300 transition-colors leading-tight"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="mt-14 h-px w-full bg-white/5" />

                {/* Bottom bar */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-emerald-300/30">
                    <p>© {new Date().getFullYear()} MINDT Private Limited. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                        <span>SOC-2 Type II Certified Data Centers</span>
                    </div>
                </div>
            </div>

            {/* Decorative glows */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-10 right-0 w-[400px] h-[250px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        </footer>
    )
}
