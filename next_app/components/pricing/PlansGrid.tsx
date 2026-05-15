'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { callApi } from '@/lib/frappeClient';
import { Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PlansGridProps {
    isSubscribePage?: boolean;
}

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
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 rounded-3xl bg-transparent">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-6" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Pricing Plans...</p>
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
                <Link href="/contact">
                    <Button variant="outline" className="px-8 py-6 rounded-xl border-emerald-200 font-bold hover:bg-emerald-50">
                        Contact Support
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-2 p-1.5 bg-white border border-emerald-100 rounded-full shadow-sm">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            billing === 'monthly' ? "bg-emerald-700 text-white shadow-md" : "text-gray-500 hover:text-emerald-700"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                            billing === 'yearly' ? "bg-emerald-700 text-white shadow-md" : "text-gray-500 hover:text-emerald-700"
                        )}
                    >
                        Yearly
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-black",
                            billing === 'yearly' ? "bg-emerald-800 text-emerald-200" : "bg-emerald-100 text-emerald-700"
                        )}>
                            SAVE ~20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-8 items-start">
                {plans.map((plan) => {
                    const planKey = (plan.plan_name || plan.name || '').toLowerCase();
                    const highlight = planKey.includes('professional') || planKey.includes('standard') || plan.features?.tag?.toLowerCase() === 'most popular';
                    const badge = plan.features?.tag;
                    
                    const price = billing === 'monthly' ? plan.price_monthly : Math.round(plan.price_yearly / 12);
                    const formattedPrice = formatPrice(price);
                    
                    const features = Array.isArray(plan.features?.feature_list) 
                        ? plan.features.feature_list 
                        : (plan.description?.split('\n') || []);

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                "rounded-3xl p-8 transition-all duration-300",
                                highlight
                                    ? 'bg-emerald-900 text-white shadow-2xl scale-105 ring-2 ring-emerald-500'
                                    : 'bg-white border border-emerald-100 shadow-sm hover:shadow-md'
                            )}
                        >
                            {badge && (
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider mb-4">
                                    {badge}
                                </div>
                            )}
                            <h2 className={cn("text-2xl font-black mb-2", highlight ? 'text-white' : 'text-gray-900')}>
                                {plan.display_name}
                            </h2>
                            <p className={cn("text-sm mb-6 h-10", highlight ? 'text-emerald-200' : 'text-gray-500')}>
                                {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className={cn("text-5xl font-black tracking-tighter", highlight ? 'text-white' : 'text-gray-900')}>
                                    {formattedPrice}
                                </span>
                                {price > 0 && (
                                    <span className={cn("font-bold", highlight ? 'text-emerald-300' : 'text-gray-500')}>
                                        /month
                                    </span>
                                )}
                            </div>
                            
                            {billing === 'yearly' && price > 0 && (
                                <p className={cn("text-sm font-bold mb-4 -mt-4", highlight ? "text-emerald-300" : "text-emerald-600")}>
                                    Billed {formatPrice(plan.price_yearly)} annually
                                </p>
                            )}

                            <Link
                                href={isSubscribePage ? (price === 0 ? "/contact" : `/checkout?plan_id=${plan.name}&cycle=${billing}`) : (price === 0 ? "/contact" : "/subscribe")}
                                className={cn(
                                    "block text-center py-3 rounded-xl font-black mb-8 transition-all",
                                    highlight
                                        ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                )}
                            >
                                {price === 0 ? 'Contact Sales' : (isSubscribePage ? 'Select Plan' : 'Start Free Trial')}
                            </Link>

                            <ul className="space-y-3">
                                {features.map((feat: string, index: number) => (
                                    <li key={index} className={cn("flex items-start gap-3 text-sm font-medium", highlight ? 'text-emerald-100' : 'text-gray-700')}>
                                        <span className={cn("flex-shrink-0 mt-0.5", highlight ? 'text-emerald-400' : 'text-emerald-600')}>✓</span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
