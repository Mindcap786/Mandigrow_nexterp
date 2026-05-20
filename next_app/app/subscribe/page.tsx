'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { PlansGrid } from '@/components/pricing/PlansGrid';
import { CheckCircle2, Star, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        name: 'Rajesh Patel',
        role: 'Wholesale Grain Trader',
        mandi: 'Ahmedabad APMC',
        avatar: 'RP',
        rating: 5,
        quote: 'MandiGrow ने मेरी पूरी हिसाब-किताब की ज़िंदगी बदल दी। अब हर पट्टी WhatsApp पर 2 सेकंड में जाती है।',
        quoteEn: '"MandiGrow changed my entire accounting life. Every patti goes on WhatsApp in 2 seconds now."',
    },
    {
        name: 'Sunita Devi',
        role: 'Vegetable Commission Agent',
        mandi: 'Azadpur Mandi, Delhi',
        avatar: 'SD',
        rating: 5,
        quote: '"पहले 3 घंटे हिसाब में लगते थे, अब 20 मिनट। बच्चों के साथ वक्त मिलता है।"',
        quoteEn: '"3 hours on accounts became 20 minutes. I get time with my kids now."',
    },
    {
        name: 'Arjun Nair',
        role: 'Fruit & Spice Trader',
        mandi: 'Vashi Market, Mumbai',
        avatar: 'AN',
        rating: 5,
        quote: '"The GST filing used to take 2 days. MandiGrow auto-generates it. Seriously game-changing."',
        quoteEn: '"The GST filing used to take 2 days. MandiGrow auto-generates it. Seriously game-changing."',
    },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: 'Do I need a credit card to start the free trial?',
        a: 'No. The 14-day trial is completely free with zero commitment. You only provide payment details when you choose to upgrade.',
    },
    {
        q: 'Can I switch plans later?',
        a: 'Yes, upgrade or downgrade anytime from your account settings. Changes take effect at the next billing cycle.',
    },
    {
        q: 'Is my data safe?',
        a: 'All data is encrypted at rest and in transit. We use bank-grade SSL and daily backups so you never lose a single patti record.',
    },
    {
        q: 'Does MandiGrow work in Hindi and other regional languages?',
        a: 'Yes. The app supports 7 regional languages including Hindi, Marathi, Gujarati, Punjabi, Telugu, Tamil, and Kannada.',
    },
    {
        q: 'What happens after the 14-day trial?',
        a: 'You\'ll get a reminder before it ends. If you choose not to subscribe, your data is preserved for 30 days so you can export it anytime.',
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-emerald-100 rounded-2xl overflow-hidden bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-gray-900 text-sm hover:bg-emerald-50/40 transition-colors"
            >
                {q}
                <ChevronDown className={`w-4 h-4 text-emerald-600 flex-shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-6 pb-5 text-sm text-gray-600 font-medium leading-relaxed border-t border-emerald-50">
                    <div className="pt-4">{a}</div>
                </div>
            )}
        </div>
    );
}

function PersonalizedBanner() {
    const params = useSearchParams();
    const name = params.get('name');
    const mandi = params.get('mandi');

    if (!name) return null;

    return (
        <div className="max-w-2xl mx-auto px-6 pt-8 -mb-4">
            <div className="flex items-center gap-3 bg-white border border-emerald-200 rounded-2xl px-5 py-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {name.trim().charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-black text-gray-900">
                        Welcome, {name.split(' ')[0]}! 🎉
                    </p>
                    <p className="text-xs font-medium text-gray-500">
                        {mandi ? `Setting up your account for ${mandi}` : 'Your free trial is ready to activate'}
                    </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto flex-shrink-0" />
            </div>
        </div>
    );
}

export default function SubscribePage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900">
            {/* Nav */}
            <nav className="w-full border-b border-emerald-100 bg-[#f7fbf3]/90 backdrop-blur-md sticky top-0 z-50" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                        <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-emerald-800">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* Personalized welcome banner (only shown when coming from lead modal) */}
            <Suspense fallback={null}>
                <PersonalizedBanner />
            </Suspense>

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-xs font-bold text-emerald-800 mb-6 shadow-sm">
                    Simple, Transparent Pricing · No Hidden Fees
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]">
                    Mandi ERP pricing that <span className="text-emerald-700">makes sense.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4 font-medium">
                    Start with a free 14-day trial. No credit card required. Choose the plan that fits your mandi when you&apos;re ready.
                </p>
                <p className="text-sm text-emerald-700 font-bold">Annual plans save 2 months — pay for 10, get 12.</p>
            </section>

            {/* Plans */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <PlansGrid isSubscribePage={true} />
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

            {/* Testimonials */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-black tracking-widest text-emerald-600 uppercase mb-3">From the Mandi Floor</p>
                        <h2 className="text-4xl font-black tracking-tighter text-gray-900">Traders love MandiGrow</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                                {/* Stars */}
                                <div className="flex gap-0.5">
                                    {Array.from({ length: t.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                {/* Quote */}
                                <p className="text-sm font-medium text-gray-700 leading-relaxed flex-1">{t.quote}</p>
                                {/* Author */}
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-xs flex-shrink-0">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{t.name}</p>
                                        <p className="text-xs font-medium text-gray-500">{t.role} · {t.mandi}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-6 bg-[#f0f9f4]">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">Frequently asked questions</h2>
                        <p className="text-sm font-medium text-gray-500">Still unsure? <a href="mailto:support@mandigrow.in" className="text-emerald-600 font-bold hover:underline">Chat with us on WhatsApp</a></p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {FAQS.map((faq) => (
                            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            <LandingFooter />
        </main>
    );
}
