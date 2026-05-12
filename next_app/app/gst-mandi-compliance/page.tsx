import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'GST Software for Commission Agents & Mandi Traders — Mandi Tax (Cess) Automation | MandiGrow',
    description:
        'MandiGrow automates GST filing, Mandi Tax (Cess), and e-invoicing for fruit & vegetable commission agents and wholesale traders across India. GSTR-1, GSTR-3B one-click export. Free trial.',
    keywords: [
        'GST software for commission agent',
        'mandi tax software',
        'mandi cess software',
        'GST billing mandi India',
        'GSTR-1 mandi trader',
        'e-invoicing mandi software',
        'GST return commission agent India',
        'fruit vegetable GST software',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/gst-mandi-compliance' },
    openGraph: {
        title: 'GST Software for Commission Agents — Mandi Tax (Cess) Automation | MandiGrow',
        description:
            'Automate GST filing, Mandi Cess, and e-invoicing for fruit & vegetable commission agents. GSTR-1 and GSTR-3B one-click export.',
        url: 'https://www.mandigrow.com/gst-mandi-compliance',
        type: 'website',
    },
};

const FAQ = [
    {
        q: 'Do commission agents need to file GST?',
        a: 'Yes. Commission agents who earn commission on the sale of agricultural produce must register for GST if their aggregate turnover exceeds the threshold. MandiGrow helps you track taxable commission income and generate GSTR-1 and GSTR-3B data automatically.',
    },
    {
        q: 'What is Mandi Tax (Cess) and does MandiGrow handle it?',
        a: 'Mandi Tax or Cess is a levy charged by state Agricultural Produce Market Committees (APMCs) on the value of agricultural produce sold at the mandi. MandiGrow auto-calculates Mandi Cess per transaction and posts it to the correct ledger, state-wise.',
    },
    {
        q: 'Can MandiGrow generate e-invoices for mandi traders?',
        a: 'Yes. MandiGrow is e-invoicing ready. It generates IRN (Invoice Reference Number) compliant invoices for B2B transactions above the GST e-invoicing threshold, directly from your sale entry.',
    },
    {
        q: 'Is agricultural produce exempt from GST in India?',
        a: 'Raw, unprocessed agricultural produce is generally GST-exempt. However, the commission earned by agents, transport charges, and processed goods may attract GST. MandiGrow\'s compliance engine correctly identifies taxable vs. exempt transactions.',
    },
    {
        q: 'How does MandiGrow help me file GSTR-1?',
        a: 'Every sale you record in MandiGrow is tagged with the correct GST rate, HSN code, and party GSTIN. At the end of the month, you export a ready-to-upload GSTR-1 JSON file or Excel sheet — no manual data entry required.',
    },
];

export default function GstMandiCompliancePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
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
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'GST Mandi Compliance',
                                item: 'https://www.mandigrow.com/gst-mandi-compliance',
                            },
                        ],
                    }),
                }}
            />

            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    GST & Mandi Tax Compliance · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Automated GST &amp; Mandi Tax Compliance for Fruit &amp; Vegetable Traders
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mb-8">
                    GST software built specifically for Indian mandi commission agents and wholesale traders.
                    Auto-calculate Mandi Tax (Cess), generate GSTR-1, GSTR-3B and e-invoices without a
                    separate CA or Excel sheet. Hindi and English. Mobile-ready.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <Link
                        href="/subscribe"
                        className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition"
                    >
                        Start Free Trial →
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition"
                    >
                        Book a Demo
                    </Link>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                    GST Filing for Commission Agents — Built Into Every Transaction
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    Filing GST as a mandi commission agent is complex — agricultural produce is exempt, but
                    your commission income is taxable. Mandi Cess varies by state and commodity. Generic
                    accounting tools leave you with manual calculations, wrong HSN codes, and last-minute
                    panic before every filing deadline.
                </p>
                <p className="text-lg text-gray-700">
                    MandiGrow is different. Every sale, purchase, and commission entry is tagged with the
                    correct GST rate, HSN code, and party GSTIN at the point of entry. Your GSTR-1 data
                    is always ready — no month-end scramble.
                </p>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    Mandi Tax (Cess) &amp; e-Invoicing Automation
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        ['GSTR-1 one-click export', 'Export GSTR-1 JSON or Excel at month-end. Directly upload to GST portal.'],
                        ['GSTR-3B auto-summary', 'Monthly summary of output tax, input credit, and Mandi Cess — ready in seconds.'],
                        ['Mandi Tax (Cess) auto-calculation', 'State-wise APMC Cess calculated and posted automatically on every transaction.'],
                        ['e-Invoicing (IRN) ready', 'Generate IRN-compliant invoices for eligible B2B transactions without extra software.'],
                        ['HSN code mapping', 'Every commodity pre-mapped to the correct HSN code. Customize per state rules.'],
                        ['Audit trail for inspectors', 'Full immutable transaction log for government auditors and tax inspectors.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm">
                            <h3 className="text-xl font-black mb-2">{title}</h3>
                            <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-emerald-100">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10">
                    GST Software for Mandi Traders — FAQ
                </h2>
                <div className="space-y-6">
                    {FAQ.map((f) => (
                        <div key={f.q}>
                            <h3 className="text-lg font-black mb-2">{f.q}</h3>
                            <p className="text-gray-700">{f.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    Never Miss a GST Deadline Again
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    14-day free trial. No credit card. Live GST demo in Hindi or English.
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg"
                >
                    Start Free Trial →
                </Link>
            </section>
        </main>
    );
}
