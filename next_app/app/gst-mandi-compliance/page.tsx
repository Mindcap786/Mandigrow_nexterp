import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { TranslatedText } from '@/components/i18n/translated-text';

/**
 * /gst-mandi-compliance — SEO landing page
 * Target: "GST commission agent mandi" (320/mo) + "mandi tax software India" + "APMC GST compliance"
 */

export const metadata: Metadata = {
    title: 'GST Software for Commission Agents & Mandi Traders | MandiGrow',
    description:
        'Automate GST billing, Mandi Tax (Cess), and audit-ready reports with MandiGrow. Built for commission agents and fruit-vegetable traders across all Indian states. Free trial.',
    keywords: [
        'GST commission agent mandi',
        'mandi tax software India',
        'GST software mandi traders',
        'APMC GST compliance',
        'GST billing vegetable trader',
        'mandi cess software',
        'APMC market software India',
        'GST software fruits vegetables India',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/gst-mandi-compliance' },
    openGraph: {
        title: 'GST & Mandi Tax Compliance Software for Commission Agents | MandiGrow',
        description:
            'Auto GST, Mandi Tax, GSTR-1, GSTR-3B, and audit-ready reports — purpose-built for commission agents and mandi traders in India.',
        url: 'https://www.mandigrow.com/gst-mandi-compliance',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'Do commission agents in mandi need to file GST?',
        a: 'Yes. Commission agents whose turnover exceeds ₹20 lakhs (₹10 lakhs in special category states) must register for GST. MandiGrow auto-calculates GST on every commission sale and generates GSTR-1 ready data for filing, making compliance effortless.',
    },
    {
        q: 'What is Mandi Tax (Cess) and which states have it?',
        a: 'Mandi Tax or Mandi Cess is a local levy charged on agricultural produce sold through APMC markets. It is separate from GST. States like Andhra Pradesh, Telangana, Maharashtra, Punjab, and Madhya Pradesh levy Mandi Tax. MandiGrow auto-calculates Mandi Cess based on the state your mandi operates in.',
    },
    {
        q: 'Can MandiGrow generate GSTR-1 data for mandi traders?',
        a: 'Yes. MandiGrow automatically organizes all your sales data into GSTR-1 format — B2B (buyer-wise), B2C, and export records. Export ready for your CA or upload directly to the GST portal. No manual data entry, no spreadsheets.',
    },
    {
        q: 'Is MandiGrow compliant with APMC regulations?',
        a: 'Yes. MandiGrow is designed for APMC-registered mandis and commission agents. It supports the mandatory documentation — gate entries, lot records, commission pattis, and trade statements — required by APMC authorities in most states.',
    },
    {
        q: 'Does MandiGrow work for both registered and composition scheme dealers?',
        a: 'Yes. MandiGrow supports both regular GST registration and the Composition Scheme. For composition dealers, it tracks turnover thresholds and generates the simplified CMP-08 quarterly return data. Switch between tax modes without losing any transaction history.',
    },
    {
        q: 'How does MandiGrow handle GST for different fruit and vegetable varieties?',
        a: 'Most fresh fruits and vegetables are exempt from GST under Chapter 7 of the HSN code. However, processed, branded, or packed produce may attract 5% or 12% GST. MandiGrow lets you configure HSN codes and GST rates per item — and auto-applies them on every invoice.',
    },
];

const states = [
    { state: 'Andhra Pradesh', cess: 'Yes', rate: '1–2%', note: 'AP Mandi Commission Cess' },
    { state: 'Telangana', cess: 'Yes', rate: '1%', note: 'Telangana Market Committee Cess' },
    { state: 'Maharashtra', cess: 'Yes', rate: '1%', note: 'Maharashtra APMC Market Fee' },
    { state: 'Punjab', cess: 'Yes', rate: '2%', note: 'Punjab Mandi Board Fee' },
    { state: 'Madhya Pradesh', cess: 'Yes', rate: '2%', note: 'MP Krishi Upaj Mandi Cess' },
    { state: 'Rajasthan', cess: 'Yes', rate: '1.6%', note: 'Rajasthan Mandi Fee' },
    { state: 'Gujarat', cess: 'No', rate: 'N/A', note: 'APMC abolished (deregulated)' },
    { state: 'Karnataka', cess: 'Yes', rate: '1%', note: 'Regulated Market Committee Fee' },
];

export default function GstMandiCompliancePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 pt-20">
            <LandingHeader />

            {/* JSON-LD: FAQPage */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: FAQ.map((f) => ({
                            '@type': 'Question',
                            name: f.q,
                            acceptedAnswer: { '@type': 'Answer', text: f.a },
                        })),
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                            { '@type': 'ListItem', position: 2, name: 'GST Mandi Compliance', item: 'https://www.mandigrow.com/gst-mandi-compliance' },
                        ],
                    }),
                }}
            />

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    GST &amp; Mandi Tax Compliance Software · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    <TranslatedText tKey="seo_pages.gst_h1" fallback="GST &amp; Mandi Tax Compliance Software for Commission Agents in India" />
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-4">
                    <TranslatedText tKey="seo_pages.gst_p" fallback="Generate GST-compliant bills, automate Mandi Tax (Cess), and export GSTR-1 and GSTR-3B instantly. Built specifically for APMC, sabzi mandi, and agricultural wholesale markets." />
                </p>
                <p className="text-lg text-gray-600 max-w-3xl mb-8">
                    No manual spreadsheets. No midnight data entry. Stay compliant without ever leaving your mandi workflow.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition">
                        Start Free Trial →
                    </Link>
                    <Link href="/login" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition">
                        Book a Free Demo
                    </Link>
                </div>
            </section>

            {/* GST Features */}
            <section className="bg-emerald-900 text-white py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                        Complete GST Automation for Mandi Commission Agents
                    </h2>
                    <p className="text-emerald-200 text-lg mb-10 max-w-3xl">
                        Every GST feature a commission agent or mandi trader needs — built in, automated, and
                        always up to date with the latest GST rules.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Auto GST on Every Sale', desc: 'CGST, SGST, IGST — auto-calculated based on buyer state. Supports 0%, 5%, 12% and exempt categories for fresh produce.' },
                            { title: 'Mandi Tax (Cess) Automation', desc: 'AP, Telangana, Maharashtra, Punjab, MP Mandi Cess is auto-calculated on every APMC sale transaction.' },
                            { title: '1-Click GSTR-1 Export', desc: 'All your sales data organized into GSTR-1 format — B2B, B2C, export. Ready to upload or hand to your CA.' },
                            { title: 'GSTR-3B Data Ready', desc: 'Monthly summary of taxable sales, exempt supplies, and input tax credit — ready for GSTR-3B filing.' },
                            { title: 'Audit Trail for Inspectors', desc: 'Complete transaction log with timestamps, user IDs, and party details. No manual reconciliation for government audits.' },
                            { title: 'Composition Scheme Support', desc: 'Track turnover thresholds. Generate CMP-08 quarterly return data. Switch tax modes without losing history.' },
                        ].map(({ title, desc }) => (
                            <div key={title} className="p-6 bg-emerald-800/60 border border-emerald-700 rounded-3xl">
                                <h3 className="text-lg font-black mb-2 text-emerald-100">{title}</h3>
                                <p className="text-emerald-300 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mandi Tax by State */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                    Mandi Tax (Cess) by State — India APMC Market Software
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                    MandiGrow is configured for APMC market software compliance across all major Indian states.
                    The Mandi Tax rate is automatically applied based on your registered state — no manual configuration needed.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-emerald-700 text-white">
                                <th className="p-4 text-left rounded-tl-2xl font-black">State</th>
                                <th className="p-4 text-center font-black">Mandi Cess</th>
                                <th className="p-4 text-center font-black">Rate</th>
                                <th className="p-4 text-left rounded-tr-2xl font-black">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {states.map(({ state, cess, rate, note }, i) => (
                                <tr key={state} className={i % 2 === 0 ? 'bg-white' : 'bg-emerald-50'}>
                                    <td className="p-4 font-bold text-gray-700">{state}</td>
                                    <td className={`p-4 text-center font-bold ${cess === 'Yes' ? 'text-emerald-600' : 'text-gray-400'}`}>{cess}</td>
                                    <td className="p-4 text-center text-gray-600">{rate}</td>
                                    <td className="p-4 text-gray-500 text-xs">{note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    * Cess rates are indicative and may change per APMC notifications. MandiGrow is updated regularly to reflect current rates.
                </p>
            </section>

            {/* FAQ */}
            <section className="bg-[#f0f8e8] px-6 py-16 border-t border-emerald-100">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                        GST for Mandi Commission Agents — FAQ
                    </h2>
                    <div className="space-y-6">
                        {FAQ.map((f) => (
                            <div key={f.q} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                                <h3 className="text-lg font-black mb-2">{f.q}</h3>
                                <p className="text-gray-700 leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Internal Links */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-2xl font-black tracking-tighter mb-6">Also See: Related MandiGrow Pages</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { href: '/commission-agent-software', label: 'Commission Agent Software' },
                        { href: '/mandi-billing', label: 'Mandi Billing Software' },
                        { href: '/fruit-vegetable-billing', label: 'Fruit & Vegetable Billing' },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:border-emerald-400 transition font-bold text-emerald-700 text-center">
                            {label} →
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    GST Compliance Without the Headache. Free for 14 Days.
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    No credit card. No setup fees. Your CA will love the reports. Your mandi will love the speed.
                </p>
                <Link href="/subscribe" className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg">
                    Start Free 14-Day Trial →
                </Link>
            </section>

            <LandingFooter />
        </main>
    );
}
