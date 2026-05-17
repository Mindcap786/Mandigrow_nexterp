'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/lib/frappeClient';
import { 
    Users, Search, Loader2, CheckCircle2, Clock, XCircle, 
    Building2, RefreshCw, Copy, ExternalLink, Mail,
    ChevronDown, Shield, Star, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FilterTab = 'All' | 'Pending' | 'Approved' | 'Rejected';

export default function PartnersAdminPage() {
    const { toast } = useToast();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [approvalResult, setApprovalResult] = useState<any | null>(null);

    useEffect(() => { fetchPartners(); }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.get_partner_applications');
            if (res?.success) {
                setPartners(res.data || []);
            } else {
                toast({ title: 'Error', description: res?.error || 'Failed to load partners', variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'Access Error', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (partnerId: string) => {
        setActionLoading(partnerId);
        try {
            const res: any = await callApi('mandigrow.api.approve_partner', { partner_id: partnerId });
            if (res?.success) {
                setApprovalResult(res);
                fetchPartners();
                if (res.email_sent) {
                    toast({ title: '✅ Partner Approved', description: `Email sent to ${res.frappe_user}. Referral: ${res.referral_code}` });
                } else {
                    toast({ 
                        title: '✅ Approved — Email Failed', 
                        description: `SMTP error. Share credentials manually: ${res.temp_password}`,
                        variant: 'destructive'
                    });
                }
            } else {
                toast({ title: 'Error', description: res?.error || 'Approval failed', variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleResendCredentials = async (partner: any) => {
        setActionLoading(partner.name);
        try {
            const res: any = await callApi('mandigrow.api.resend_partner_credentials', { partner_id: partner.name });
            if (res?.success) {
                setApprovalResult(res);
                if (res.email_sent) {
                    toast({ title: '📧 Credentials Sent', description: `New password emailed to ${res.frappe_user}` });
                } else {
                    toast({ 
                        title: '⚠️ Email Failed — Copy Manually', 
                        description: `Password: ${res.temp_password} | Error: ${res.email_error}`,
                        variant: 'destructive'
                    });
                }
            } else {
                toast({ title: 'Error', description: res?.error || 'Resend failed', variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(rejectModal.id);
        try {
            const res: any = await callApi('mandigrow.api.reject_partner', { 
                partner_id: rejectModal.id, 
                reason: rejectReason 
            });
            if (res?.success) {
                toast({ title: 'Partner Rejected', description: 'Rejection email sent to applicant.' });
                setRejectModal(null);
                setRejectReason('');
                fetchPartners();
            } else {
                toast({ title: 'Error', description: res?.error || 'Rejection failed', variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: text });
    };

    const filteredPartners = partners.filter(p => {
        const matchesTab = activeTab === 'All' || p.status === activeTab;
        const matchesSearch =
            p.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.mobile_number?.includes(searchTerm);
        return matchesTab && matchesSearch;
    });

    const counts = {
        All: partners.length,
        Pending: partners.filter(p => p.status === 'Pending').length,
        Approved: partners.filter(p => p.status === 'Approved').length,
        Rejected: partners.filter(p => p.status === 'Rejected').length,
    };

    const TABS: FilterTab[] = ['All', 'Pending', 'Approved', 'Rejected'];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
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
                                placeholder="Search by name, email, city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white border-slate-200"
                            />
                        </div>
                        <Button onClick={fetchPartners} variant="outline" className="bg-white gap-2">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'p-5 rounded-2xl border text-left transition-all',
                                activeTab === tab
                                    ? tab === 'Pending' ? 'bg-orange-50 border-orange-300 shadow-sm'
                                    : tab === 'Approved' ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                                    : tab === 'Rejected' ? 'bg-red-50 border-red-200 shadow-sm'
                                    : 'bg-indigo-50 border-indigo-300 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                            )}
                        >
                            <div className={cn(
                                'text-xs font-black uppercase tracking-wider mb-1',
                                activeTab === tab
                                    ? tab === 'Pending' ? 'text-orange-600'
                                    : tab === 'Approved' ? 'text-emerald-600'
                                    : tab === 'Rejected' ? 'text-red-600'
                                    : 'text-indigo-600'
                                    : 'text-slate-400'
                            )}>
                                {tab}
                            </div>
                            <div className="text-3xl font-black text-slate-900">{counts[tab]}</div>
                        </button>
                    ))}
                </div>

                {/* Approval / Resend Result Banner */}
                {approvalResult && (
                    <div className={`border rounded-2xl p-5 flex flex-col gap-3 ${approvalResult.email_sent === false ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex items-center justify-between">
                            <p className={`font-black flex items-center gap-2 ${approvalResult.email_sent === false ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {approvalResult.email_sent === false 
                                    ? <> ⚠️ Email Failed — Share Credentials Manually </>
                                    : <><CheckCircle2 className="w-5 h-5" /> Partner Approved Successfully</>}
                            </p>
                            <button onClick={() => setApprovalResult(null)} className="text-slate-500 text-xs font-bold uppercase hover:text-slate-700">Dismiss</button>
                        </div>
                        {approvalResult.email_error && (
                            <p className="text-xs text-amber-700 bg-amber-100 rounded-lg p-2 border border-amber-200">
                                <span className="font-black">SMTP Error:</span> {approvalResult.email_error}
                            </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {approvalResult.frappe_user && (
                                <div className="bg-white rounded-xl p-3 border">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Login Email</p>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-slate-700 break-all">{approvalResult.frappe_user}</code>
                                        <button onClick={() => copyToClipboard(approvalResult.frappe_user)} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            )}
                            <div className="bg-white rounded-xl p-3 border">
                                <p className="text-[10px] text-red-600 font-black uppercase mb-1">🔑 Password (share securely)</p>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono font-black text-slate-900">{approvalResult.temp_password}</code>
                                    <button onClick={() => copyToClipboard(approvalResult.temp_password)} className="text-slate-400 hover:text-slate-600"><Copy className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            {approvalResult.referral_code && (
                                <div className="bg-white rounded-xl p-3 border">
                                    <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">Referral Link</p>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono text-xs text-emerald-900 truncate">{approvalResult.referral_link}</code>
                                        <button onClick={() => copyToClipboard(approvalResult.referral_link ?? '')} className="text-emerald-500 hover:text-emerald-700 flex-shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Partner List */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-lg text-slate-800 font-bold">
                            {activeTab === 'All' ? 'All Partner Applications' : `${activeTab} Applications`}
                            <span className="ml-2 text-slate-400 font-normal text-sm">({filteredPartners.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-50 text-indigo-500" />
                                <p className="font-medium">Loading partner applications...</p>
                            </div>
                        ) : filteredPartners.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} applications found.</p>
                                {activeTab === 'Pending' && <p className="text-sm mt-1">New applications from the partner form will appear here.</p>}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredPartners.map((partner) => (
                                    <div key={partner.name} className="p-5 hover:bg-slate-50/80 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                            {/* Left — Identity */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 mt-1">
                                                    <span className="font-black text-indigo-600 text-lg">{partner.partner_name?.charAt(0) || 'P'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-black text-slate-900 text-base">{partner.partner_name}</p>
                                                        {partner.status === 'Approved' && <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50 h-5 px-2 text-[10px] uppercase font-black"><CheckCircle2 className="w-3 h-3 mr-1"/>Approved</Badge>}
                                                        {partner.status === 'Pending'  && <Badge variant="outline" className="border-orange-500/30 text-orange-600 bg-orange-50 h-5 px-2 text-[10px] uppercase font-black"><Clock className="w-3 h-3 mr-1"/>Pending</Badge>}
                                                        {partner.status === 'Rejected' && <Badge variant="outline" className="border-red-500/30 text-red-600 bg-red-50 h-5 px-2 text-[10px] uppercase font-black"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-medium text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600">{partner.partner_type || 'Unknown'}</span>
                                                        <span>{partner.mobile_number}</span>
                                                        {partner.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{partner.email}</span>}
                                                        {partner.city && <span>📍 {partner.city}</span>}
                                                    </div>

                                                    {partner.background && (
                                                        <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 italic max-w-xl">
                                                            "{partner.background}"
                                                        </p>
                                                    )}

                                                    {/* Referral info for approved partners */}
                                                    {partner.status === 'Approved' && partner.referral_code && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className="text-[10px] text-emerald-600 font-black uppercase">Referral:</span>
                                                            <code className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">{partner.referral_code}</code>
                                                            <button onClick={() => copyToClipboard(`${window.location.origin}/ref/${partner.referral_code}`)} className="text-emerald-500 hover:text-emerald-700">
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Rejection reason */}
                                                    {partner.status === 'Rejected' && partner.rejection_reason && (
                                                        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2 border border-red-100">
                                                            <span className="font-black">Reason:</span> {partner.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right — Actions */}
                                            <div className="flex items-center gap-6 pl-16 md:pl-0 shrink-0">
                                                {partner.status === 'Approved' && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Mandis Onboarded</p>
                                                        <p className="font-bold text-slate-900 flex items-center gap-1"><Building2 className="w-4 h-4 text-slate-400"/>{partner.total_onboarded || 0}</p>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2">
                                                    {partner.status === 'Approved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleResendCredentials(partner)}
                                                            disabled={actionLoading === partner.name}
                                                            className="border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs"
                                                        >
                                                            {actionLoading === partner.name ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Mail className="w-3 h-3 mr-1"/>} Resend Credentials
                                                        </Button>
                                                    )}
                                                    {partner.status === 'Pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(partner.name)}
                                                                disabled={actionLoading === partner.name}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                                                            >
                                                                {actionLoading === partner.name
                                                                    ? <Loader2 className="w-3 h-3 animate-spin mr-1"/>
                                                                    : <CheckCircle2 className="w-3 h-3 mr-1"/>}
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setRejectModal({ id: partner.name, name: partner.partner_name })}
                                                                disabled={actionLoading === partner.name}
                                                                className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs px-4"
                                                            >
                                                                <XCircle className="w-3 h-3 mr-1"/> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {partner.status === 'Rejected' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleApprove(partner.name)}
                                                            disabled={actionLoading === partner.name}
                                                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                                                        >
                                                            Re-Approve
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-black text-slate-900 mb-1">Reject Application</h3>
                        <p className="text-sm text-slate-500 mb-4">Rejecting <span className="font-bold text-slate-900">{rejectModal.name}</span>. They will receive an email with your reason.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (e.g. Territory already covered, Profile incomplete...)"
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none h-28 focus:outline-none focus:border-red-300 mb-4"
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModal.id}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black"
                            >
                                {actionLoading === rejectModal.id ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <XCircle className="w-4 h-4 mr-2"/>}
                                Confirm Reject
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="flex-1 border-slate-200"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
