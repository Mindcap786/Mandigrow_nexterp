"use client";

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
import { useEffect, useState } from "react";
import { callApi } from "@/lib/frappeClient";
 // proxy fallback
import { usePermission } from "@/hooks/use-permission";
import { SettingsSkeleton } from "@/components/settings/settings-skeleton";
import {
    Loader2, Save, Eye, EyeOff, Lock, Settings2,
    RefreshCw, Trash2, Plus, Terminal, Package, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { isNativePlatform, isMobileAppView } from "@/lib/capacitor-utils";
import { NativeCard } from "@/components/mobile/NativeCard";
import { NativeSectionLabel } from "@/components/mobile/NativeInput";

// ─────────────────────────────────────────────────────────
// Schema architecture:
//   mandi schema     → mandi.field_configs, mandi.storage_locations, etc.
//   wholesale schema → wholesale.field_configs, etc.
//   core schema      → core.seed_default_field_configs (cross-domain utility)
// ─────────────────────────────────────────────────────────

export default function FieldSettingsPage() {
    const { toast } = useToast();
    const { profile, loading: rbacLoading } = usePermission();
    const isMandi = true;

    // Domain-specific Supabase query chain
    const db = supabase.schema(isMandi ? 'mandi' : 'wholesale');

    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [newField, setNewField] = useState({ module_id: "arrivals_direct", field_key: "", label: "" });

    // Storage Points (mandi only)
    const [storageLocations, setStorageLocations] = useState<any[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: "", type: "warehouse" as string, address: "" });
    const [editingLocId, setEditingLocId] = useState<string | null>(null);
    const [editingLoc, setEditingLoc] = useState({ name: "", type: "warehouse", address: "" });

    // Confirmation Dialog States
    const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
    const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

    useEffect(() => {
        if (rbacLoading) return;
        if (profile?.organization_id) {
            fetchConfigs();
            if (isMandi) fetchStorageLocations();
        } else {
            setLoading(false);
        }
    }, [profile, rbacLoading]);

    // ─── FETCH: frappe get_all_field_configs ───
    const fetchConfigs = async () => {
        if (!profile?.organization_id) return;
        setLoading(true);
        try {
            const data: any = await callApi('mandigrow.api.get_all_field_configs');
            const excludedFields = ['variety', 'grade', 'barcode'];
            setConfigs((data || []).filter((c: any) => !excludedFields.includes(c.field_key)));
        } catch (err: any) {
            console.error("fetchConfigs error:", err);
            toast({ title: "Error loading fields", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ─── RESTORE DEFAULTS: frappe seed_default_field_configs ───
    // Purpose: RECOVERY TOOL — restores any missing system fields from the master template
    // (mandi1 org). Does NOT overwrite existing configs (ON CONFLICT DO NOTHING).
    // Fields are auto-seeded on org creation; this button is only needed if someone
    // accidentally deleted system fields or if new system fields were added to the template.
    const handleReset = async () => {
        setResetConfirmOpen(true);
    };

    const performReset = async () => {
        setResetConfirmOpen(false);
        setLoading(true);
        try {
            const res: any = await callApi('mandigrow.api.seed_default_field_configs');
            if (!res || res.error) throw new Error(res?.error || "Failed to seed fields");
            
            toast({ title: "✅ System fields restored!", description: "Missing default fields have been added back." });
            await fetchConfigs();
        } catch (err: any) {
            console.error("Seed error:", err);
            toast({ title: "Error restoring defaults", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // ─── SAVE: Update each field config via Frappe API ───
    const saveChanges = async () => {
        setSaving(true);
        try {
            const res: any = await callApi('mandigrow.api.update_field_configs', { configs });
            if (!res || res.error) throw new Error(res?.error || "Failed to save configs");
            
            toast({ title: "✅ Policies Enforced", description: "All users in your organization will now follow these rules." });
            setConfigs([...configs]); 
        } catch (err: any) {
            console.error("Save error:", err);
            toast({ title: "Save failed", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // ─── ADD FIELD: Insert via Frappe API ───
    const handleAddField = async () => {
        if (!newField.field_key || !newField.label) {
            toast({ title: "Missing info", description: "Key and Label are required.", variant: "destructive" });
            return;
        }

        try {
            const res: any = await callApi('mandigrow.api.add_field_config', { config: newField });
            if (!res || res.error) throw new Error(res?.error || "Failed to add field");
            
            setConfigs([...configs, res.data]);
            setAddOpen(false);
            setNewField({ module_id: "arrivals_direct", field_key: "", label: "" });
            toast({ title: "Field Added", description: "It is visible but optional by default." });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // ─── DELETE: Remove via Frappe API ───
    const handleDeleteField = async (id: string) => {
        try {
            const res: any = await callApi('mandigrow.api.delete_field_config', { id });
            if (!res || res.error) throw new Error(res?.error || "Failed to delete field");
            
            setConfigs(configs.filter(c => c.id !== id));
            toast({ title: "Field Removed" });
        } catch (err: any) {
            toast({ title: "Error deleting", description: err.message, variant: "destructive" });
        } finally {
            setFieldToDelete(null);
        }
    };

    const removeField = (id: string) => {
        setFieldToDelete(id);
    };

    const confirmRemoveField = () => {
        if (fieldToDelete) handleDeleteField(fieldToDelete);
    };

    // ─── Local toggles (not saved until Apply Policies is clicked) ───
    const toggleField = (id: string, key: 'is_visible' | 'is_mandatory') =>
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, [key]: !c[key] } : c));

    const updateDefaultValue = (id: string, value: string) =>
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, default_value: value } : c));

    // ─── Storage Locations ───
    const fetchStorageLocations = async () => {
        setLocationsLoading(true);
        try {
            const data: any = await callApi('mandigrow.api.get_storage_locations');
            setStorageLocations(data || []);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLocationsLoading(false);
        }
    };

    const handleAddLocation = async () => {
        if (!newLocation.name.trim()) return;
        try {
            const res: any = await callApi('mandigrow.api.add_storage_location', { location: newLocation });
            if (!res || res.error) throw new Error(res?.error || "Failed to add location");
            
            setStorageLocations([res.data, ...storageLocations]);
            setNewLocation({ name: "", type: "warehouse", address: "" });
            toast({ title: "Location Added" });
        } catch (err: any) {
            toast({ title: "Error adding location", description: err.message, variant: "destructive" });
        }
    };

    const toggleLocationStatus = async (id: string, current: boolean) => {
        const res: any = await callApi('mandigrow.api.toggle_storage_location', { id, is_active: current ? 0 : 1 });
        if (res.error) toast({ title: 'Error', description: res.error, variant: 'destructive' });
        else setStorageLocations(prev => prev.map(l => l.id === id ? { ...l, is_active: !current } : l));
    };

    const startRename = (loc: any) => {
        setEditingLocId(loc.id);
        setEditingLoc({ name: loc.name, type: loc.type || 'warehouse', address: loc.address || '' });
    };

    const saveRename = async (id: string) => {
        if (!editingLoc.name.trim()) return;
        try {
            const res: any = await callApi('mandigrow.api.update_storage_location', { id, location: editingLoc });
            if (!res || res.error) throw new Error(res?.error || "Failed to update location");
            
            setStorageLocations(prev => prev.map(l => l.id === id ? { ...l, name: editingLoc.name.trim(), type: editingLoc.type, address: editingLoc.address.trim() } : l));
            setEditingLocId(null);
            toast({ title: '✅ Updated' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const deleteLocation = async (id: string) => {
        setLocationToDelete(id);
    };

    const confirmDeleteLocation = async () => {
        if (!locationToDelete) return;
        const id = locationToDelete;
        setLocationToDelete(null);
        try {
            const res: any = await callApi('mandigrow.api.delete_storage_location', { id });
            if (!res || res.error) throw new Error(res?.error || "Failed to delete location");
            
            setStorageLocations(prev => prev.filter(l => l.id !== id));
            toast({ title: '✅ Location Deleted' });
        } catch (err: any) {
            if (err.message.includes('foreign key constraint') || err.message.includes('Linked')) {
                toast({ 
                    title: 'System Protected', 
                    description: 'This storage point has existing inventory history. Please toggle it "Offline" instead of deleting.', 
                    variant: 'destructive' 
                });
            } else {
                toast({ title: 'Error', description: err.message, variant: 'destructive' });
            }
        }
    };

    // ─── Render helpers ───
    const renderModuleTable = (module: string) => {
        const moduleConfigs = configs.filter(c => c.module_id === module);
        const defaultCount = moduleConfigs.filter(c => c.is_default).length;
        const customCount = moduleConfigs.filter(c => !c.is_default).length;
        return (
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                {/* Module stats bar */}
                <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fields:</span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                        ✦ {defaultCount} Default
                    </span>
                    {customCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                            ★ {customCount} Custom
                        </span>
                    )}
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="p-6">Field Name</th>
                            <th className="p-6">Default Value</th>
                            <th className="p-6 text-center">Visibility</th>
                            <th className="p-6 text-center">Mandatory</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {moduleConfigs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    No fields configured for this module.
                                </td>
                            </tr>
                        ) : (
                            moduleConfigs.map(config => (
                                <motion.tr key={config.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className={`hover:bg-slate-50/50 transition-colors group ${!config.is_default ? 'bg-amber-50/20' : ''}`}>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-800">
                                                {config.field_key === 'unit_weight' ? 'Weight / Unit' : config.label}
                                            </span>
                                            {config.is_default ? (
                                                <span className="inline-flex items-center bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                                    ✦ Default
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                                    ★ Custom
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono italic">{config.field_key}</span>
                                    </td>
                                    <td className="p-6">
                                        <Input value={config.default_value || ''} onChange={(e) => updateDefaultValue(config.id, e.target.value)}
                                            placeholder="None" className="bg-slate-50 border-slate-200 h-10 rounded-xl text-sm" />
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            {config.is_visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-red-500" />}
                                            <Switch checked={config.is_visible} onCheckedChange={() => toggleField(config.id, 'is_visible')} className="data-[state=checked]:bg-emerald-600" />
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            {config.is_mandatory ? <Lock className="w-4 h-4 text-amber-500" /> : <div className="w-4" />}
                                            <Switch disabled={!config.is_visible} checked={config.is_mandatory} onCheckedChange={() => toggleField(config.id, 'is_mandatory')} className="data-[state=checked]:bg-amber-500" />
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {config.is_default ? (
                                                // Default fields can't be deleted — show lock icon
                                                <span className="text-[9px] text-slate-300 uppercase tracking-widest font-bold">System Field</span>
                                            ) : (
                                                // Custom fields can be deleted
                                                <Button variant="ghost" size="icon" onClick={() => removeField(config.id)}
                                                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const SharedDialogs = () => (
        <>
            {/* Delete Location Confirmation Dialog */}
            <Dialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
                <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Remove Storage Point?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">
                        Are you sure you want to remove this storage point? This action cannot be undone.
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setLocationToDelete(null)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteLocation} className="rounded-xl">Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Field Confirmation Dialog */}
            <Dialog open={!!fieldToDelete} onOpenChange={(open) => !open && setFieldToDelete(null)}>
                <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Remove Field?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">
                        Are you sure you want to remove this field from governance?
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setFieldToDelete(null)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={confirmRemoveField} className="rounded-xl">Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Confirmation Dialog */}
            <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
                <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Restore System Defaults?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">
                        This will add back any missing system fields from the master template.<br/><br/>
                        Your existing field configurations and custom fields will <strong>NOT</strong> be changed.
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setResetConfirmOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" onClick={performReset}>Restore Fields</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );

    if (loading || rbacLoading) return <SettingsSkeleton />;

    const modules = Array.from(new Set(configs.map(c => c.module_id)));
    const ARRIVAL_TYPES = ['arrivals_direct', 'arrivals_farmer', 'arrivals_supplier'];
    const hasSales = modules.includes('sales');
    const hasExpenses = modules.includes('expenses');
    const hasGateEntry = modules.includes('gate_entry');
    const otherModules = modules.filter(m =>
        !m.startsWith('arrivals') && m !== 'sales' && m !== 'gate_entry' && m !== 'expenses'
    ).sort();

    if (isMobileAppView()) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] pb-24">
                {/* Mobile Header */}
                <div className="bg-white px-4 py-6 border-b border-slate-100 shadow-sm sticky top-0 z-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Settings2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">Governance</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    {isMandi ? 'Mandi' : 'Wholesale'} Field Policies
                                </p>
                            </div>
                        </div>
                        <Button onClick={saveChanges} disabled={saving || configs.length === 0}
                            size="sm"
                            className="bg-emerald-600 text-white font-black uppercase tracking-widest px-4 h-10 rounded-xl shadow-lg shadow-emerald-200">
                            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                        </Button>
                    </div>

                    <Tabs defaultValue="storage" className="w-full">
                        <TabsList className="bg-slate-100/50 border border-slate-200 p-1 rounded-2xl h-11 w-full shadow-inner">
                            {isMandi && (
                                <TabsTrigger value="storage"
                                    className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                    Storage
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="fields"
                                className="flex-1 rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                Field Logic
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="fields" className="mt-6 space-y-8">
                            {configs.length === 0 ? (
                                <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 mt-10">
                                    <Terminal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No fields configured</p>
                                    <Button onClick={handleReset} size="sm" className="mt-4 bg-emerald-600">Restore Defaults</Button>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Logic: Module by Module */}
                                    {['arrivals_direct', 'arrivals_farmer', 'arrivals_supplier', 'sales', 'gate_entry', 'expenses', ...otherModules].map(module => {
                                        const moduleConfigs = configs.filter(c => c.module_id === module);
                                        if (moduleConfigs.length === 0) return null;

                                        return (
                                            <div key={module} className="space-y-4">
                                                <NativeSectionLabel>
                                                    {module.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </NativeSectionLabel>
                                                <div className="space-y-4">
                                                    {moduleConfigs.map(config => (
                                                        <NativeCard key={config.id} className="p-4 space-y-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-bold text-sm text-slate-900 leading-tight">{config.label}</p>
                                                                        {config.is_default ? (
                                                                            <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">System</span>
                                                                        ) : (
                                                                            <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Custom</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{config.field_key}</p>
                                                                </div>
                                                                {!config.is_default && (
                                                                    <button onClick={() => removeField(config.id)} className="p-1.5 text-slate-300 hover:text-red-500">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                                                <div className="space-y-2">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visible</p>
                                                                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                                                                        {config.is_visible ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                                                                        <Switch checked={config.is_visible} onCheckedChange={() => toggleField(config.id, 'is_visible')} className="scale-75" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mandatory</p>
                                                                    <div className={cn(
                                                                        "flex items-center justify-between px-3 py-2 rounded-xl",
                                                                        config.is_visible ? "bg-slate-50 text-slate-900" : "bg-slate-50/50 text-slate-300"
                                                                    )}>
                                                                        <Lock className={cn("w-3.5 h-3.5", config.is_mandatory ? "text-amber-500" : "opacity-20")} />
                                                                        <Switch disabled={!config.is_visible} checked={config.is_mandatory} onCheckedChange={() => toggleField(config.id, 'is_mandatory')} className="scale-75" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Default Value</p>
                                                                <Input 
                                                                    value={config.default_value || ''} 
                                                                    onChange={(e) => updateDefaultValue(config.id, e.target.value)}
                                                                    placeholder="Constant value (optional)" 
                                                                    className="h-10 text-xs bg-slate-50 border-none rounded-xl" 
                                                                />
                                                            </div>
                                                        </NativeCard>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="storage" className="mt-6 space-y-6 px-0.5">
                             <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-4">
                                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest mb-1">Target Nodes</p>
                                <p className="text-[10px] text-blue-600/70 font-medium">Define nodes for stock inward.</p>
                             </div>

                             <div className="space-y-4">
                                {storageLocations.map(loc => {
                                    const isDefault = loc.name === 'Mandi (Yard)';
                                    return (
                                        <NativeCard key={loc.id} className={cn("p-4", !loc.is_active && "opacity-50 grayscale")}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", loc.is_active ? "bg-blue-500" : "bg-slate-300")} />
                                                    <h3 className="font-bold text-slate-900">{loc.name}</h3>
                                                </div>
                                                <Switch checked={loc.is_active} onCheckedChange={() => toggleLocationStatus(loc.id, loc.is_active)} className="scale-90" />
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                                                    {isDefault ? 'SYS-DEFAULT' : (loc.location_type || 'warehouse')}
                                                </span>
                                                {!isDefault && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startRename(loc)} className="p-1.5 text-blue-400"><Settings className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => deleteLocation(loc.id)} className="p-1.5 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </NativeCard>
                                    );
                                })}
                             </div>

                             <Button onClick={() => setAddOpen(true)} className="w-full bg-blue-600 h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 mt-4">
                                <Plus className="w-5 h-5 mr-2" /> Add Storage Point
                             </Button>
                        </TabsContent>
                    </Tabs>
                </div>
                <SharedDialogs />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-[0.15em] uppercase flex items-center gap-3">
                        <Settings2 className="w-10 h-10 text-emerald-600" />
                        <span className="text-emerald-600 text-3xl opacity-30 font-medium">/</span>
                        Governance
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">
                        Field policies for <span className="text-emerald-600">{isMandi ? 'mandi' : 'wholesale'}</span> schema → applies to all users in your organization.
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
 
 
                     <Button onClick={saveChanges} disabled={saving || configs.length === 0}
                        className="bg-emerald-600 text-white font-black uppercase tracking-widest px-8 h-12 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                        {saving ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                        Apply Policies
                    </Button>
                </div>
            </header>
 
            {/* Schema info banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
                <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
                        {isMandi ? 'mandi' : 'wholesale'} schema → Organization-Wide Policies
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        Changes apply to <strong>all users in your organization only</strong>. Each customer's configuration is fully isolated — your changes never affect other businesses.
                    </p>
                </div>
            </div>
 
            <Tabs defaultValue="storage" className="space-y-8">
                <TabsList className="bg-slate-100/50 border border-slate-200 p-1.5 rounded-3xl h-14 w-full md:w-auto shadow-inner">
                    {isMandi && (
                        <TabsTrigger value="storage"
                            className="rounded-2xl px-10 font-bold uppercase tracking-widest text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                            Storage Points
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="fields"
                        className="rounded-2xl px-10 font-bold uppercase tracking-widest text-[11px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                        Field Logic
                    </TabsTrigger>
                </TabsList>
 
                {/* ─── FIELD LOGIC TAB ─── */}
                <TabsContent value="fields" className="space-y-12">
                    {configs.length === 0 ? (
                        <div className="p-20 text-center border border-dashed border-slate-200 rounded-[40px] bg-slate-50/50">
                            <Terminal className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-slate-900 font-bold uppercase tracking-widest text-sm">No Fields Found</h3>
                            <p className="text-slate-500 text-xs mt-2 font-medium max-w-sm mx-auto">
                                System fields may have been removed. Click <strong>"Restore Defaults"</strong> to recover all standard fields from the master template.
                            </p>
                            <Button onClick={handleReset} disabled={loading}
                                className="mt-6 bg-emerald-600 text-white font-black uppercase h-12 px-8 rounded-2xl">
                                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                                Restore System Defaults
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Arrivals section */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-600 rounded-full" /> Arrivals Module
                                </h2>
                                <Tabs defaultValue="arrivals_direct" className="w-full">
                                    <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-2xl h-12 mb-4 w-full md:w-auto">
                                        {[
                                            ['arrivals_direct', 'Direct Purchase'],
                                            ['arrivals_farmer', 'Farmer Commission'],
                                            ['arrivals_supplier', 'Supplier Commission']
                                        ].map(([val, label]) => (
                                            <TabsTrigger key={val} value={val}
                                                className="rounded-xl px-6 font-bold uppercase text-[9px] tracking-wider data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                                {label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {ARRIVAL_TYPES.map(m => (
                                        <TabsContent key={m} value={m} className="mt-0">
                                            {renderModuleTable(m)}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </section>
 
                            {/* Sales */}
                            {hasSales && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-2 h-8 bg-indigo-600 rounded-full" /> Sale Invoice Module
                                    </h2>
                                    {renderModuleTable('sales')}
                                </section>
                            )}
 
                            {/* Gate Entry */}
                            {hasGateEntry && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-2 h-8 bg-purple-600 rounded-full" /> Gate Entry Module
                                    </h2>
                                    {renderModuleTable('gate_entry')}
                                </section>
                            )}
 
                            {/* Expenses */}
                            {hasExpenses && (
                                <section className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-2 h-8 bg-orange-500 rounded-full" /> Expenses Module
                                    </h2>
                                    {renderModuleTable('expenses')}
                                </section>
                            )}
 
                            {/* Any other modules */}
                            {otherModules.map(module => (
                                <section key={module} className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <span className="w-2 h-8 bg-slate-400 rounded-full" />
                                        {module.replace(/_/g, ' ')} Module
                                    </h2>
                                    {renderModuleTable(module)}
                                </section>
                            ))}
                        </>
                    )}
                </TabsContent>
 
                {/* ─── STORAGE POINTS TAB (mandi only) ─── */}
                {isMandi && (
                    <TabsContent value="storage" className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Logistics Infrastructure</h2>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">
                                    Define target nodes for stock inward.
                                </p>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleAddLocation(); }}
                                className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                                <Input placeholder="Warehouse/Shop Name" value={newLocation.name}
                                    onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                                    className="bg-white border-slate-200 h-14 rounded-2xl shadow-sm font-bold" maxLength={40} />
                                <Select value={newLocation.type} onValueChange={(v: any) => setNewLocation({ ...newLocation, type: v })}>
                                    <SelectTrigger className="bg-white border-slate-200 h-14 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent className="z-[9999] bg-white border-slate-200">
                                        <SelectItem value="Warehouse">Warehouse / Shop</SelectItem>
                                        <SelectItem value="Transit Hub">Transit Hub</SelectItem>
                                        <SelectItem value="Virtual">Virtual / Cloud</SelectItem>
                                        <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Address (Optional)" value={newLocation.address}
                                    onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                                    className="bg-white border-slate-200 h-14 rounded-2xl shadow-sm text-xs" maxLength={100} />
                                <Button type="submit" disabled={!newLocation.name.trim()}
                                    className="bg-blue-600 text-white font-black uppercase h-14 px-8 rounded-2xl shrink-0 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> Deploy Point
                                </Button>
                            </form>
                        </div>
 
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storageLocations.slice().sort((a, b) => {
                                if (a.name === 'Mandi') return -1;
                                if (b.name === 'Mandi') return 1;
                                if (a.name === 'Cold Storage') return -1;
                                if (b.name === 'Cold Storage') return 1;
                                return a.name.localeCompare(b.name);
                            }).map(loc => {
                                const isDefault = false; // All points are now database records and can be managed by the user
                                const isEditing = editingLocId === loc.id;
                                return (
                                    <motion.div key={loc.id} layout
                                        className={cn(
                                            "bg-white p-6 rounded-[32px] border shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all",
                                            isDefault ? "border-blue-200 bg-blue-50/30" : "border-slate-200",
                                            !loc.is_active && "opacity-60 grayscale bg-slate-50"
                                        )}>
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="space-y-1 flex-1 mr-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", loc.is_active ? "bg-blue-500" : "bg-slate-300", isDefault && loc.is_active && "animate-pulse")} />
                                                    <span className={cn("text-[8px] font-black uppercase tracking-widest", isDefault ? "text-blue-500" : "text-slate-400")}>
                                                        {isDefault ? 'Standard Point' : (loc.is_active ? (loc.location_type || 'Warehouse') : 'Offline')}
                                                    </span>
                                                </div>
                                                {isEditing ? (
                                                    <div className="space-y-3 mt-2">
                                                        <Input autoFocus value={editingLoc.name}
                                                            onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                                                            className="text-base font-bold border-blue-400 bg-white h-10" maxLength={40} />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Select value={editingLoc.type} onValueChange={(v: any) => setEditingLoc({ ...editingLoc, type: v })}>
                                                                <SelectTrigger className="h-9 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="z-[9999] bg-white">
                                                                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                                                                    <SelectItem value="Transit Hub">Transit Hub</SelectItem>
                                                                    <SelectItem value="Virtual">Virtual</SelectItem>
                                                                    <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <div className="flex gap-1">
                                                                <Button size="sm" onClick={() => saveRename(loc.id)} className="bg-emerald-600 h-9 flex-1">✓</Button>
                                                                <Button size="sm" variant="outline" onClick={() => setEditingLocId(null)} className="h-9 flex-1">✕</Button>
                                                            </div>
                                                        </div>
                                                        <Input placeholder="Update Address" value={editingLoc.address}
                                                            onChange={e => setEditingLoc({ ...editingLoc, address: e.target.value })} className="h-9 text-[10px]" />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight break-words leading-tight">{loc.name}</h3>
                                                        {loc.address && <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic">{loc.address}</p>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                {!isEditing && (
                                                    <Button size="icon" variant="ghost" onClick={() => startRename(loc)}
                                                        className="h-8 w-8 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-blue-50">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </Button>
                                                )}
                                                {!isEditing && (
                                                    <Button size="icon" variant="ghost" onClick={() => deleteLocation(loc.id)}
                                                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between relative z-10">
                                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                                                {isDefault ? 'SYS-DEFAULT' : loc.id.split('-')[0]}
                                            </span>
                                            <Switch checked={loc.is_active} onCheckedChange={() => toggleLocationStatus(loc.id, loc.is_active)}
                                                className="data-[state=checked]:bg-blue-600" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
 
                        {storageLocations.length === 0 && !locationsLoading && (
                            <div className="p-20 text-center border border-dashed border-slate-200 rounded-[40px] bg-slate-50/50">
                                <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-slate-900 font-bold uppercase tracking-widest text-xs">No Storage Infrastructure Deployed</h3>
                                <p className="text-slate-500 text-[10px] mt-2 font-black uppercase italic tracking-[0.2em]">
                                    Use the form above to deploy your first storage point.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>
            <SharedDialogs />
        </div>
    );
}
