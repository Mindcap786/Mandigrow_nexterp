import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'MandiGrow Features: Mandi ERP Software with GST Billing, Auto Commission & Khata | India',
    description:
        'MandiGrow software features: auto commission calculation, GST & e-invoicing, real-time mandi khata, APMC billing, gate entry, lot management, 7 regional languages, Android + web. Try free.',
    keywords: [
        'mandi ERP features',
        'mandi commission software',
        'APMC billing software features',
        'mandi farmer ledger software',
        'commission agent software India',
        'mandi daybook software',
        'lot tracking mandi',
        'mandi GST billing',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/features' },
    openGraph: {
        title: 'MandiGrow Features — Complete Mandi ERP for Indian Agricultural Markets',
        description:
            'Commission management, farmer & trader ledger, APMC billing, GST invoicing, lot tracking, daybook — all in one mandi ERP.',
        url: 'https://www.mandigrow.com/features',
        type: 'website',
    },
};

const FEATURES = [
    {
        id: 'auto-commission',
        icon: '💰',
        title: 'Auto Commission Calculation',
        description:
            'Configure commission rates once — per party or per commodity. MandiGrow calculates commission, market fee, hamali and palledari automatically on every single sale. Zero manual entry. Zero errors.',
        detail:
            'Supports percentage-based and flat-rate commission. Handles split commission between multiple agents. Generates commission statements by party and date range in one click.',
    },
    {
        id: 'mandi-khata',
        icon: '📒',
        title: 'Real-Time Farmer & Trader Ledger (Khata)',
        description:
            'Every farmer and buyer has a live digital khata updated the moment a transaction posts. No more end-of-day reconciliation or morning disputes.',
        detail:
            'View outstanding balances, advances, part payments and credit notes for any party at any time. Share WhatsApp-ready PDF statements directly from the app.',
    },
    {
        id: 'repack-uom',
        icon: '📦',
        title: 'Repack & Multi-UOM Conversion',
        description:
            'Stop losing money on loose produce. Instantly convert tractor trolleys to sacks, or bulk sacks to retail bags without losing a single gram of tracking.',
        detail: (
            <>
                100% visibility into shrinkage. No complex &quot;Bill of Materials&quot;. A completely lossless system designed specifically for the fluid reality of the mandi floor.{' '}
                <Link href="/blog/repack-multi-uom-inventory-management-software" className="text-emerald-600 font-bold hover:underline">
                    Read how it stops stock leakage &rarr;
                </Link>
            </>
        ),
    },
    {
        id: 'apmc-billing',
        icon: '🏛️',
        title: 'APMC Billing & Market Levy',
        description:
            'Generate APMC-compliant bills for every sale. Market cess, supervision charges and government levies are computed and reported automatically.',
        detail:
            'Supports all state APMC Acts. Configurable levy rates per commodity and per market. Daily levy summary report ready for submission to the committee.',
    },
    {
        id: 'gst-billing',
        icon: '🧾',
        title: 'GST Billing & E-Invoicing',
        description:
            'MandiGrow generates fully GST-compliant invoices for every transaction. B2B and B2C billing. GSTR-1 and GSTR-3B export in one click.',
        detail:
            'HSN code mapping per item. Automatic IGST/CGST/SGST split based on buyer state. E-invoice ready. Invoice PDF shareable on WhatsApp in seconds.',
    },
    {
        id: 'gate-entry',
        icon: '🌾',
        title: 'Gate Entry & Lot Management',
        description:
            'Record vehicle arrivals at the gate with farmer details, crop, quantity and vehicle number. Assign lot numbers and weights. Track every lot from arrival to settlement.',
        detail:
            'Barcode and QR code support for lot identification. Real-time lot status: pending auction, sold, partially sold, returned. Wastage recording per lot.',
    },
    {
        id: 'hardware-integration',
        icon: '⚖️',
        title: 'Hardware Integrations (Scale & Barcode)',
        description:
            'Connect electronic weighbridges directly to the browser via Web Serial API to capture live weights. Use global barcode scanning for instant lot selection.',
        detail:
            'Eliminates manual entry errors at the gate and POS. No extra drivers needed for supported scales. Instantly speed up high-volume transactions.',
    },
    {
        id: 'daybook',
        icon: '📊',
        title: 'Daily Daybook & Profit Report',
        description:
            'Complete daily daybook with every financial transaction — sales, purchases, payments, receipts. Profit and loss at a glance. No surprises at month end.',
        detail:
            'Filter by date, party, commodity or transaction type. Export to Excel or PDF. Compare daily turnover across weeks and months.',
    },
    {
        id: 'languages',
        icon: '🌐',
        title: '7 Regional Languages',
        description:
            'The entire app — billing, reports, pattis and statements — is available in Hindi, English, Telugu, Tamil, Kannada, Malayalam and Urdu.',
        detail:
            'Switch languages with one tap. Bills and pattis print in the language your farmers and buyers prefer. Staff training is faster when the software speaks their language.',
    },
    {
        id: 'mobile-desktop',
        icon: '📱',
        title: 'Mobile + Desktop (Android & Web)',
        description:
            'Use MandiGrow on Android phones at the mandi gate and on desktop in the office. The same account, the same live data, everywhere.',
        detail:
            'Offline mode available for gate entry and billing when connectivity is poor. Auto-syncs when internet is restored. No data is ever lost.',
    },
    {
        id: 'party-master',
        icon: '👥',
        title: 'Buyer & Farmer Master',
        description:
            'Maintain complete profiles for all farmers and buyers — GSTIN, PAN, bank details, address, party category and credit limits.',
        detail:
            'Import party lists from Excel on day one. Auto-suggest party names during billing. Duplicate detection prevents double entries.',
    },
    {
        id: 'settlement',
        icon: '🏦',
        title: 'Payment & Settlement Management',
        description:
            'Record cash, cheque, UPI and bank transfer payments against any party. Batch-settle multiple farmers in one operation.',
        detail:
            'Cheque clearing management with bounce tracking. UPI reference capture. Bank reconciliation report. Settlement history by party.',
    },
    {
        id: 'inventory',
        icon: '📦',
        title: 'Inventory & Stock Tracking',
        description:
            'Real-time stock position for every commodity. Track arrivals, sales, returns and wastage. Know your exact exposure at any point.',
        detail:
            'Lot-wise and item-wise stock views. Minimum stock alerts. Storage location mapping for large mandis with multiple godowns.',
    },
    {
        id: 'roles',
        icon: '🔒',
        title: 'Multi-User with Role Permissions',
        description:
            'Add unlimited staff with role-based permissions. Billing staff see billing. Accountants see finance. Managers see everything.',
        detail:
            'Granular module-level permissions. Full audit log — every change is attributed to the user who made it. Two-factor authentication available.',
    },
    {
        id: 'crate-management',
        icon: '🛒',
        title: 'Advanced Crate Management',
        description:
            'Auto-track crate deposits, returns, and outstanding balances. Completely eliminate lost crates and supplier disputes.',
        detail:
            'Integrated directly with the party Ledger (Khata). Generates real-time crate reports, aging analytics, and color-coded inventory tracking.',
    },
    {
        id: 'storage-points',
        icon: '🏭',
        title: 'Multi-Godown Storage Points',
        description:
            'Operating out of multiple shops or cold storages? Track inventory and shipments across distinct locations seamlessly.',
        detail:
            'Define unlimited storage points. Transfer stock between godowns with one click. Get location-wise stock reports instantly.',
    },
    {
        id: 'whatsapp-sharing',
        icon: '💬',
        title: 'WhatsApp Patti & Invoice Sharing',
        description:
            'Stop wasting paper. Send professional PDF Pattis, Invoices, and Khata Statements directly to farmers and buyers on WhatsApp.',
        detail:
            'One-click sharing from the Android app or Web dashboard. Builds massive trust with farmers by delivering instant, transparent calculations.',
    },
];

