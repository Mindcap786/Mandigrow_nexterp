'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/frappeClient';
import { CreditCard, Search, Loader2, CheckCircle2, Clock, IndianRupee, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function PayoutsAdminPage() {
    const { toast } = useToast();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const data = await db.getList('Mandi Partner Payout', {
                fields: ['name', 'partner', 'organization', 'payout_month', 'payout_year', 'subscription_amount', 'commission_amount', 'status', 'payment_date', 'transaction_reference', 'creation'],
                order_by: 'creation desc',
                limit: 100
            });
            setPayouts(data || []);
        } catch (e: any) {
            toast({ title: 'Access Denied', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (payoutId: string) => {
        try {
            await fetch('/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctype: 'Mandi Partner Payout',
                    name: payoutId,
                    fieldname: 'status',
                    value: 'Paid'
                })
            });
            toast({ title: 'Success', description: 'Payout marked as Paid' });
            fetchPayouts();
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const filteredPayouts = payouts.filter(p => 
        p.partner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payout_month?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalUnpaid = payouts.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + (p.commission_amount || 0), 0);
    const totalPaid = payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.commission_amount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900">
                            <CreditCard className="w-8 h-8 text-indigo-500" /> Commission Payouts
                        </h1>
                        <p className="text-slate-500 mt-1 uppercase tracking-widest text-xs font-bold">Settle Partner Earnings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Search partner, mandi, or month..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white border-slate-200" 
                            />
                        </div>
                        <Button onClick={fetchPayouts} variant="outline" className="bg-white">
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="border-orange-100 shadow-sm shadow-orange-100/50 bg-orange-50/30">
                        <CardContent className="p-6">
                            <div className="text-sm font-bold text-orange-600 mb-1 uppercase tracking-wider">Total Pending Payouts</div>
                            <div className="text-3xl font-black text-slate-900">₹{totalUnpaid.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 shadow-sm shadow-emerald-100/50 bg-emerald-50/30">
                        <CardContent className="p-6">
                            <div className="text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wider">Total Paid (Lifetime)</div>
                            <div className="text-3xl font-black text-slate-900">₹{totalPaid.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 font-bold">Payout Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-50 text-indigo-500" />
                                <p className="font-medium">Loading ledger...</p>
                            </div>
                        ) : filteredPayouts.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-medium">No payouts recorded yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredPayouts.map((payout) => (
                                    <div key={payout.name} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                    {payout.partner}
                                                    {payout.status === 'Paid' ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50 h-5 px-2 text-[10px] uppercase font-black tracking-wider shadow-none rounded-md"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-orange-500/30 text-orange-600 bg-orange-50 h-5 px-2 text-[10px] uppercase font-black tracking-wider shadow-none rounded-md"><Clock className="w-3 h-3 mr-1"/> Unpaid</Badge>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500">
                                                    <span className="font-bold">{payout.organization}</span>
                                                    <span>•</span>
                                                    <span>{payout.payout_month} {payout.payout_year}</span>
                                                    {payout.transaction_reference && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Ref: {payout.transaction_reference}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 pl-16 md:pl-0">
                                            <div className="text-right text-sm">
                                                <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-1">Mandi Paid</p>
                                                <p className="text-slate-900 font-bold">
                                                    ₹{payout.subscription_amount || 0}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-1">Commission</p>
                                                <p className="text-indigo-600 font-black text-lg">
                                                    ₹{payout.commission_amount || 0}
                                                </p>
                                            </div>

                                            {payout.status === 'Unpaid' ? (
                                                <Button 
                                                    onClick={() => markAsPaid(payout.name)}
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 shadow-sm shadow-emerald-200"
                                                >
                                                    <IndianRupee className="w-4 h-4 mr-1.5" /> Settle
                                                </Button>
                                            ) : (
                                                <div className="w-24 text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Settled
                                                </div>
                                            )}
                                        </div>
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
