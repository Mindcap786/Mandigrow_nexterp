'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { callApi } from '@/lib/frappeClient';
import {
    Package, AlertTriangle, TrendingDown, ArrowDownLeft, ArrowUpRight,
    RefreshCw, Loader2, Plus, X, ChevronRight, Building2, Users, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface CrateSummary {
    godown: { crate_type: string; total_out: number; total_in: number; net_held_by_parties: number }[];
    outstanding: { party_id: string; party_name: string; crate_type: string; running_balance: number; posting_date: string }[];
    alerts: { party_id: string; party_name: string; crate_type: string; running_balance: number; posting_date: string }[];
    ageing_days: number;
}

export default function CrateDashboardPage() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [summary, setSummary] = useState<CrateSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [txnOpen, setTxnOpen] = useState(false);
    const [crateTypes, setCrateTypes] = useState<string[]>([]);

    // New transaction form state
    const [txnForm, setTxnForm] = useState({
        transaction_type: 'return',
        crate_type: '',
        quantity: '',
        party_id: '',
        party_name: '',
        notes: '',
    });
    const [txnSaving, setTxnSaving] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [contactOpen, setContactOpen] = useState(false);

    // Charge state
    const [chargeOpen, setChargeOpen] = useState(false);
    const [chargeData, setChargeData] = useState<any>(null);
    const [chargeQty, setChargeQty] = useState<number>(0);
    const [charging, setCharging] = useState(false);

    const fetchSummary = useCallback(async () => {
        if (!profile?.organization_id) return;
        setLoading(true);
        try {
            const [res, contactsRes]: any = await Promise.all([
                callApi('mandigrow.api.get_crate_summary', { org_id: profile.organization_id }),
                callApi('mandigrow.api.get_contacts', { org_id: profile.organization_id })
            ]);
            setSummary(res);
            setContacts(contactsRes || []);
            // Extract unique crate type names for the form dropdown
            const types = Array.from(new Set([
                ...(res.godown || []).map((g: any) => g.crate_type),
                ...(res.outstanding || []).map((o: any) => o.crate_type),
            ])) as string[];
            setCrateTypes(types);
        } catch (e: any) {
            toast({ title: 'Error', description: e.message || 'Failed to load crate data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const handleTxnSubmit = async () => {
        if (!txnForm.crate_type || !txnForm.quantity) {
            toast({ title: 'Missing Fields', description: 'Crate Type and Quantity are required.', variant: 'destructive' });
            return;
        }
        setTxnSaving(true);
        try {
            const res: any = await callApi('mandigrow.api.create_crate_transaction', {
                org_id: profile?.organization_id,
                transaction_type: txnForm.transaction_type,
                crate_type: txnForm.crate_type,
                quantity: parseInt(txnForm.quantity),
                party_id: txnForm.party_id,
                party_name: txnForm.party_name,
                notes: txnForm.notes,
            });
            toast({ title: '✅ Recorded', description: `Transaction ${res.transaction_id} created.` });
            setTxnOpen(false);
            setTxnForm({ transaction_type: 'return', crate_type: '', quantity: '', party_id: '', party_name: '', notes: '' });
            fetchSummary();
        } catch (e: any) {
            toast({ title: 'Failed', description: e.message, variant: 'destructive' });
        } finally {
            setTxnSaving(false);
        }
    };

    const handleChargeClick = (row: any) => {
        setChargeData(row);
        setChargeQty(row.running_balance);
        setChargeOpen(true);
    };

    const handleChargeConfirm = async () => {
        if (!chargeData || !chargeQty || chargeQty <= 0) return;
        setCharging(true);
        try {
            const res: any = await callApi('mandigrow.api.convert_crate_deposit_to_financial', {
                org_id: profile?.organization_id,
                party_id: chargeData.party_id,
                crate_type: chargeData.crate_type,
                qty_to_charge: chargeQty
            });
            toast({ title: '✅ Ledger Charged', description: res.message || "Successfully charged to ledger" });
            setChargeOpen(false);
            fetchSummary();
        } catch (e: any) {
            toast({ title: 'Charge Failed', description: e.message || "Failed to charge ledger", variant: 'destructive' });
        } finally {
            setCharging(false);
        }
    };

    const filtered = (summary?.outstanding || []).filter(r =>
        !search || r.party_name.toLowerCase().includes(search.toLowerCase())
    );

    const totalCratesOut = (summary?.godown || []).reduce((s, g) => s + (g.net_held_by_parties || 0), 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-40 space-y-6 animate-in fade-in">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-gradient-to-br from-white via-slate-50/50 to-white p-6 md:p-8 rounded-[28px] border border-slate-200/60 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-amber-600" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-[1000] italic tracking-tighter uppercase text-slate-900">
                                Crate <span className="text-amber-500">Tracker</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-bold text-sm italic">
                            Dabba / Bardan physical inventory — real-time double-entry ledger
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            onClick={fetchSummary}
                            className="h-11 rounded-xl border-slate-200 bg-white font-bold"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => setTxnOpen(true)}
                            className="h-11 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Entry
                        </Button>
                    </div>
                </div>

                {/* Ageing Alerts */}
                {(summary?.alerts?.length ?? 0) > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-black text-rose-700 text-sm">
                                {summary!.alerts.length} {summary!.alerts.length === 1 ? 'Party has' : 'Parties have'} held crates for more than {summary?.ageing_days} days
                            </div>
                            <div className="text-xs text-rose-500 mt-1 font-bold">
                                {summary!.alerts.map(a => a.party_name).join(', ')}
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    </div>
                ) : (
                    <>
                        {/* Godown Summary Cards */}
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 pl-1">
                                Godown Stock — Net with Parties
                            </div>
                            {summary?.godown.length === 0 ? (
                                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                                    No crate movements yet. Enable crate tracking in Settings and add crate types.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {summary?.godown.map(g => (
                                        <div key={g.crate_type} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{g.crate_type}</div>
                                            <div className="text-3xl font-mono font-black text-slate-900">{g.net_held_by_parties ?? 0}</div>
                                            <div className="text-[10px] text-slate-400 font-bold mt-1">Held by parties</div>
                                            <div className="flex gap-3 mt-2 text-[10px] font-bold">
                                                <span className="text-rose-500 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{g.total_out} out</span>
                                                <span className="text-emerald-500 flex items-center gap-0.5"><ArrowDownLeft className="w-3 h-3" />{g.total_in} in</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Total Outstanding</div>
                                        <div className="text-3xl font-mono font-black text-amber-700">{totalCratesOut}</div>
                                        <div className="text-[10px] text-amber-500 font-bold mt-1">All types combined</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Outstanding Party List */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                    Parties Holding Crates
                                </div>
                                <div className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                    {filtered.length} {filtered.length === 1 ? 'party' : 'parties'}
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-2 md:p-3 rounded-2xl shadow-sm mb-3 flex items-center gap-2">
                                <Input
                                    placeholder="Search party name..."
                                    className="border-0 bg-transparent focus:ring-0 shadow-none font-bold text-black placeholder:text-slate-400"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')}>
                                        <X className="w-4 h-4 text-slate-400 hover:text-black" />
                                    </button>
                                )}
                            </div>

                            {filtered.length === 0 ? (
                                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                                    All Crates Returned 🎉
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filtered.map((r, idx) => {
                                        const isAged = summary?.alerts.some(a => a.party_id === r.party_id && a.crate_type === r.crate_type);
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all",
                                                    isAged ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black",
                                                    isAged ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {isAged ? <AlertTriangle className="w-4 h-4" /> : r.running_balance}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-black text-black text-sm truncate">{r.party_name}</div>
                                                        {isAged && (
                                                            <span className="text-[9px] font-black bg-rose-100 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-bold mt-0.5">
                                                        {r.crate_type} · Since {r.posting_date}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-xl font-mono font-black text-rose-600">{r.running_balance}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">crates</div>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-6 text-[10px] font-black tracking-wider uppercase border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-full px-3"
                                                        onClick={() => handleChargeClick(r)}
                                                    >
                                                        Charge
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* New Transaction Dialog */}
            <Dialog open={txnOpen} onOpenChange={setTxnOpen}>
                <DialogContent className="bg-white text-black rounded-3xl border-slate-200 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-black text-xl">New Crate Entry</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-sm">
                            Record a manual crate movement (return, issue, damage, stock addition).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Type</label>
                            <Select value={txnForm.transaction_type} onValueChange={v => setTxnForm(f => ({ ...f, transaction_type: v }))}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="return">🟢 Return (Party returned crates)</SelectItem>
                                    <SelectItem value="issue">🔴 Issue (Crates given to party)</SelectItem>
                                    <SelectItem value="damage">⚠️ Damage (Write-off)</SelectItem>
                                    <SelectItem value="stock_addition">📦 Stock Addition (Bought new crates)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Crate Type</label>
                            <Input
                                placeholder="e.g. 20kg Plastic Crate"
                                className="h-12 rounded-xl border-slate-200 font-bold"
                                value={txnForm.crate_type}
                                onChange={e => setTxnForm(f => ({ ...f, crate_type: e.target.value }))}
                                list="crate-type-list"
                            />
                            <datalist id="crate-type-list">
                                {crateTypes.map(t => <option key={t} value={t} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Quantity</label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="0"
                                className="h-12 rounded-xl border-slate-200 font-bold font-mono"
                                value={txnForm.quantity}
                                onChange={e => setTxnForm(f => ({ ...f, quantity: e.target.value }))}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Party (Farmer / Buyer)</label>
                            <Popover open={contactOpen} onOpenChange={setContactOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={contactOpen}
                                        className="w-full justify-between h-12 rounded-xl border-slate-200 font-bold"
                                    >
                                        {txnForm.party_id
                                            ? contacts.find(c => c.name === txnForm.party_id)?.full_name || txnForm.party_name
                                            : txnForm.party_name || "Select or type ad-hoc party..."}
                                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput 
                                            placeholder="Search contacts..." 
                                            value={txnForm.party_name}
                                            onValueChange={(val) => {
                                                // If they are just typing, clear the ID so it becomes ad-hoc
                                                setTxnForm(f => ({ ...f, party_name: val, party_id: '' }));
                                            }}
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                No contact found. Will save as ad-hoc party: <span className="font-bold text-amber-600">{txnForm.party_name || '...'}</span>
                                            </CommandEmpty>
                                            <CommandGroup heading="Registered Contacts">
                                                {contacts.map((c) => (
                                                    <CommandItem
                                                        key={c.name}
                                                        value={c.full_name}
                                                        onSelect={() => {
                                                            setTxnForm(f => ({ ...f, party_id: c.name, party_name: c.full_name }));
                                                            setContactOpen(false);
                                                        }}
                                                        className="font-bold"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] uppercase text-slate-500">
                                                                {c.contact_type?.[0] || 'C'}
                                                            </div>
                                                            {c.full_name}
                                                            {c.phone_number && <span className="text-xs text-slate-400 font-normal ml-2">{c.phone_number}</span>}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Notes (Optional)</label>
                            <Input
                                placeholder="Any remarks..."
                                className="h-12 rounded-xl border-slate-200 font-bold"
                                value={txnForm.notes}
                                onChange={e => setTxnForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setTxnOpen(false)}
                                className="flex-1 h-12 rounded-xl border-slate-200 font-bold"
                                disabled={txnSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleTxnSubmit}
                                disabled={txnSaving}
                                className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-700"
                            >
                                {txnSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Entry'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Charge Dialog */}
            <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
                <DialogContent className="bg-white text-black rounded-3xl border-slate-200 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-black text-xl text-rose-600">Charge to Ledger</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-sm">
                            Convert lost/unreturned crates into a financial debit for {chargeData?.party_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1 block mb-1">Crate Type</label>
                            <Input value={chargeData?.crate_type || ''} readOnly className="bg-slate-50 font-bold text-black" />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1 block mb-1">Quantity to Charge</label>
                            <Input 
                                type="number" 
                                value={chargeQty} 
                                onChange={e => setChargeQty(Number(e.target.value))} 
                                max={chargeData?.running_balance}
                                className="font-black text-black"
                            />
                            <p className="text-xs text-slate-400 font-bold mt-1 pl-1">Max available: {chargeData?.running_balance}</p>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setChargeOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleChargeConfirm} disabled={charging} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
                            {charging ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Charge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
