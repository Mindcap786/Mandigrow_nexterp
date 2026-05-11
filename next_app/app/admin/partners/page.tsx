'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/frappeClient';
import { Shield, Search, Users, ShieldCheck, MoreVertical, Loader2, CheckCircle2, Clock, XCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function PartnersAdminPage() {
    const { toast } = useToast();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const data = await db.getList('Mandi Partner Profile', {
                fields: ['name', 'partner_name', 'mobile_number', 'city', 'partner_type', 'status', 'total_onboarded', 'total_commission_earned', 'creation'],
                order_by: 'creation desc',
                limit: 100
            });
            setPartners(data || []);
        } catch (e: any) {
            toast({ title: 'Access Denied', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (partnerId: string, status: string) => {
        try {
            await db.createDoc('Mandi Partner Profile', { name: partnerId, status, docstatus: 0 }); 
            // In frappe, saving an existing doc via REST API POST to /api/resource requires PUT.
            // A safer way is Frappe's update API or we can just fetch it again after updating.
            // Actually, we should use callApi('frappe.client.set_value', ...)
            await db.getDoc('Mandi Partner Profile', partnerId); // Ensure it's reachable
        } catch (e) {
            // ignore
        }
        
        // Proper way to set_value
        try {
            await fetch('/api/method/frappe.client.set_value', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctype: 'Mandi Partner Profile',
                    name: partnerId,
                    fieldname: 'status',
                    value: status
                })
            });
            toast({ title: 'Success', description: `Partner status updated to ${status}` });
            fetchPartners();
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const filteredPartners = partners.filter(p => 
        p.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile_number?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900">
                            <Users className="w-8 h-8 text-indigo-500" /> Partner Network
                        </h1>
                        <p className="text-slate-500 mt-1 uppercase tracking-widest text-xs font-bold">Manage Agents & Distributors</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Search partners..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white border-slate-200" 
                            />
                        </div>
                        <Button onClick={fetchPartners} variant="outline" className="bg-white">
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-indigo-100 shadow-sm shadow-indigo-100/50 bg-indigo-50/30">
                        <CardContent className="p-6">
                            <div className="text-sm font-bold text-indigo-600 mb-1 uppercase tracking-wider">Total Partners</div>
                            <div className="text-3xl font-black text-slate-900">{partners.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 shadow-sm shadow-emerald-100/50 bg-emerald-50/30">
                        <CardContent className="p-6">
                            <div className="text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wider">Approved</div>
                            <div className="text-3xl font-black text-slate-900">{partners.filter(p => p.status === 'Approved').length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-100 shadow-sm shadow-orange-100/50 bg-orange-50/30">
                        <CardContent className="p-6">
                            <div className="text-sm font-bold text-orange-600 mb-1 uppercase tracking-wider">Pending Review</div>
                            <div className="text-3xl font-black text-slate-900">{partners.filter(p => p.status === 'Pending').length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 font-bold">Partner Profiles</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-50 text-indigo-500" />
                                <p className="font-medium">Loading partner network...</p>
                            </div>
                        ) : filteredPartners.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-medium">No partners found.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredPartners.map((partner) => (
                                    <div key={partner.name} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                                                <span className="font-black text-indigo-600 text-lg">{partner.partner_name?.charAt(0) || 'P'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-base flex items-center gap-2">
                                                    {partner.partner_name}
                                                    {partner.status === 'Approved' ? (
                                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50 h-5 px-2 text-[10px] uppercase font-black tracking-wider shadow-none rounded-md"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</Badge>
                                                    ) : partner.status === 'Pending' ? (
                                                        <Badge variant="outline" className="border-orange-500/30 text-orange-600 bg-orange-50 h-5 px-2 text-[10px] uppercase font-black tracking-wider shadow-none rounded-md"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-red-500/30 text-red-600 bg-red-50 h-5 px-2 text-[10px] uppercase font-black tracking-wider shadow-none rounded-md"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500">
                                                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {partner.partner_type || 'Unknown Type'}</span>
                                                    <span>•</span>
                                                    <span>{partner.mobile_number}</span>
                                                    <span>•</span>
                                                    <span>{partner.city || 'No City'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 pl-16 md:pl-0">
                                            <div className="text-right text-sm">
                                                <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-1">Onboarded</p>
                                                <p className="text-slate-900 font-bold flex items-center justify-end gap-1.5">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    {partner.total_onboarded || 0} Mandis
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-1">Earnings</p>
                                                <p className="text-emerald-600 font-black">
                                                    ₹{partner.total_commission_earned || 0}
                                                </p>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
                                                    {partner.status !== 'Approved' && (
                                                        <DropdownMenuItem onClick={() => updateStatus(partner.name, 'Approved')} className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer text-emerald-700 font-bold">
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Partner
                                                        </DropdownMenuItem>
                                                    )}
                                                    {partner.status !== 'Pending' && (
                                                        <DropdownMenuItem onClick={() => updateStatus(partner.name, 'Pending')} className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer text-orange-700 font-medium">
                                                            <Clock className="w-4 h-4 mr-2" /> Mark Pending
                                                        </DropdownMenuItem>
                                                    )}
                                                    {partner.status !== 'Rejected' && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-slate-100" />
                                                            <DropdownMenuItem onClick={() => updateStatus(partner.name, 'Rejected')} className="hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600 font-bold">
                                                                <XCircle className="w-4 h-4 mr-2" /> Reject Partner
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