const FAQ = [
    {
        q: 'Does MandiGrow work for grain mandis as well as fruit and vegetable mandis?',
        a: 'Yes. MandiGrow supports any agricultural commodity — wheat, rice, maize, onion, tomato, mango, cotton and more. Commodity-specific commission rates, units and levy structures are all configurable.',
    },
    {
        q: 'Can MandiGrow handle multiple branches or locations?',
        a: 'Yes. You can operate multiple mandi locations under a single MandiGrow account. Each branch has its own data with consolidated reporting at the head office level.',
    },
    {
        q: 'Does MandiGrow replace Tally for mandi accounting?',
        a: "Yes. MandiGrow handles everything Tally does for mandi traders — ledgers, daybook, GST — plus all the mandi-specific features Tally lacks: auto commission, lot tracking, farmer settlements and regional language support.",
    },
    {
        q: 'Is MandiGrow suitable for APMC market committees?',
        a: 'Yes. APMC market committees use MandiGrow to manage gate entries, levy computation, trader registration and daily market reporting. A dedicated APMC admin view is available.',
    },
    {
        q: 'How long does it take to set up MandiGrow?',
        a: 'Most mandis are fully live within one business day. Import your party master and item list, configure commission rates, and start billing. Free onboarding support is included with every plan.',
    },
];

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            {/* JSON-LD: SoftwareApplication */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'MandiGrow',
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Web, Android',
                        description:
                            "India's #1 mandi ERP software for APMC markets, commission agents and agricultural traders. Auto commission, farmer ledger, daybook, GST billing.",
                        offers: {
                            '@type': 'Offer',
                            price: '1999',
                            priceCurrency: 'INR',
                            priceValidUntil: '2027-12-31',
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.9',
                            ratingCount: '1280',
                        },
                    }),
                }}
            />
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
            {/* Breadcrumb */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mandigrow.com' },
                            { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://www.mandigrow.com/features' },
                        ],
                    }),
                }}
            />

            {/* Nav */}
            <nav className="w-full border-b border-emerald-100 bg-[#f7fbf3]/90 backdrop-blur-md sticky top-0 z-50" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                        <Link href="/features" className="text-emerald-800 font-black">Features</Link>
                        <Link href="/pricing" className="hover:text-emerald-800 transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-emerald-800 transition-colors">Blog</Link>

                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-emerald-800">Sign In</Link>
                        <Link href="/subscribe" className="bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all">
                            Free Trial →
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-xs font-bold text-emerald-800 mb-6 shadow-sm">
                    Complete Mandi ERP · Built for India
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Every feature your <span className="text-emerald-700">mandi</span> needs.
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
                    MandiGrow is India's most complete mandi ERP software. Commission management, farmer & trader ledger, APMC billing, GST invoicing, lot tracking, daybook — all in one platform. Built for commission agents, APMC market committees and agricultural wholesalers.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/subscribe" className="px-8 py-4 bg-emerald-700 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-800 transition text-lg">
                        Start Free 14-Day Trial →
                    </Link>
                    <Link href="/pricing" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition text-lg">
                        See Pricing
                    </Link>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="mb-16">
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0b2e14', maxWidth: '800px', margin: '0 auto 12px', textAlign: 'center' }}>
                        MandiGrow Features: Auto Commission, GST Billing, Mandi Khata & APMC Compliance
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#5a6355', textAlign: 'center', marginBottom: '40px' }}>
                        Everything a mandi commission agent, trader, or warehouse manager needs — in one cloud platform.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((f) => (
                        <div key={f.title} id={f.id} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">{f.description}</p>
                            <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{f.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Section */}
            <section className="bg-emerald-950 text-white py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-center">
                        MandiGrow vs Tally — Why Mandis Are Switching
                    </h2>
                    <p className="text-emerald-200 text-center mb-12 max-w-2xl mx-auto text-lg">
                        Tally is great for offices. MandiGrow is built for mandis. Here is the difference that matters.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-emerald-800">
                                    <th className="py-4 pr-8 font-black text-emerald-300 text-sm uppercase tracking-wider">Feature</th>
                                    <th className="py-4 pr-8 font-black text-emerald-300 text-sm uppercase tracking-wider">Tally / Zoho</th>
                                    <th className="py-4 font-black text-emerald-300 text-sm uppercase tracking-wider">MandiGrow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-900">
                                {[
                                    ['Auto commission & hamali', '❌ Manual entry', '✅ Auto on every sale'],
                                    ['Lot & crate tracking', '❌ Not supported', '✅ Built-in'],
                                    ['Hardware Integration', '❌ No native support', '✅ Direct Web Serial & Barcode'],
                                    ['APMC levy reporting', '❌ Manual workaround', '✅ Auto computed'],
                                    ['Farmer patti (WhatsApp)', '❌ Requires export', '✅ One tap share'],
                                    ['Regional languages', '⚠️ Limited', '✅ 7 languages'],
                                    ['Mobile app at gate', '❌ Desktop only', '✅ Android + Web'],
                                    ['Real-time khata', '⚠️ Manual refresh', '✅ Live always'],
                                    ['Built for mandi trade', '❌ Generic tool', '✅ Purpose-built'],
                                ].map(([feat, tally, mg]) => (
                                    <tr key={feat} className="hover:bg-emerald-900/30 transition-colors">
                                        <td className="py-4 pr-8 font-bold text-white">{feat}</td>
                                        <td className="py-4 pr-8 text-emerald-300/70">{tally}</td>
                                        <td className="py-4 font-bold text-emerald-400">{mg}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-6 py-20">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {FAQ.map((f, i) => (
                        <details key={i} className="group bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm open:shadow-md transition" open={i === 0}>
                            <summary className="cursor-pointer text-lg font-black tracking-tight list-none flex items-start justify-between gap-4">
                                <span>{f.q}</span>
                                <span className="text-emerald-600 text-2xl leading-none group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                            </summary>
                            <p className="text-gray-700 mt-4 leading-relaxed">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
                <div className="bg-emerald-700 text-white rounded-3xl p-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                        Ready to run your mandi smarter?
                    </h2>
                    <p className="text-emerald-100 mb-8 text-lg max-w-xl mx-auto">
                        14-day free trial. No credit card. Live demo in Hindi, Telugu or English. Trusted by mandis across India.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/subscribe" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition text-lg">
                            Start Free Trial →
                        </Link>
                        <Link href="/pricing" className="px-8 py-4 bg-emerald-800 text-white font-black rounded-xl hover:bg-emerald-900 transition border border-emerald-500 text-lg">
                            See Pricing
                        </Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
