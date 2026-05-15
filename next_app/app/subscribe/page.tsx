import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { PlansGrid } from '@/components/pricing/PlansGrid';

export const metadata: Metadata = {
    title: 'Subscribe | MandiGrow ERP',
    description: 'Select a plan to start your 14-day free trial. Upgrade or downgrade anytime.',
    robots: { index: false, follow: false },
};

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

            <LandingFooter />
        </main>
    );
}
