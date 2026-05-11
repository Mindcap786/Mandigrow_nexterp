import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';

export const metadata: Metadata = {
    title: 'MandiGrow Pricing — Mandi ERP Plans from ₹1,999/mo',
    description:
        'Simple, transparent MandiGrow pricing. Mandi ERP plans for commission agents, APMC markets and multi-branch traders. 14-day free trial. No hidden charges.',
    keywords: [
        'mandi ERP pricing',
        'mandi software cost India',
        'APMC software pricing',
        'commission agent software price',
        'MandiGrow plans',
        'mandi billing software price',
    ],
    alternates: { canonical: 'https://www.mandigrow.com/pricing' },
    openGraph: {
        title: 'MandiGrow Pricing — Mandi ERP Plans from ₹1,999/mo',
        description: 'Simple, transparent pricing for India\'s #1 mandi ERP. Start free for 14 days.',
        url: 'https://www.mandigrow.com/pricing',
        type: 'website',
    },
};

const PLANS = [
    {
        name: 'Starter',
        price: '₹1,999',
        period: '/month',
        description: 'Perfect for single-branch commission agents and small mandis',
        highlight: false,
        features: [
            'Up to 3 users',
            'Unlimited sales & purchase bills',
            'Auto commission calculation',
            'Real-time khata & ledger',
            'GST billing & invoicing',
            'Daily daybook',
            'WhatsApp patti share',
            '7 regional languages',
            'Android mobile app',
            'Email support',
        ],
    },
    {
        name: 'Professional',
        price: '₹3,999',
        period: '/month',
        description: 'For growing mandis with multiple staff and higher volumes',
        highlight: true,
        badge: 'Most Popular',
        features: [
            'Up to 10 users',
            'Everything in Starter',
            'Lot & gate entry management',
            'APMC levy reporting',
            'Farmer batch settlements',
            'Multi-commodity support',
            'Advanced daybook & P&L',
            'Cheque & UPI reconciliation',
            'Stock & inventory tracking',
            'Priority WhatsApp support',
        ],
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large APMC committees, multi-branch operators and state-level traders',
        highlight: false,
        features: [
            'Unlimited users',
            'Everything in Professional',
            'Multi-branch with consolidation',
            'APMC committee admin panel',
            'Custom commission structures',
            'API access for integration',
            'Dedicated onboarding manager',
            'SLA-backed uptime guarantee',
            'On-site training',
            'Dedicated account manager',
        ],
    },
];

const FAQ = [
    {
        q: 'Is there a free trial?',
        a: 'Yes. Every plan starts with a 14-day free trial — full features, no credit card required. You can start billing your first mandi within 30 minutes of signing up.',
    },
    {
        q: 'Can I switch plans later?',
        a: 'Yes. You can upgrade or downgrade your MandiGrow plan at any time from your account settings. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.',
    },
    {
        q: 'Is GST applicable on MandiGrow subscription?',
        a: 'Yes. GST at 18% is applicable on all MandiGrow subscription fees. Your invoice from MandiGrow (MINDT Private Limited) will show the GST amount separately and you can claim ITC on it.',
    },
    {
        q: 'What payment methods are accepted?',
        a: 'We accept UPI, credit/debit card, net banking, and NEFT/RTGS for annual plans. All payments are processed securely through Razorpay.',
    },
    {
        q: 'What happens to my data if I cancel?',
        a: 'Your data remains accessible for 30 days after cancellation. You can export everything — bills, ledgers, party master, reports — in machine-readable format. After 30 days, data is securely deleted as per our Privacy Policy.',
    },
    {
        q: 'Does MandiGrow offer discounts for annual plans?',
        a: 'Yes. Annual plans are priced at 10 months — you get 2 months free compared to monthly billing. Contact our sales team for further discounts on multi-year commitments.',
    },
];

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
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
                            { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://www.mandigrow.com/pricing' },
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
                        <Link href="/features" className="hover:text-emerald-800 transition-colors">Features</Link>
                        <Link href="/pricing" className="text-emerald-800 font-black">Pricing</Link>
                        <Link href="/blog" className="hover:text-emerald-800 transition-colors">Blog</Link>
                        <Link href="/partners" className="hover:text-emerald-800 transition-colors">Partners</Link>
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
            <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-xs font-bold text-emerald-800 mb-6 shadow-sm">
                    Simple, Transparent Pricing · No Hidden Fees
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Mandi ERP pricing that <span className="text-emerald-700">makes sense.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4 font-medium">
                    Start with a free 14-day trial. No credit card required. Choose the plan that fits your mandi when you're ready.
                </p>
                <p className="text-sm text-emerald-700 font-bold">Annual plans save 2 months — pay for 10, get 12.</p>
            </section>

            {/* Plans */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-3xl p-8 ${
                                plan.highlight
                                    ? 'bg-emerald-900 text-white shadow-2xl scale-105 ring-2 ring-emerald-500'
                                    : 'bg-white border border-emerald-100 shadow-sm'
                            }`}
                        >
                            {plan.badge && (
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider mb-4">
                                    {plan.badge}
                                </div>
                            )}
                            <h2 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                            <p className={`text-sm mb-6 ${plan.highlight ? 'text-emerald-200' : 'text-gray-500'}`}>{plan.description}</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={`text-5xl font-black tracking-tighter ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                <span className={`font-bold ${plan.highlight ? 'text-emerald-300' : 'text-gray-500'}`}>{plan.period}</span>
                            </div>
                            <Link
                                href="/subscribe"
                                className={`block text-center py-3 rounded-xl font-black mb-8 transition-all ${
                                    plan.highlight
                                        ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                }`}
                            >
                                {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                            </Link>
                            <ul className="space-y-3">
                                {plan.features.map((feat) => (
                                    <li key={feat} className={`flex items-start gap-3 text-sm font-medium ${plan.highlight ? 'text-emerald-100' : 'text-gray-700'}`}>
                                        <span className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>✓</span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust signals */}
            <section className="bg-emerald-50 border-y border-emerald-100 py-12 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
                    {[
                        { n: '14-day', label: 'Free trial, no card' },
                        { n: '₹0', label: 'Setup or onboarding fee' },
                        { n: '7', label: 'Regional languages' },
                        { n: '24h', label: 'WhatsApp support' },
                    ].map((s) => (
                        <div key={s.label}>
                            <div className="text-4xl font-black text-emerald-700 mb-1">{s.n}</div>
                            <div className="text-sm font-bold text-gray-600">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-6 py-20">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Pricing FAQ</h2>
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
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Start your free trial today.</h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        No credit card. Full features. 14 days free. If you have questions, our team is on WhatsApp.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/subscribe" className="px-8 py-4 bg-white text-emerald-800 font-black rounded-xl hover:bg-emerald-50 transition">
                            Start Free Trial →
                        </Link>
                        <Link href="/contact" className="px-8 py-4 bg-emerald-800 text-white font-black rounded-xl hover:bg-emerald-900 transition border border-emerald-500">
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
