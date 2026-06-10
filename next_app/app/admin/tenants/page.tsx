'use client';

import { useState, useEffect } from 'react';
import { callApi } from '@/lib/frappeClient'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Loader2, MoreHorizontal, Power, PowerOff, Trash2, Building2, Plus,
    Eye, Search, Filter, ShieldCheck, RefreshCw, ArrowUpRight,
    AlertTriangle, CheckCircle2, TrendingDown, ChevronRight, Users, Zap,
    Key, Phone, Link as LinkIcon, FileDown, FileText
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const PLAN_STYLES: Record<string, string> = {
    basic:      'text-slate-500 border-gray-500/30 bg-gray-500/10',
    standard:   'text-blue-400 border-blue-500/30 bg-blue-500/10',
    enterprise: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
};

function getLifecycleState(t: any): { label: string; color: string; dotClass: string } {
    switch (t.status) {
        case 'trial':
        case 'trialing':     return { label: 'Trial',       color: 'text-yellow-400', dotClass: 'bg-yellow-500 animate-pulse' };
        case 'active':       return { label: 'Active',      color: 'text-emerald-400', dotClass: 'bg-emerald-500 animate-pulse' };
        case 'grace_period':
        case 'past_due':     return { label: 'Grace Period', color: 'text-orange-400', dotClass: 'bg-orange-500 animate-pulse' };
        case 'suspended':
        case 'soft_locked':  return { label: 'Suspended',   color: 'text-red-400',    dotClass: 'bg-red-500' };
        case 'cancelled':
        case 'expired':
        case 'archived':     return { label: 'Archived',    color: 'text-slate-500',   dotClass: 'bg-gray-600' };
        default:
            // Fallback for legacy records that only have is_active
            return t.is_active
                ? { label: 'Active',   color: 'text-emerald-400', dotClass: 'bg-emerald-500 animate-pulse' }
                : { label: 'Suspended', color: 'text-red-400',    dotClass: 'bg-red-500' };
    }
}

function getActivityRisk(t: any) {
    if (!t.last_activity) return 'unknown';
    const days = differenceInDays(new Date(), new Date(t.last_activity));
    if (days > 14) return 'high';
    if (days > 7) return 'medium';
    return 'low';
}

