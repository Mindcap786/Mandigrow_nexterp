'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { callApi } from '@/lib/frappeClient';
import { Loader2, Info, Check, Zap, TrendingUp, Building2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlansGridProps {
    isSubscribePage?: boolean;
}

const PLAN_ICONS: Record<string, any> = {
    Zap, TrendingUp, Building2, Star
};

export function PlansGrid({ isSubscribePage = false }: PlansGridProps) {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data: any[] = await callApi('mandigrow.api.get_plans') || [];
            const HIDDEN_KEYS = ['vip', 'vip_plan', 'internal', 'custom'];
            const visiblePlans = data.filter((plan: any) => {
                const key = (plan.plan_name || plan.name || '').toLowerCase();
                const isHidden = HIDDEN_KEYS.some(h => key === h || key.startsWith(h + '_'));
                return !isHidden || plan.features?.show_on_homepage === true;
            });
            setPlans(visiblePlans);
        } catch (err) {
            console.error('Error fetching plans:', err);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        if (price === 0) return 'Custom';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-6" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Loading Pricing Plans...
                </p>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-emerald-100 shadow-sm text-center px-6">
                <Info className="w-10 h-10 text-emerald-300 mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Pricing Setup Required</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                    No plans have been published yet. Please seed the plan catalogue from the Admin Portal.
                </p>
                <Link
                    href="/contact"
                    className="px-8 py-3 rounded-xl border border-emerald-200 font-bold hover:bg-emerald-50 transition-all text-emerald-700"
                >
                    Contact Support
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-1 p-1.5 bg-white border border-emerald-100 rounded-full shadow-sm">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={cn(
                            'px-6 py-2 rounded-full text-sm font-bold transition-all',
                            billing === 'monthly'
                                ? 'bg-emerald-700 text-white shadow-md'
                                : 'text-gray-500 hover:text-emerald-700'
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={cn(
                            'px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2',
                            billing === 'yearly'
                                ? 'bg-emerald-700 text-white shadow-md'
                                : 'text-gray-500 hover:text-emerald-700'
                        )}
                    >
                        Yearly
                        <span
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full font-black',
                                billing === 'yearly'
                                    ? 'bg-emerald-800 text-emerald-200'
                                    : 'bg-emerald-100 text-emerald-700'
                            )}
                        >
                            SAVE ~20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid — equal-height cards */}
            <div className={cn(
                'grid gap-6',
                plans.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' :
                plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
                'md:grid-cols-3'
            )}>
                {plans.map((plan) => {
                    const planKey = (plan.plan_name || plan.name || '').toLowerCase();
                    const highlight =
                        planKey.includes('professional') ||
                        planKey.includes('standard') ||
                        plan.features?.tag?.toLowerCase() === 'most popular';

                    const badge = plan.features?.tag;
                    const price =
                        billing === 'monthly'
                            ? plan.price_monthly
                            : Math.round(plan.price_yearly / 12);
                    const formattedPrice = formatPrice(price);

                    // Feature list — only from admin-managed feature_list, never from description
                    const features: string[] = Array.isArray(plan.features?.feature_list)
                        ? plan.features.feature_list.filter((f: string) => f?.trim())
                        : [];

                    // Icon
                    const iconName = plan.features?.icon || (
                        planKey.includes('enterprise') ? 'Building2' :
                        planKey.includes('standard') || planKey.includes('professional') ? 'TrendingUp' :
                        'Zap'
                    );
                    const PlanIcon = PLAN_ICONS[iconName] || Zap;

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                // flex-col so content stacks and CTA stays at bottom
                                'rounded-3xl p-8 flex flex-col transition-all duration-300 relative',
                                highlight
                                    ? 'bg-emerald-900 text-white shadow-2xl ring-2 ring-emerald-500 scale-[1.02]'
                                    : 'bg-white border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200'
                            )}
                        >
                            {/* Badge */}
                            {badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-4 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap">
                                    {badge}
                                </div>
                            )}

                            {/* Plan header */}
                            <div className="flex items-center gap-3 mb-3 mt-2">
                                <div className={cn(
                                    'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0',
                                    highlight ? 'bg-emerald-700' : 'bg-emerald-50'
                                )}>
                                    <PlanIcon className={cn('w-5 h-5', highlight ? 'text-white' : 'text-emerald-700')} />
                                </div>
                                <h2 className={cn('text-xl font-black', highlight ? 'text-white' : 'text-gray-900')}>
                                    {plan.display_name}
                                </h2>
                            </div>

                            {/* Description */}
                            <p className={cn('text-sm mb-6 min-h-[40px]', highlight ? 'text-emerald-200' : 'text-gray-500')}>
                                {plan.description || ''}
                            </p>

                            {/* Price */}
                            <div className="mb-2">
                                <div className="flex items-baseline gap-1">
                                    <span className={cn('text-5xl font-black tracking-tighter', highlight ? 'text-white' : 'text-gray-900')}>
                                        {formattedPrice}
                                    </span>
                                    {price > 0 && (
                                        <span className={cn('text-sm font-bold', highlight ? 'text-emerald-300' : 'text-gray-400')}>
                                            /mo
                                        </span>
                                    )}
                                </div>
                                {billing === 'yearly' && price > 0 && (
                                    <p className={cn('text-xs font-bold mt-1', highlight ? 'text-emerald-300' : 'text-emerald-600')}>
                                        Billed {formatPrice(plan.price_yearly)} annually
                                    </p>
                                )}
                                {billing === 'monthly' && (
                                    <p className={cn('text-xs font-medium mt-1', highlight ? 'text-emerald-400' : 'text-gray-400')}>
                                        {price > 0 ? 'per month · cancel anytime' : 'Contact us for pricing'}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className={cn('my-6 border-t', highlight ? 'border-emerald-700' : 'border-emerald-100')} />

                            {/* Feature list — grows to fill remaining space */}
                            <ul className="space-y-3 flex-1">
                                {features.length > 0 ? (
                                    features.map((feat: string, index: number) => (
                                        <li key={index} className={cn('flex items-start gap-3 text-sm', highlight ? 'text-emerald-100' : 'text-gray-700')}>
                                            <span className={cn(
                                                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
                                                highlight ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-700'
                                            )}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </span>
                                            <span className="leading-snug">{feat}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className={cn('text-xs italic', highlight ? 'text-emerald-400' : 'text-gray-400')}>
                                        Feature list coming soon.
                                    </li>
                                )}
                            </ul>

                            {/* CTA — always at the bottom */}
                            <div className="mt-8">
                                <Link
                                    href={
                                        isSubscribePage
                                            ? price === 0
                                                ? '/contact'
                                                : `/checkout?plan_id=${encodeURIComponent(plan.plan_name || plan.name)}&cycle=${billing}`
                                            : price === 0
                                            ? '/contact'
                                            : '/subscribe'
                                    }
                                    className={cn(
                                        'block text-center py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95',
                                        highlight
                                            ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg'
                                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    )}
                                >
                                    {price === 0
                                        ? 'Contact Sales'
                                        : isSubscribePage
                                        ? 'Select Plan →'
                                        : 'Start Free Trial →'}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
