'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { callApi } from '@/lib/frappeClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2, Link as LinkIcon, Users, IndianRupee, Clock, LogOut, CheckCircle2, AlertTriangle, Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function PartnerDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const partnerId = localStorage.getItem('partner_session_id');
        if (!partnerId) {
            router.push('/partner-portal/login');
            return;
        }
        fetchDashboard(partnerId);
    }, []);

    const fetchDashboard = async (partnerId: string) => {
        setLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.get_partner_dashboard');
            if (res.success) {
                setData(res);
            } else {
                throw new Error("Failed to load dashboard data");
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
            if (err.status === 401 || err.status === 403) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('partner_session_id');
        localStorage.removeItem('partner_name');
        router.push('/partner-portal/login');
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    if (!data) return null;

    const { partner, mandis, payouts } = data;
    const unpaidCommission = payouts.filter((p: any) => p.status === 'Unpaid').reduce((sum: number, p: any) => sum + (p.commission_amount || 0), 0);
    const refLink = `https://www.mandigrow.com/login?mode=signup&ref=${partner.name}`;

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
            
            {/* Header & Link */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Welcome back, {partner.partner_name}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Here is how your network is performing.</p>
                </div>
                <div className="w-full md:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Unique Referral Link</p>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-3 w-full md:w-72 overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => copyLink(refLink)}>
                            <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-sm font-mono text-slate-600 truncate">{refLink}</span>
                        </div>
                        <Button 
                            variant="default" 
                            className={cn("shrink-0", copied ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700")}
                            onClick={() => copyLink(refLink)}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-600 hover:bg-red-50" title="Log out">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 border-none shadow-lg shadow-indigo-200 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-xl"><Users className="w-5 h-5 text-white" /></div>
                        </div>
                        <p className="text-indigo-100 font-black text-[10px] uppercase tracking-widest">Active Mandis</p>
                        <h2 className="text-4xl font-black mt-1">{partner.total_onboarded || 0}</h2>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <IndianRupee className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><CheckCircle2 className="w-5 h-5" /></div>
                        </div>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Lifetime Earnings</p>
                        <h2 className="text-3xl font-black mt-1 text-slate-900">₹{(partner.total_commission_earned || 0).toLocaleString()}</h2>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Clock className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100"><AlertTriangle className="w-5 h-5" /></div>
                        </div>
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Pending Payout</p>
                        <h2 className="text-3xl font-black mt-1 text-slate-900">₹{unpaidCommission.toLocaleString()}</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">To be settled by next month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Onboarded Mandis List */}
                <Card className="lg:col-span-2 bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-500" /> Your Network
                        </CardTitle>
                        <CardDescription>Mandis that signed up using your link.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {mandis.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <Users className="w-10 h-10 mx-auto text-slate-200 mb-4" />
                                <p className="font-medium text-slate-600">No mandis onboarded yet.</p>
                                <p className="text-sm mt-1">Share your referral link to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {mandis.map((m: any) => (
                                    <div key={m.name} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                        <div>
                                            <p className="font-bold text-slate-900 text-base">{m.organization_name}</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Joined {format(new Date(m.creation), 'MMM d, yyyy')}</p>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "border uppercase text-[10px] font-black tracking-widest px-2.5 py-1",
                                            m.subscription_status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
                                        )}>
                                            {m.subscription_status || 'Trial'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Payouts */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-900 font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" /> Payout History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payouts.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No payouts recorded yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {payouts.slice(0, 10).map((p: any) => (
                                    <div key={p.name} className="p-4 hover:bg-slate-50/80 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold text-slate-900">₹{p.commission_amount}</p>
                                            <Badge variant="outline" className={cn(
                                                "border uppercase text-[10px] font-black tracking-widest",
                                                p.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-orange-50 text-orange-600 border-orange-200"
                                            )}>
                                                {p.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {p.payout_month} {p.payout_year}
                                        </p>
                                        {p.status === 'Paid' && p.payment_date && (
                                            <p className="text-[10px] text-slate-400 mt-1">Paid on {format(new Date(p.payment_date), 'MMM d, yyyy')}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