export default function TenantsPage() {
    const { toast } = useToast();
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterExpiryFrom, setFilterExpiryFrom] = useState(''); // YYYY-MM-DD
    const [filterExpiryTo, setFilterExpiryTo] = useState('');   // YYYY-MM-DD
    const [isExporting, setIsExporting] = useState(false);

    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionOpen, setProvisionOpen] = useState(false);
    const [newTenant, setNewTenant] = useState({
        orgName: '',
        email: '',
        adminName: '',
        password: '',
        username: '',
        phone: '',
        city: '',
        plan: 'basic'
    });

    // Modern Confirmation States
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteText, setDeleteText] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [confirmActionOpen, setConfirmActionOpen] = useState(false);
    const [actionInfo, setActionInfo] = useState<{
        title: string;
        description: string;
        confirmText: string;
        onConfirm: () => Promise<void>;
        variant?: 'default' | 'destructive' | 'outline';
    } | null>(null);
    const [isActioning, setIsActioning] = useState(false);

    // Assign Partner States
    const [assignPartnerModal, setAssignPartnerModal] = useState<any>(null);
    const [partnersList, setPartnersList] = useState<any[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isFetchingPartners, setIsFetchingPartners] = useState(false);

    useEffect(() => { fetchTenants(); }, []);

    // Background poller for new tenant notifications
    useEffect(() => {
        const poller = setInterval(async () => {
            try {
                const data = await callApi('mandigrow.api.get_admin_tenants') as any[];
                setTenants(prev => {
                    if (prev.length === 0) return data; // Initial load protection
                    
                    const prevIds = new Set(prev.map(t => t.id));
                    const newTenants = data.filter(t => !prevIds.has(t.id));
                    
                    if (newTenants.length > 0) {
                        newTenants.forEach(t => {
                            toast({ 
                                title: '🎉 New Mandi Registered!', 
                                description: `${t.name} has just joined the platform.`,
                                duration: 15000,
                            });
                        });
                        return data;
                    }
                    return prev;
                });
            } catch (e) {
                // Silently ignore background polling errors
            }
        }, 15000); // Check every 15 seconds
        return () => clearInterval(poller);
    }, [toast]);

    const fetchTenants = async (sync = false) => {
        setLoading(true);
        try {
            const data = await callApi('mandigrow.api.get_admin_tenants');
            setTenants(data as any[]);
            if (sync) {
                toast({ title: 'Sync Complete', description: 'Tenant statuses and billing updated.' });
            }
        } catch (e: any) {
            toast({ title: 'Fetch Failed', description: e.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleAssignPartner = async (tenant: any) => {
        setAssignPartnerModal(tenant);
        if (partnersList.length === 0) {
            setIsFetchingPartners(true);
            try {
                const res: any = await callApi('mandigrow.api.get_partner_applications', { status: 'Approved' });
                if (res?.success) setPartnersList(res.data || []);
            } catch (e: any) {
                toast({ title: 'Fetch Partners Failed', description: e.message, variant: 'destructive' });
            } finally {
                setIsFetchingPartners(false);
            }
        }
    };

    const submitAssignPartner = async () => {
        if (!assignPartnerModal || !selectedPartnerId) return;
        setIsAssigning(true);
        try {
            const res: any = await callApi('mandigrow.api.link_partner_to_tenant', {
                tenant_id: assignPartnerModal.id,
                partner_id: selectedPartnerId
            });
            if (res?.success) {
                toast({ title: 'Partner Assigned!', description: 'Trust report emailed successfully.' });
                setAssignPartnerModal(null);
                setSelectedPartnerId('');
                fetchTenants();
            } else {
                toast({ title: 'Assign Failed', description: res?.error, variant: 'destructive' });
            }
        } catch (e: any) {
            toast({ title: 'Assign Failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsAssigning(false);
        }
    };

    const toggleStatus = async (orgId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'suspend' : 'reactivate';
        
        setActionInfo({
            title: `${currentStatus ? 'Suspend' : 'Activate'} Tenant`,
            description: `Are you sure you want to ${action} this tenant environment?`,
            confirmText: currentStatus ? 'Suspend' : 'Activate',
            variant: currentStatus ? 'destructive' : 'default',
            onConfirm: async () => {
                try {
                    await callApi('mandigrow.api.admin_billing_action', { action, organization_id: orgId });
                    toast({ title: 'Success', description: `Tenant ${action}ed.` });
                    fetchTenants();
                } catch (e: any) {
                    toast({ title: 'Action Failed', description: e.message, variant: 'destructive' });
                }
            }
        });
        setConfirmActionOpen(true);
    };

    const handleDelete = (tenant: any) => {
        setSelectedTenant(tenant);
        setDeleteText('');
        setConfirmDeleteOpen(true);
    };

    const executeDelete = async () => {
        if (!selectedTenant) return;
        setIsDeleting(true);
        try {
            await callApi('mandigrow.api.admin_billing_action', { action: 'archive', organization_id: selectedTenant.id });
            toast({ title: 'Tenant Archived', description: `${selectedTenant.name} has been archived.` });
            setConfirmDeleteOpen(false);
            fetchTenants();
        } catch (e: any) {
            toast({ title: 'Archive Failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

    const handleImpersonate = async (tenantOwnerId: string, tenantName: string) => {
        if (!tenantOwnerId) {
            toast({ title: 'No Owner', description: 'This tenant has no owner to impersonate.', variant: 'destructive' });
            return;
        }
        
        setIsImpersonating(tenantOwnerId);
        try {
            await callApi('mandigrow.api.impersonate_tenant', { user_id: tenantOwnerId });
            
            toast({ title: `✓ Success`, description: `Entering ${tenantName} workspace...` });
            
            // Mark impersonation mode for UI hints
            localStorage.setItem('mandi_impersonation_mode', 'true');
            
            setTimeout(() => { window.location.href = '/dashboard'; }, 500);

        } catch (e: any) {
            toast({ title: 'Impersonate Failed', description: e.message, variant: 'destructive' });
            setIsImpersonating(null);
        }
    };

    const [isCreatingOwner, setIsCreatingOwner] = useState<string | null>(null);

    const handleCreateOwner = async (tenantId: string, tenantName: string) => {
        setActionInfo({
            title: 'Generate Owner Account',
            description: `This will create a fresh tenant_admin account for ${tenantName}.`,
            confirmText: 'Generate Access',
            onConfirm: async () => {
                setIsCreatingOwner(tenantId);
                try {
                    await callApi('mandigrow.api.provision_team_member', {
                        email: `admin@${tenantId.toLowerCase()}.com`,
                        full_name: 'Tenant Admin',
                        password: 'mandi123',
                        role: 'admin',
                        organization_id: tenantId
                    });
                    toast({ title: 'Owner Created', description: `Owner account has been provisioned.` });
                    fetchTenants();
                } catch (e: any) {
                    toast({ title: 'Failed to create owner', description: e.message, variant: 'destructive' });
                } finally {
                    setIsCreatingOwner(null);
                }
            }
        });
        setConfirmActionOpen(true);
    };
    const handleProvision = async () => {
        if (!newTenant.orgName || !newTenant.email || !newTenant.password) {
            toast({ title: 'Missing Fields', description: 'Please fill name, email and password.', variant: 'destructive' });
            return;
        }

        setIsProvisioning(true);
        try {
            const res: any = await callApi('mandigrow.api.provision_tenant', newTenant);
            if (res.status === 'error') throw new Error(res.message);

            toast({ title: 'Success', description: `Tenant ${newTenant.orgName} provisioned successfully.` });
            setProvisionOpen(false);
            setNewTenant({ orgName: '', email: '', adminName: '', password: '', username: '', phone: '', city: '', plan: 'basic' });
            fetchTenants();
        } catch (e: any) {
            toast({ 
                title: 'Provisioning Failed', 
                description: e.message || 'Duplicate Email or UserID detected.', 
                variant: 'destructive' 
            });
        } finally {
            setIsProvisioning(false);
        }
    };

    const filtered = tenants.filter(t => {
        const matchSearch = !searchQuery ||
            t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.owner?.phone?.includes(searchQuery) ||
            t.phone?.includes(searchQuery);

        let matchStatus = true;
        if (filterStatus === 'expiring_soon') {
            const expiresAt = t.status === 'trial' ? t.trial_ends_at : t.current_period_end;
            if (!expiresAt) {
                matchStatus = false;
            } else {
                const days = differenceInDays(new Date(expiresAt), new Date());
                matchStatus = days >= 0 && days <= 15;
            }
        } else {
            matchStatus = filterStatus === 'all' || t.status === filterStatus ||
                (filterStatus === 'active' && !t.status && t.is_active) ||
                (filterStatus === 'suspended' && !t.status && !t.is_active);
        }

        // Expiry date range filter — works across all statuses
        let matchExpiry = true;
        if (filterExpiryFrom || filterExpiryTo) {
            const expiresAt = t.status === 'trial' ? t.trial_ends_at : (t.current_period_end || t.trial_ends_at);
            if (!expiresAt) {
                matchExpiry = false;
            } else {
                const expiryDate = new Date(expiresAt);
                if (filterExpiryFrom) {
                    const from = new Date(filterExpiryFrom);
                    from.setHours(0, 0, 0, 0);
                    if (expiryDate < from) matchExpiry = false;
                }
                if (matchExpiry && filterExpiryTo) {
                    const to = new Date(filterExpiryTo);
                    to.setHours(23, 59, 59, 999);
                    if (expiryDate > to) matchExpiry = false;
                }
            }
        }

        const matchPlan = filterPlan === 'all' || t.subscription_tier === filterPlan;
        const matchCity = filterCity === 'all' || (t.city && t.city.toLowerCase() === filterCity.toLowerCase());
        const matchType = t.tenant_type === 'mandi' || (t.enabled_modules && t.enabled_modules.includes('mandi'));
        return matchSearch && matchStatus && matchExpiry && matchPlan && matchType && matchCity;
    });

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active' || (!t.status && t.is_active)).length,
        trial: tenants.filter(t => t.status === 'trial').length,
        suspended: tenants.filter(t => t.status === 'suspended' || (!t.status && !t.is_active)).length,
        totalUsers: tenants.reduce((acc, t) => acc + (t.profiles?.length || 0), 0)
    };

    // ── Export helpers ──────────────────────────────────────────────────────
    const buildExportRows = () =>
        filtered.map(t => {
            const lifecycle = getLifecycleState(t);
            const expiresAt = t.status === 'trial' ? t.trial_ends_at : (t.current_period_end || t.trial_ends_at);
            const daysLeft = expiresAt ? differenceInDays(new Date(expiresAt), new Date()) : null;
            return {
                'Tenant Name':      t.name || '',
                'Owner Name':       t.owner?.full_name || '',
                'Username':         t.owner?.username ? `@${t.owner.username}` : '',
                'Email':            t.owner?.email || '',
                'Phone':            t.owner?.phone || t.phone || '',
                'City':             t.city || '',
                'Plan':             t.subscription_tier || 'basic',
                'Status':           lifecycle.label,
                'Expiry Date':      expiresAt ? format(new Date(expiresAt), 'dd MMM yyyy') : 'Lifetime',
                'Days Until Expiry': daysLeft !== null ? daysLeft : 'N/A',
                'Partner':          t.onboarding_partner || '',
            };
        });

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const XLSX = await import('xlsx');
            const rows = buildExportRows();
            const ws = XLSX.utils.json_to_sheet(rows);
            // Auto column widths
            const colWidths = Object.keys(rows[0] || {}).map(k =>
                ({ wch: Math.max(k.length, ...rows.map(r => String(r[k as keyof typeof r] ?? '').length)) + 2 })
            );
            ws['!cols'] = colWidths;
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Tenants');
            const filename = `tenants_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
            XLSX.writeFile(wb, filename);
            toast({ title: '✅ Excel Downloaded', description: `${rows.length} tenants exported.` });
        } catch (e: any) {
            toast({ title: 'Export Failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const rows = buildExportRows();
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            // Header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Tenant Report', 14, 18);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 25);

            // Active filters summary
            const filterParts: string[] = [];
            if (filterStatus !== 'all') filterParts.push(`Status: ${filterStatus}`);
            if (filterPlan !== 'all') filterParts.push(`Plan: ${filterPlan}`);
            if (filterCity !== 'all') filterParts.push(`Location: ${filterCity}`);
            if (filterExpiryFrom) filterParts.push(`Expiry From: ${filterExpiryFrom}`);
            if (filterExpiryTo) filterParts.push(`Expiry To: ${filterExpiryTo}`);
            if (filterParts.length > 0) {
                doc.text(`Filters: ${filterParts.join(' | ')}`, 14, 31);
            }
            doc.text(`Total Records: ${rows.length}`, 14, filterParts.length > 0 ? 37 : 31);

            const startY = filterParts.length > 0 ? 42 : 36;
            const columns = Object.keys(rows[0] || {});
            const tableRows = rows.map(r => columns.map(c => String(r[c as keyof typeof r] ?? '')));

            autoTable(doc, {
                head: [columns],
                body: tableRows,
                startY,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 7 },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                columnStyles: { 9: { halign: 'center' } },
                margin: { left: 14, right: 14 },
            });

            const filename = `tenants_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            doc.save(filename);
            toast({ title: '✅ PDF Downloaded', description: `${rows.length} tenants exported.` });
        } catch (e: any) {
            toast({ title: 'Export Failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-[0.2em] uppercase mb-1">Tenants</h1>
                    <p className="text-slate-500 text-sm font-medium">Lifecycle management for all registered MandiGrow tenants.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 font-black text-xs"
                        onClick={handleExportExcel}
                        disabled={isExporting || filtered.length === 0}
                        title="Download filtered data as Excel"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                        Excel ({filtered.length})
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 gap-2 font-black text-xs"
                        onClick={handleExportPDF}
                        disabled={isExporting || filtered.length === 0}
                        title="Download filtered data as PDF"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        PDF ({filtered.length})
                    </Button>
                    <Button variant="outline" className="border-slate-200 text-slate-900 hover:bg-white/5 gap-2" onClick={() => fetchTenants(false)}>
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                    <Button variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 gap-2" onClick={() => fetchTenants(true)}>
                        <Zap className="w-4 h-4" /> Sync Cloud
                    </Button>
                    <Dialog open={provisionOpen} onOpenChange={setProvisionOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 text-black font-black hover:bg-indigo-600/90 rounded-xl gap-2">
                                <Plus className="w-4 h-4" /> Provision Tenant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Provision New Tenant</DialogTitle>
                                <DialogDescription>Create a new MandiGrow instance with a dedicated owner account.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="orgName" className="text-xs font-black uppercase">Organization Name</Label>
                                        <Input
                                            id="orgName"
                                            placeholder="e.g. Malik & Sons Mandi"
                                            value={newTenant.orgName}
                                            onChange={e => setNewTenant({ ...newTenant, orgName: e.target.value })}
                                            className="bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="adminName" className="text-xs font-black uppercase">Owner Name</Label>
                                            <Input
                                                id="adminName"
                                                placeholder="e.g. Tariq Malik"
                                                value={newTenant.adminName}
                                                onChange={e => setNewTenant({ ...newTenant, adminName: e.target.value })}
                                                className="bg-slate-50 border-slate-200"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="plan" className="text-xs font-black uppercase">Initial Plan</Label>
                                            <Select value={newTenant.plan} onValueChange={v => setNewTenant({ ...newTenant, plan: v })}>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-200">
                                                    <SelectItem value="basic_monthly">Basic - Monthly</SelectItem>
                                                    <SelectItem value="basic_yearly">Basic - Yearly</SelectItem>
                                                    <SelectItem value="standard_monthly">Standard - Monthly</SelectItem>
                                                    <SelectItem value="standard_yearly">Standard - Yearly</SelectItem>
                                                    <SelectItem value="enterprise_monthly">Enterprise - Monthly</SelectItem>
                                                    <SelectItem value="enterprise_yearly">Enterprise - Yearly</SelectItem>
                                                    <SelectItem value="vip_plan_monthly">VIP Plan - Monthly</SelectItem>
                                                    <SelectItem value="vip_plan_yearly">VIP Plan - Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-xs font-black uppercase">Owner Email (Login UID)</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="owner@email.com"
                                            value={newTenant.email}
                                            onChange={e => setNewTenant({ ...newTenant, email: e.target.value })}
                                            className="bg-slate-50 border-slate-200 font-mono"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-indigo-500">Global UserID (Login Login Nickname)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">@</span>
                                            <Input
                                                id="username"
                                                placeholder="e.g. tariq786"
                                                value={newTenant.username}
                                                onChange={e => setNewTenant({ ...newTenant, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                                className="pl-8 bg-slate-50 border-slate-200 font-mono font-bold"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium italic mt-1">Min 6 characters (UserID for login).</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="mobile" className="text-xs font-black uppercase tracking-widest text-indigo-500">Owner Mobile (Primary Contact)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                                            <Input
                                                id="mobile"
                                                placeholder="9876543210"
                                                value={newTenant.phone}
                                                onChange={e => setNewTenant({ ...newTenant, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                                                className="pl-12 bg-slate-50 border-slate-200 font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-indigo-500">City / Location</Label>
                                        <Input
                                            id="city"
                                            placeholder="e.g. Hyderabad"
                                            value={newTenant.city}
                                            onChange={e => setNewTenant({ ...newTenant, city: e.target.value })}
                                            className="bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pass" className="text-xs font-black uppercase">Temporary Password</Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="pass"
                                                type="text"
                                                placeholder="••••••••"
                                                value={newTenant.password}
                                                onChange={e => setNewTenant({ ...newTenant, password: e.target.value })}
                                                className="pl-9 bg-slate-50 border-slate-200 font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium italic">Owner will be prompted to change this upon first login.</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleProvision}
                                    disabled={isProvisioning}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg ring-offset-2 focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    {isProvisioning ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing Infrastructure...</>
                                    ) : (
                                        'Activate Tenant Environment'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total', value: stats.total, icon: Building2, color: 'text-slate-900', click: () => setFilterStatus('all') },
                    { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-400', click: () => setFilterStatus('active') },
                    { label: 'Trial', value: stats.trial, icon: TrendingDown, color: 'text-yellow-400', click: () => setFilterStatus('trial') },
                    { label: 'Suspended', value: stats.suspended, icon: AlertTriangle, color: 'text-red-400', click: () => setFilterStatus('suspended') },
                    {
                        label: 'Expiring ≤15d',
                        icon: Filter,
                        color: 'text-orange-400',
                        value: tenants.filter(t => {
                            const exp = t.status === 'trial' ? t.trial_ends_at : (t.current_period_end || t.trial_ends_at);
                            if (!exp) return false;
                            const d = differenceInDays(new Date(exp), new Date());
                            return d >= 0 && d <= 15;
                        }).length,
                        click: () => { setFilterStatus('expiring_soon'); setFilterExpiryFrom(''); setFilterExpiryTo(''); }
                    },
                ].map(s => (
                    <Card
                        key={s.label}
                        className="bg-white shadow-sm border-slate-200 cursor-pointer hover:border-slate-300 transition-all"
                        onClick={s.click}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <s.icon className={cn("w-5 h-5 flex-shrink-0", s.color)} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search tenant, owner, or email..."
                        className="pl-9 bg-white shadow-sm border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-neon-blue/50"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setFilterExpiryFrom(''); setFilterExpiryTo(''); }}>
                    <SelectTrigger className="w-44 bg-white shadow-sm border-slate-200 text-slate-900">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-50 border-slate-200 text-slate-900">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="grace_period">Grace Period</SelectItem>
                        <SelectItem value="expiring_soon">Expiring Soon (≤ 15 Days)</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                    <SelectTrigger className="w-40 bg-white shadow-sm border-slate-200 text-slate-900">
                        <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-50 border-slate-200 text-slate-900">
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterCity} onValueChange={setFilterCity}>
                    <SelectTrigger className="w-40 bg-white shadow-sm border-slate-200 text-slate-900">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-50 border-slate-200 text-slate-900 max-h-60">
                        <SelectItem value="all">All Locations</SelectItem>
                        {Array.from(new Set(tenants.map(t => t.city).filter(Boolean))).sort().map(city => (
                            <SelectItem key={city as string} value={city as string}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* ── Expiry Date Range Filter ── */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expiry</span>
                    <input
                        type="date"
                        value={filterExpiryFrom}
                        onChange={e => { setFilterExpiryFrom(e.target.value); setFilterStatus('all'); }}
                        className="h-7 px-2 rounded border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 cursor-pointer w-36"
                        title="Expiry from date"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">to</span>
                    <input
                        type="date"
                        value={filterExpiryTo}
                        min={filterExpiryFrom || undefined}
                        onChange={e => { setFilterExpiryTo(e.target.value); setFilterStatus('all'); }}
                        className="h-7 px-2 rounded border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 cursor-pointer w-36"
                        title="Expiry to date"
                    />
                    {(filterExpiryFrom || filterExpiryTo) && (
                        <button
                            onClick={() => { setFilterExpiryFrom(''); setFilterExpiryTo(''); }}
                            className="text-[10px] text-slate-400 hover:text-red-500 font-black px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                            title="Clear date filter"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Tenant List */}
            <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tenant</div>
                    <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Mobile</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</div>
                    <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/[0.04] max-h-[calc(100vh-480px)] overflow-y-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">No tenants match your filters</p>
                        </div>
                    ) : (
                        filtered.map((tenant) => {
                            const lifecycle = getLifecycleState(tenant);
                            const risk = getActivityRisk(tenant);
                            return (
                                <div
                                    key={tenant.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors group"
                                >
                                    {/* Tenant Identity */}
                                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/30 border border-slate-200 flex items-center justify-center text-slate-900 font-black text-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {tenant.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/tenants/${tenant.id}`} className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors truncate">
                                                    {tenant.name}
                                                </Link>
                                                {risk === 'high' && (
                                                    <span title="Churn risk: inactive > 14 days">
                                                        <AlertTriangle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[11px] text-slate-500 font-bold truncate leading-tight">
                                                        {tenant.owner?.full_name || 'No Owner'}
                                                    </p>
                                                    {tenant.owner?.username && (
                                                        <span className="text-[10px] text-indigo-500 font-black lowercase bg-indigo-50 px-1 rounded">@{tenant.owner.username}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {tenant.owner?.email && (
                                                        <p className="text-[10px] text-slate-400 font-mono tracking-tight truncate leading-tight">
                                                            {tenant.owner.email}
                                                        </p>
                                                    )}
                                                    {tenant.owner?.phone && (
                                                        <>
                                                            <span className="text-[10px] text-slate-300">•</span>
                                                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                                                                {tenant.owner.phone}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {tenant.onboarding_partner && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <LinkIcon className="w-3 h-3 text-indigo-500" />
                                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                            {tenant.onboarding_partner}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan */}
                                    <div className="col-span-1">
                                        <Badge variant="outline" className={cn("text-[10px] font-black capitalize", PLAN_STYLES[tenant.subscription_tier] || PLAN_STYLES.basic)}>
                                            {tenant.subscription_tier || 'basic'}
                                        </Badge>
                                    </div>

                                    {/* Mobile Contact */}
                                    <div className="col-span-2 flex flex-col justify-center min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="p-1 bg-indigo-50 rounded-md">
                                                <Phone className="w-2.5 h-2.5 text-indigo-600" />
                                            </div>
                                            <p className="font-mono font-black text-slate-900 text-[11px] tracking-tight truncate">
                                                {tenant.owner?.phone || tenant.phone || 'NO CONTACT'}
                                            </p>
                                        </div>
                                        {tenant.owner?.phone && tenant.phone && tenant.owner.phone !== tenant.phone && (
                                            <p className="text-[8px] text-slate-400 font-bold ml-5 uppercase">Bus: {tenant.phone}</p>
                                        )}
                                        {tenant.city && (
                                            <p className="text-[9px] text-slate-500 font-bold ml-5 flex items-center gap-0.5">
                                                <span>📍</span> {tenant.city}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status / Lifecycle */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", lifecycle.dotClass)} />
                                            <span className={cn("text-[11px] font-bold", lifecycle.color)}>{lifecycle.label}</span>
                                        </div>
                                        {tenant.status === 'trial' && tenant.trial_ends_at && (
                                            <p className="text-[9px] font-black text-yellow-500/80 uppercase mt-0.5 ml-3.5">
                                                {differenceInDays(new Date(tenant.trial_ends_at), new Date())} days left
                                            </p>
                                        )}
                                    </div>

                                    {/* Expiry Date */}
                                    <div className="col-span-1">
                                        <p className="text-xs text-slate-900 font-black tracking-tighter">
                                            {tenant.current_period_end ? format(new Date(tenant.current_period_end), 'dd MMM yy') : 
                                             tenant.trial_ends_at ? format(new Date(tenant.trial_ends_at), 'dd MMM yy') : 'LIFETIME'}
                                        </p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                            {tenant.current_period_end ? 'Subscription' : tenant.trial_ends_at ? 'Trial End' : 'Perpetual'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <Link href={`/admin/tenants/${tenant.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-lg">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-50 border-slate-200 text-slate-900 w-48">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tenants/${tenant.id}`} className="flex items-center gap-2 cursor-pointer">
                                                        <Eye className="w-3.5 h-3.5 text-indigo-600" /> View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/support?id=${tenant.id}`} className="flex items-center gap-2 cursor-pointer">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Run Diagnostics
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer flex gap-2 text-indigo-600 focus:text-indigo-700"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        handleAssignPartner(tenant);
                                                    }}
                                                >
                                                    <LinkIcon className="w-3.5 h-3.5" /> Assign Partner
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {tenant.owner?.id ? (
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer flex gap-2 text-purple-400 focus:text-purple-300" 
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleImpersonate(tenant.owner.id, tenant.name);
                                                        }}
                                                        disabled={isImpersonating === tenant.owner.id}
                                                    >
                                                        {isImpersonating === tenant.owner.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                                        )}
                                                        Login As Owner
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer flex gap-2 text-indigo-400 focus:text-indigo-300" 
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleCreateOwner(tenant.id, tenant.name);
                                                        }}
                                                        disabled={isCreatingOwner === tenant.id}
                                                    >
                                                        {isCreatingOwner === tenant.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-3.5 h-3.5" />
                                                        )}
                                                        Create Owner
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator className="bg-slate-200" />
                                                <DropdownMenuItem
                                                    className={cn("cursor-pointer flex gap-2", tenant.is_active ? "text-orange-600 focus:text-orange-700 hover:bg-orange-50" : "text-emerald-600 focus:text-emerald-700 hover:bg-emerald-50")}
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        toggleStatus(tenant.id, tenant.is_active);
                                                    }}
                                                >
                                                    {tenant.is_active
                                                        ? <><PowerOff className="w-3.5 h-3.5" /> Suspend</>
                                                        : <><Power className="w-3.5 h-3.5" /> Activate</>
                                                    }
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-200" />
                                                <DropdownMenuItem
                                                    className="text-red-500 focus:text-red-600 hover:bg-red-50 cursor-pointer flex gap-2"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(tenant);
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete Tenant
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-200 flex justify-between items-center bg-white/[0.01]">
                    <p className="text-[11px] text-slate-400">
                        Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of <span className="text-slate-900 font-bold">{tenants.length}</span> tenants
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Updated live</p>
                </div>
            </Card>

            {/* Action Confirmation Dialog */}
            <Dialog open={confirmActionOpen} onOpenChange={setConfirmActionOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-indigo-500" />
                            {actionInfo?.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 py-2">
                            {actionInfo?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setConfirmActionOpen(false)} disabled={isActioning}>
                            Cancel
                        </Button>
                        <Button 
                            variant={actionInfo?.variant === 'destructive' ? 'destructive' : 'default'}
                            className={cn(
                                "font-black uppercase tracking-wider",
                                actionInfo?.variant !== 'destructive' && "bg-indigo-600 hover:bg-indigo-700 text-white"
                            )}
                            onClick={async () => {
                                setIsActioning(true);
                                await actionInfo?.onConfirm();
                                setIsActioning(false);
                                setConfirmActionOpen(false);
                            }}
                            disabled={isActioning}
                        >
                            {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : actionInfo?.confirmText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive / Soft-Delete Dialog */}
            <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <DialogContent className="bg-white border-orange-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase text-orange-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Archive Tenant
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Archive <strong>{selectedTenant?.name}</strong>. The tenant and all its data will be preserved but immediately deactivated. This can be reversed by a super admin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-[10px] text-orange-700 font-bold uppercase tracking-widest leading-relaxed">
                            All user sessions will be invalidated. Data is retained and can be restored.
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Type <span className="text-orange-600">DELETE</span> to confirm</Label>
                            <Input
                                value={deleteText}
                                onChange={e => setDeleteText(e.target.value)}
                                placeholder="DELETE"
                                className="bg-slate-50 border-orange-100 font-black text-center text-orange-600 placeholder:text-orange-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest px-8"
                            disabled={deleteText !== 'DELETE' || isDeleting}
                            onClick={executeDelete}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Partner Modal */}
            <Dialog open={!!assignPartnerModal} onOpenChange={() => setAssignPartnerModal(null)}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Assign Partner to Tenant</DialogTitle>
                        <DialogDescription>
                            Link a partner to <span className="font-bold text-slate-900">{assignPartnerModal?.name}</span>. This will guarantee their commission on renewals and send them a Trust Report email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label>Select Approved Partner</Label>
                        {isFetchingPartners ? (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading partners...
                            </div>
                        ) : (
                            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a partner..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 bg-white">
                                    {partnersList.length === 0 ? (
                                        <div className="p-2 text-sm text-slate-500">No approved partners found.</div>
                                    ) : (
                                        partnersList.map(p => (
                                            <SelectItem key={p.name} value={p.name}>
                                                {p.partner_name} ({p.city || 'No City'}) - {p.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignPartnerModal(null)}>Cancel</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={!selectedPartnerId || isAssigning}
                            onClick={submitAssignPartner}
                        >
                            {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                            Assign & Notify Partner
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
