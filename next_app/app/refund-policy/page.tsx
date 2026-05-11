import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { LandingFooter } from '@/components/layout/LandingFooter'

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | MandiGrow',
    description:
        'Refund and Cancellation Policy for MandiGrow — SaaS subscription rules, refund eligibility, and cancellation procedures for Indian mandi traders.',
    alternates: { canonical: 'https://www.mandigrow.com/refund-policy' },
}

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-[#dce7c8] text-gray-900 font-sans overflow-x-hidden">
            {/* Header */}
            <div className="fixed top-0 w-full z-50 flex flex-col">
                <div className="bg-emerald-900 text-emerald-50 text-[10px] sm:text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 tracking-wide w-full border-b border-emerald-800/50 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>MandiGrow — Live</span>
                </div>
                <nav className="w-full border-b border-[#c8d6b0] bg-[#dce7c8]/90 backdrop-blur-md relative">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white font-black text-xl">M</div>
                            <span className="text-xl font-bold tracking-tighter text-gray-900">MandiGrow</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                            <Link href="/#features" className="hover:text-emerald-800 transition-colors">Features</Link>
                            <Link href="/#solutions" className="hover:text-emerald-800 transition-colors">Solutions</Link>
                            <Link href="/subscribe" className="hover:text-emerald-800 transition-colors font-bold text-emerald-800">Subscription &amp; Billing</Link>
                            <Link href="/#compliance" className="hover:text-emerald-800 transition-colors">Compliance</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-emerald-800 transition-colors">Sign In</Link>
                            <Link href="/login" className="hidden md:flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-800 transition-all hover:scale-105">
                                Get Started Free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Hero */}
            <main className="relative pt-40 pb-16 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white/60 text-xs font-bold text-emerald-800 mb-6 backdrop-blur-sm shadow-sm">
                        Legal · Effective 1 April 2026
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-4">Refund &amp; Cancellation Policy</h1>
                    <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">
                        Clear, fair, and straightforward rules regarding your MandiGrow SaaS subscription payments.
                    </p>
                </div>

                <article className="bg-white border border-emerald-100 rounded-[32px] shadow-sm p-8 md:p-12 max-w-none">
                    <p className="text-sm text-gray-500 mb-8"><strong>Effective Date:</strong> 1 April 2026 &nbsp;·&nbsp; <strong>Last Updated:</strong> 11 May 2026</p>

                    <h2 className="text-2xl font-black text-gray-900 mt-0 mb-3">1. General Subscription Rule</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        MandiGrow is a Business-to-Business (B2B) Software-as-a-Service (SaaS) platform. Because you receive instant, full access to our proprietary tools, reporting, and features upon payment, our general policy is that <strong>all payments are non-refundable</strong> unless explicitly stated otherwise in this policy.
                    </p>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">2. Monthly Subscriptions</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Payments for monthly subscriptions are strictly non-refundable. You may cancel your monthly subscription at any time, and you will retain access to your MandiGrow workspace until the end of your currently paid monthly billing cycle. We do not provide prorated refunds or credits for partial months of service.
                    </p>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">3. Annual Subscriptions (7-Day Guarantee)</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        We understand that committing to an annual plan is a big decision for your business. Therefore, we offer a <strong>7-Day Money-Back Guarantee</strong> exclusively on your <strong>first</strong> annual subscription purchase.
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                        <li>If you decide MandiGrow is not right for you within the first seven (7) days of your initial annual subscription payment, you may request a full refund.</li>
                        <li>Refund requests must be submitted in writing to our billing team within the 7-day window.</li>
                        <li>This guarantee applies only to new, first-time annual subscriptions and does not apply to annual renewals.</li>
                        <li>After the 7-day window has passed, the annual subscription fee becomes completely non-refundable, and you may only cancel the upcoming renewal.</li>
                    </ul>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">4. Cancellations &amp; Renewals</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Your MandiGrow subscription will automatically renew at the end of each billing cycle (monthly or annually) unless you cancel. It is your responsibility to cancel your subscription prior to the renewal date to avoid future charges. You can cancel directly from your account settings or by contacting support. <strong>Forgetting to cancel does not entitle you to a refund for the subsequent billing cycle.</strong>
                    </p>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">5. Exceptions &amp; Special Circumstances</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        We may process refunds or credit notes at our sole discretion in the following limited situations:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                        <li><strong>Duplicate Charges:</strong> If a technical error causes you to be charged multiple times for the same transaction.</li>
                        <li><strong>Prolonged Outages:</strong> If MandiGrow suffers a severe, prolonged system-wide failure that prevents access to the core service for an extended period, violating our Terms of Service SLAs.</li>
                    </ul>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">6. Non-Refundable Items</h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        The following purchases and fees are strictly non-refundable under any circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                        <li>One-time setup, onboarding, or data migration fees.</li>
                        <li>Custom development or custom integration charges.</li>
                        <li>Third-party gateway fees, SMS gateway fees, or hardware costs.</li>
                        <li>Taxes remitted to the government (such as GST).</li>
                    </ul>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">7. How to Request a Refund</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        If you believe you are eligible for a refund under this policy, please email us at <a href="mailto:billing@mandigrow.com" className="text-emerald-700 font-bold hover:underline">billing@mandigrow.com</a> with your account details, transaction receipt, and the reason for the request.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Approved refunds are processed to the original payment method (Credit Card, UPI, Bank Account) within <strong>7-10 business days</strong>, depending on your bank's processing times. We cannot issue refunds to alternate payment methods.
                    </p>

                    <h2 className="text-2xl font-black text-gray-900 mt-8 mb-3">8. Changes to this Policy</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        MandiGrow reserves the right to modify this Refund Policy at any time. Any changes will be effective immediately upon posting to this page. Subscriptions active at the time of a policy change will be governed by the policy in effect at the start of their current billing cycle.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-0 mt-8">
                        <p className="text-gray-800 font-bold mb-1">Have billing questions?</p>
                        <p className="text-gray-700 text-sm">
                            Reach out to our finance team at <a href="mailto:billing@mandigrow.com" className="text-emerald-700 font-bold hover:underline">billing@mandigrow.com</a> or message us from the in-app support portal.
                        </p>
                    </div>
                </article>
            </main>

            </main>

            <LandingFooter />
        </div>
    )
}
