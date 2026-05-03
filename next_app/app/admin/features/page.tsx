'use client';

import { useState, useEffect } from 'react';
import { callApi } from '@/lib/frappeClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, RefreshCw, Zap, AlertTriangle, Loader2, CheckCircle2, XCircle, Search, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CATEGORY_META: Record<string, { color: string; bg: string; label: string }> = {
    platform: { color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100',   label: 'Platform' },
    modules:  { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Modules' },
    billing:  { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', label: 'Billing' },
    security: { color: 'text-red-600',    bg: 'bg-red-50 border-red-100',    label: 'Security' },
};

export default function FeatureFlagsPage() {
    const { toast } = useToast();
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [maintenance, setMaintenance] = useState(false);

    useEffect(() => { fetchFlags(); }, []);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const data: any[] = await callApi('mandigrow.api.get_feature_flags') || [];
            setFlags(data);
            const mm = data.find(f => f.flag_key === 'maintenance_mode');
            setMaintenance(!!mm?.is_enabled);
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally { setLoading(false); }
    };

    const seedFlags = async () => {
        setSeeding(true);
        try {
            const result: any = await callApi('mandigrow.api.seed_feature_flags');
            toast({ title: `✓ Seeded ${result.seeded} flags`, description: `${result.total} flags total in system.` });
            await fetchFlags();
        } catch (e: any) {
            toast({ title: 'Seed Failed', description: e.message, variant: 'destructive' });
        } finally { setSeeding(false); }
    };

    const toggleFlag = async (flagKey: string, currentValue: boolean) => {
        // Safety: warn before disabling security flags
        if (flagKey === 'multi_tenant_isolation' && currentValue) {
            toast({ title: '🔒 Cannot Disable', description: 'Multi-tenant isolation is a security constraint and cannot be turned off.', variant: 'destructive' });
            return;
        }
        if (flagKey === 'maintenance_mode' && !currentValue) {
            if (!window.confirm('⚠️ Enable Maintenance Mode?\n\nThis will IMMEDIATELY lock ALL tenant access. Users will see a maintenance screen. Type OK to confirm.')) return;
        }

        setToggling(flagKey);
        try {
            await callApi('mandigrow.api.toggle_feature_flag', { flag_key: flagKey, is_enabled: currentValue ? 0 : 1 });
            toast({ title: `Flag ${currentValue ? 'Disabled' : 'Enabled'}`, description: `${flagKey} → ${currentValue ? 'OFF' : 'ON'}` });
            await fetchFlags();
        } catch (e: any) {
            toast({ title: 'Toggle Failed', description: e.message, variant: 'destructive' });
        } finally { setToggling(null); }
    };

    const filtered = flags.filter(f =>
        !search || f.label?.toLowerCase().includes(search.toLowerCase()) ||
        f.flag_key?.toLowerCase().includes(search.toLowerCase()) ||
        f.category?.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = filtered.reduce((acc: Record<string, any[]>, f) => {
        const cat = f.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(f);
        return acc;
    }, {});

    return (
        <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-yellow-500" /> FEATURE FLAGS
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Safe rollouts, emergency kill switches & per-tenant module control. All flags are database-driven.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchFlags} variant="outline" size="sm" className="rounded-xl">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    {flags.length === 0 && !loading && (
                        <Button onClick={seedFlags} disabled={seeding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl">
                            {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                            Seed Default Flags
                        </Button>
                    )}
                </div>
            </div>

            {/* Emergency Kill Switch Banner */}
            <div className={cn(
                "rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all",
                maintenance ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", maintenance ? "bg-red-100" : "bg-white border border-slate-200")}>
                        <AlertTriangle className={`w-5 h-5 ${maintenance ? 'text-red-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase tracking-tight text-slate-800">Emergency Kill Switch</p>
                        <p className="text-xs text-slate-500 font-medium">Maintenance Mode immediately locks all tenant access.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={maintenance ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                        {maintenance ? '🔴 PLATFORM DOWN' : '🟢 PLATFORM ONLINE'}
                    </Badge>
                    <Button
                        size="sm"
                        variant={maintenance ? "destructive" : "outline"}
                        className="rounded-xl font-black text-xs uppercase tracking-widest"
                        onClick={() => toggleFlag('maintenance_mode', maintenance)}
                        disabled={toggling === 'maintenance_mode'}
                    >
                        {toggling === 'maintenance_mode' ? <Loader2 className="w-3 h-3 animate-spin" /> : (maintenance ? 'Restore Access' : 'Activate Lockdown')}
                    </Button>
                </div>
            </div>

            {/* Search */}
            {flags.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search flags..."
                        className="pl-10 bg-white border-slate-200 rounded-xl"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            )}

            {/* Flag Groups */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : flags.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Database className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="font-black text-slate-500 uppercase tracking-widest text-xs mb-2">No feature flags found in database.</p>
                    <p className="text-slate-400 text-sm mb-6">Click "Seed Default Flags" to initialize the system with defaults.</p>
                    <Button onClick={seedFlags} disabled={seeding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl px-8">
                        {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                        Seed Default Flags
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([category, categoryFlags]) => {
                        const meta = CATEGORY_META[category] || { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', label: category };
                        return (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className={cn("text-[10px] uppercase font-black px-3 py-1 border", meta.bg, meta.color)}>
                                        {meta.label}
                                    </Badge>
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-xs text-slate-400 font-bold">{categoryFlags.length} flags</span>
                                </div>
                                <div className="space-y-2">
                                    {categoryFlags.map(flag => {
                                        const isOn = !!flag.is_enabled;
                                        const isLocked = flag.flag_key === 'multi_tenant_isolation';
                                        const isTogglingThis = toggling === flag.flag_key;
                                        return (
                                            <div key={flag.flag_key} className={cn(
                                                "bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all",
                                                isOn ? "border-slate-200" : "border-slate-100 opacity-70",
                                                isLocked && "border-red-100"
                                            )}>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", isOn ? "bg-emerald-500" : "bg-slate-300")} />
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-900 text-sm truncate">{flag.label}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{flag.flag_key}</p>
                                                        {flag.description && (
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{flag.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {isLocked && <Shield className="w-4 h-4 text-red-400" title="Security constraint — cannot be disabled" />}
                                                    <button
                                                        disabled={isTogglingThis || isLocked}
                                                        onClick={() => toggleFlag(flag.flag_key, isOn)}
                                                        className={cn(
                                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                                            isOn ? "bg-emerald-500" : "bg-slate-200",
                                                            (isTogglingThis || isLocked) && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                                            isOn ? "translate-x-6" : "translate-x-1"
                                                        )} />
                                                    </button>
                                                    {isOn
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        : <XCircle className="w-4 h-4 text-slate-300" />
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
