"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Plus, Search, Scale, Package, ChevronRight, User } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";
import { formatCommodityName } from "@/lib/utils/commodity-utils";
import { callApi } from "@/lib/frappeClient";
import { calculateSaleTotals } from "@/lib/sales-tax";

import { useMandiSession, MandiSessionInput, MandiSessionFarmerRow, computeFarmerRow } from "@/hooks/mandi/useMandiSession";
import { AddedFarmerCard } from "./farmer-row";
import { SummaryPanel } from "./summary-panel";
import { SessionBillsView } from "./session-bills-view";

const generateUUID = () => crypto.randomUUID();

const STANDARD_UNITS = ["Box", "Crate", "Kgs", "Tons", "Nug", "Pieces", "Carton"];

export function MandiCommissionForm() {
    const { profile } = useAuth();
    const { toast } = useToast();
    const { isCommitting, commitSession, fetchSessionDetail } = useMandiSession();

    // Session Metadata
    const [lotNo, setLotNo] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");

    // ─────────────────────────────────────────────────────────────
    // Master Data State
    // ─────────────────────────────────────────────────────────────
    const [farmers, setFarmers] = useState<any[]>([]);
    const [buyers, setBuyers] = useState<any[]>([]);
    const [commodities, setCommodities] = useState<any[]>([]);
    const [units, setUnits] = useState<string[]>(STANDARD_UNITS);
    const [globalUnit, setGlobalUnit] = useState<string>("Box");
    const [settings, setSettings] = useState<any>(null);

    // ─────────────────────────────────────────────────────────────
    // Form Variables
    // ─────────────────────────────────────────────────────────────
    const [sessionDate, setSessionDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

    // The list of COMMITTED local rows for this session
    const [rows, setRows] = useState<MandiSessionFarmerRow[]>([]);
    
    // The active, DRAFT row being edited in the Master-Detail right pane
    const [currentRow, setCurrentRow] = useState<Partial<MandiSessionFarmerRow>>({});

    const [buyerId, setBuyerId] = useState<string | null>(null);
    const [buyerLoading, setBuyerLoading] = useState<number>(0);
    const [buyerPacking, setBuyerPacking] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [cratePage, setCratePage] = useState(1);
    const CRATES_PER_PAGE = 10;

    const [committedSessionData, setCommittedSessionData] = useState<any>(null);

    const [crateTypes, setCrateTypes] = useState<any[]>([]);
    const [cratesEnabled, setCratesEnabled] = useState(false);
    const [crateCart, setCrateCart] = useState<any[]>([]);

    // Refs for keyboard navigation
    const farmerSearchRef = useRef<HTMLButtonElement>(null);
    const itemSearchRef = useRef<HTMLButtonElement>(null);
    const qtyRef = useRef<HTMLInputElement>(null);
    const rateRef = useRef<HTMLInputElement>(null);
    const lessPercentRef = useRef<HTMLInputElement>(null);
    const lessUnitsRef = useRef<HTMLInputElement>(null);
    const loadingRef = useRef<HTMLInputElement>(null);
    const otherChargesRef = useRef<HTMLInputElement>(null);
    const commPctRef = useRef<HTMLInputElement>(null);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    const buyerSearchRef = useRef<HTMLButtonElement>(null);
    const buyerLoadingRef = useRef<HTMLInputElement>(null);
    const buyerPackingRef = useRef<HTMLInputElement>(null);
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    // ─────────────────────────────────────────────────────────────
    // Initial Load
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!profile?.organization_id) return;
        const loadMasterData = async () => {
            try {
                const res: any = await callApi('mandigrow.api.get_master_data');
                const data = res;
                if (!data) return;

                if (data.contacts) {
                    setFarmers(data.contacts.filter((c: any) => {
                        const type = (c.type || "").toLowerCase();
                        return type === 'farmer' || type === 'supplier' || type === 'both';
                    }));
                    setBuyers(data.contacts.filter((c: any) => {
                        const type = (c.type || "").toLowerCase();
                        return type === 'buyer' || type === 'customer' || type === 'both';
                    }));
                }
                if (data.commodities) setCommodities(data.commodities);
                if (data.settings) {
                    setSettings(data.settings);
                    resetCurrentRow(data.settings.commission_rate_default);
                }
                if (data.units) {
                    setUnits(Array.from(new Set([...STANDARD_UNITS, ...data.units, "Kg"])));
                }
                if (data.crate_types) {
                    setCrateTypes(data.crate_types);
                }
            } catch (err) {
                console.error("Master Data Load Error:", err);
            }
        };
        loadMasterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // ─────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────
    const resetCurrentRow = (defaultComm = settings?.commission_rate_default || 0) => {
        setCurrentRow(prev => ({
            id: generateUUID(),
            farmerId: prev.farmerId || "",
            farmerName: prev.farmerName || "",
            itemId: "",
            itemName: "",
            internalCode: "",
            qty: 0,
            unit: globalUnit,
            rate: 0,
            lessPercent: 0,
            lessUnits: 0,
            loadingCharges: 0,
            otherCharges: 0,
            commissionPercent: defaultComm,
            grossAmount: 0,
            lessAmount: 0,
            netAmount: 0,
            commissionAmount: 0,
            netPayable: 0,
            netQty: 0,
        }));
        
        // Auto-focus first field when resetting
        setTimeout(() => {
            farmerSearchRef.current?.focus();
        }, 50);
    };

    const handleCurrentRowChange = useCallback(
        (field: keyof MandiSessionFarmerRow, value: any, editedField?: "lessPercent" | "lessUnits") => {
            setCurrentRow(prev => {
                const patch: Partial<MandiSessionFarmerRow> & { _lastEdited?: string } = {
                    ...prev,
                    [field]: value,
                    _lastEdited: editedField,
                };
                return computeFarmerRow(patch) as Partial<MandiSessionFarmerRow>;
            });
        },
        []
    );

    const handleFarmerSelect = useCallback(
        (farmerId: string) => {
            const farmer = farmers.find((f) => f.id === farmerId);
            const isUnregistered = !(farmer?.gstin && farmer.gstin.trim() !== "");
            setCurrentRow(prev => computeFarmerRow({
                ...prev,
                farmerId,
                farmerName: farmer?.name || "",
                isUnregisteredFarmer: isUnregistered,
            }) as Partial<MandiSessionFarmerRow>);
        },
        [farmers]
    );

    const handleItemSelect = useCallback(
        (itemId: string) => {
            const item = commodities.find((i) => i.id === itemId);
            setCurrentRow(prev => computeFarmerRow({
                ...prev,
                itemId,
                itemName: item?.name || "",
                internalCode: item?.internal_id || "",
                unit: item?.default_unit || globalUnit,
                gstRate: item?.gst_rate || 0,
                saleGstType: item?.sale_gst_type || 'Exclusive',
                gstEnabled: settings?.gst_enabled === true || settings?.gst_enabled === "true" || settings?.gst_enabled === 1 || settings?.gst_enabled === "1",
                hsnCode: item?.hsn_code || "",
            }) as Partial<MandiSessionFarmerRow>);
        },
        [commodities, globalUnit, settings]
    );

    const handleAddRow = () => {
        if (!currentRow.farmerId || !currentRow.itemId || !currentRow.qty || !currentRow.rate) {
            toast({ title: "Validation Check", description: "Farmer, Item, Qty, and Rate are required to add.", variant: "destructive" });
            return;
        }

        // Add to list and clear current
        setRows(prev => [...prev, currentRow as MandiSessionFarmerRow]);
        resetCurrentRow();
    };

    const handleDeleteRow = (index: number) => {
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleLoadRowToEdit = (index: number) => {
        const rowToEdit = rows[index];
        setCurrentRow(rowToEdit);
        setRows(prev => prev.filter((_, i) => i !== index));
        toast({ title: "Row loaded", description: "Editing farmer details.", variant: "default" });
    };

    // Keyboard Navigation Logic
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLElement>, nextField?: React.RefObject<any>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                
                // Special case for Farmer Search: if empty AND we have rows, jump to Buyer section
                if (e.currentTarget === farmerSearchRef.current && !currentRow.farmerId && rows.length > 0) {
                    buyerSearchRef.current?.focus();
                    return;
                }

                if (nextField?.current) {
                    nextField.current.focus();
                } else if (e.currentTarget.classList.contains("add-btn")) {
                    handleAddRow();
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentRow, rows]
    );


    const handleSubmit = async () => {
        if (!profile?.organization_id) return;

        const validFarmers = rows.filter(r => r.farmerId && r.itemId && r.qty > 0 && r.rate > 0);
        if (validFarmers.length === 0) {
            toast({ title: "Validation Error", description: "Please add at least one complete farmer row first.", variant: "destructive" });
            return;
        }

        const totalNetQty = validFarmers.reduce((sum, f) => sum + f.netQty, 0);
        const totalNetAmount = validFarmers.reduce((sum, f) => sum + f.netAmount, 0);

        // Derive saleRate as weighted average net rate
        const derivedSaleRate = totalNetQty > 0 ? parseFloat((totalNetAmount / totalNetQty).toFixed(2)) : 0;
        
        let buyerPayable = 0;
        let taxTotals: any = null;
        
        if (buyerId) {
            const buyerStateCode = buyers.find(b => b.id === buyerId)?.state_code;
            taxTotals = calculateSaleTotals({
                items: validFarmers.map(f => ({ amount: f.netAmount, gst_rate: f.gstRate, gst_inclusive: f.saleGstType === 'Inclusive' })),
                taxSettings: settings || {},
                orgStateCode: settings?.state_code,
                buyerStateCode: buyerStateCode,
                loadingCharges: buyerLoading,
                unloadingCharges: buyerPacking,
                otherExpenses: 0,
                discountAmount: 0,
            });
            const crateTotal = (cratesEnabled && crateCart) ? crateCart.reduce((sum: number, c: any) => sum + (c.qty * c.rate), 0) : 0;
            buyerPayable = taxTotals.grandTotal + crateTotal;
        }

        const buyerName = buyers.find(b => b.id === buyerId)?.name;

        const input: MandiSessionInput = {
            organizationId: profile.organization_id,
            sessionDate,
            lotNo,
            vehicleNo,
            bookNo: "", // Book No removed from UI — kept in type for API compatibility
            farmers: validFarmers,
            buyerId,
            buyerName,
            buyerLoadingCharges: buyerLoading,
            buyerPackingCharges: buyerPacking,
            totalNetQty,
            saleRate: derivedSaleRate,
            buyerPayable,
            gstTotal: taxTotals ? taxTotals.gstTotal : 0,
            cgstAmount: taxTotals ? taxTotals.cgstAmount : 0,
            sgstAmount: taxTotals ? taxTotals.sgstAmount : 0,
            igstAmount: taxTotals ? taxTotals.igstAmount : 0,
            crateItems: (cratesEnabled && crateCart.length > 0) ? crateCart : [],
        };

        const res = await commitSession(input);
        if (res?.sessionId) {
            toast({ title: "Session Committed", description: "Records generated successfully." });
            const detail = await fetchSessionDetail(res.sessionId);
            setCommittedSessionData(detail);
        }
    };

    const handleReset = () => {
        setLotNo("");
        setVehicleNo("");
        setBuyerId(null);
        setBuyerLoading(0);
        setBuyerPacking(0);
        setCratesEnabled(false);
        setCrateCart([]);
        setCommittedSessionData(null);
        setRows([]);
        resetCurrentRow();
    };

    // ─────────────────────────────────────────────────────────────
    // Renders
    // ─────────────────────────────────────────────────────────────
    const buildItemLabel = (item: any) => {
        const base = item.name || item.item_name || item.id || "Unknown Item";
        return formatCommodityName(base, item.custom_attributes);
    };

    if (committedSessionData) {
        return <SessionBillsView sessionData={committedSessionData} onNewSession={handleReset} />;
    }

    const inputCls = "h-10 text-base font-bold text-slate-900 bg-white border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 transition-all";

    return (
        <div className="max-w-[1400px] mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                    <Scale className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Purchase + Sale</h1>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1">Single-Screen Native Application</p>
                </div>
            </div>

            {/* Global Header — 4 columns: Date, Lot No, Unit, Vehicle No */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</Label>
                    <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="h-10 font-bold bg-slate-50 mt-1 rounded-lg" />
                </div>
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Lot No.</Label>
                    <div className="relative mt-1">
                        <Input placeholder="LOT NBS" value={lotNo} onChange={(e) => setLotNo(e.target.value)} className="h-10 font-bold font-mono tracking-widest uppercase pl-10 rounded-lg" />
                        <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unit</Label>
                    <select 
                        value={globalUnit} 
                        onChange={(e) => setGlobalUnit(e.target.value)} 
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 px-3 mt-1"
                    >
                        {units.map((u) => (<option key={u} value={u}>{u}</option>))}
                    </select>
                </div>
                <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vehicle No</Label>
                    <Input placeholder="XX-00-YY-0000" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); document.getElementById("farmer-search-select")?.focus(); } }} className="h-10 font-bold uppercase mt-1 rounded-lg" />
                </div>
            </div>

            {/* Main 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                
                {/* 1. Added Farmers List */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 min-h-[480px]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" /> Latest Arrivals ({rows.length})
                    </h3>
                    
                    {rows.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                            <Plus className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm font-bold">No farmers added</p>
                            <p className="text-xs">Fill the details and click Add</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rows.map((row, idx) => (
                                <AddedFarmerCard 
                                    key={row.id || idx} 
                                    index={idx} 
                                    row={row} 
                                    onDelete={handleDeleteRow}
                                    onClick={() => handleLoadRowToEdit(idx)} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Farmer Details Form (Active) */}
                <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 pt-4 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                    <div className="space-y-4">
                        <div>
                             <SearchableSelect
                                id="farmer-search-select"
                                autoOpenOnFocus
                                ref={farmerSearchRef}
                                options={farmers.map((f) => ({
                                    label: `${f.name}${f.internal_id ? ` [${f.internal_id}]` : ""}${f.city ? ` (${f.city})` : ""}`,
                                    value: f.id,
                                }))}
                                value={currentRow.farmerId || ""}
                                onChange={handleFarmerSelect}
                                onSelected={() => {
                                    setTimeout(() => document.getElementById("item-search-select")?.focus(), 50);
                                }}
                                placeholder="Search Farmer Name..."
                                className="h-12 text-base font-bold border-2 border-slate-200 mt-1 rounded-xl"
                            />
                        </div>

                        <div>
                            <SearchableSelect
                                id="item-search-select"
                                autoOpenOnFocus
                                ref={itemSearchRef}
                                options={commodities.map((i) => ({
                                    label: buildItemLabel(i),
                                    value: i.id,
                                }))}
                                value={currentRow.itemId || ""}
                                onChange={handleItemSelect}
                                onSelected={() => {
                                    setTimeout(() => qtyRef.current?.focus(), 50);
                                }}
                                placeholder="Search Item / Variety..."
                                className="h-12 text-base font-bold border-2 border-slate-200 mt-1 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input ref={qtyRef} type="number" min={0} step="any" value={currentRow.qty || ""} onChange={(e) => handleCurrentRowChange("qty", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, rateRef)} className={inputCls} placeholder="Qty" />
                            </div>
                             <div>
                                <Input ref={rateRef} type="number" min={0} step="any" value={currentRow.rate || ""} onChange={(e) => handleCurrentRowChange("rate", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, lessPercentRef)} className={inputCls} placeholder="Price (₹)" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Input ref={lessPercentRef} type="number" min={0} step="any" value={currentRow.lessPercent || ""} onChange={(e) => handleCurrentRowChange("lessPercent", parseFloat(e.target.value) || 0, "lessPercent")} onKeyDown={(e) => handleKeyDown(e, lessUnitsRef)} className={inputCls + " text-red-600"} placeholder="Less %" />
                            </div>
                            <div>
                                <Input ref={lessUnitsRef} type="number" min={0} step="any" value={currentRow.lessUnits || ""} onChange={(e) => handleCurrentRowChange("lessUnits", parseFloat(e.target.value) || 0, "lessUnits")} onKeyDown={(e) => handleKeyDown(e, loadingRef)} className={inputCls + " text-red-600"} placeholder="Less Weight" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Input ref={loadingRef} type="number" min={0} step="any" value={currentRow.loadingCharges || ""} onChange={(e) => handleCurrentRowChange("loadingCharges", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, commPctRef)} className={inputCls} placeholder="Loading Charges" />
                            </div>
                        </div>
                        
                        <div>
                            <Input ref={commPctRef} type="number" min={0} step="any" value={currentRow.commissionPercent || ""} onChange={(e) => handleCurrentRowChange("commissionPercent", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, addBtnRef)} className={inputCls} placeholder="Commission %" />
                        </div>

                        <div className="pt-2">
                             <Button 
                                ref={addBtnRef}
                                type="button"
                                onClick={handleAddRow}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddRow();
                                    }
                                }}
                                className="add-btn w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl tracking-widest shadow-lg shadow-emerald-500/20 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.4)] transition-all"
                            >
                                [Add] <Plus className="ml-2 w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. Summary Panel */}
                <div className="space-y-4">
                    <SummaryPanel
                        farmers={rows}
                        hasBuyer={!!buyerId}
                        buyerName={buyers.find(b => b.id === buyerId)?.name}
                        buyerLoadingCharges={buyerLoading}
                        buyerPackingCharges={buyerPacking}
                        taxSettings={settings}
                        buyerStateCode={buyers.find(b => b.id === buyerId)?.state_code}
                        crateTotal={(cratesEnabled && crateCart) ? crateCart.reduce((sum: number, c: any) => sum + (c.qty * c.rate), 0) : 0}
                    />
                </div>
            </div>

            {/* Bottom Crate Section for Buyer */}
            {buyerId && (
                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Add Crates to Sale</span>
                            <span className="text-[9px] font-bold text-amber-600/70">Bill crates separately to this buyer</span>
                        </div>
                        <Switch
                            checked={cratesEnabled}
                            onCheckedChange={(checked) => {
                                setCratesEnabled(checked);
                                if (!checked) setCrateCart([]);
                            }}
                            className="data-[state=checked]:bg-amber-500"
                        />
                    </div>
                    
                    {cratesEnabled && (
                        <div className="space-y-3 mt-4 border-t border-amber-200/50 pt-3">
                            <div className="flex items-center gap-2 max-w-2xl">
                                <div className="flex-1">
                                    <select
                                        className="w-full bg-white border border-amber-200 rounded-lg h-9 text-xs font-bold text-slate-800 px-2 outline-none"
                                        id="mandi-crate-type-select"
                                        defaultValue=""
                                        onChange={(e) => {
                                            const ct = e.target.value;
                                            const crateDef = crateTypes.find((x: any) => x.id === ct);
                                            if (crateDef?.sale_rate) {
                                                const rateInput = document.getElementById('mandi-crate-rate-input') as HTMLInputElement;
                                                if (rateInput) rateInput.value = String(crateDef.sale_rate);
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select Crate Type</option>
                                        {crateTypes.map((c: any) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name || c.crate_name} (₹{c.sale_rate}) - Avail: {c.available || 0}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input 
                                    id="mandi-crate-qty-input" 
                                    type="number" 
                                    placeholder="Qty" 
                                    className="w-20 bg-white border-amber-200 h-9 text-xs font-bold" 
                                />
                                <Input 
                                    id="mandi-crate-rate-input" 
                                    type="number" 
                                    placeholder="Rate" 
                                    className="w-20 bg-white border-amber-200 h-9 text-xs font-bold" 
                                />
                                <Button 
                                    type="button"
                                    onClick={() => {
                                        const sel = document.getElementById("mandi-crate-type-select") as HTMLSelectElement;
                                        const qtyInput = document.getElementById("mandi-crate-qty-input") as HTMLInputElement;
                                        const rateInput = document.getElementById("mandi-crate-rate-input") as HTMLInputElement;
                                        
                                        const ct = sel.value;
                                        const q = parseInt(qtyInput.value) || 0;
                                        const r = parseFloat(rateInput.value);
                                        
                                        if (!ct || q <= 0) return;
                                        
                                        const crateDef = crateTypes.find((x: any) => x.id === ct);
                                        const availableStock = crateDef?.available || 0;
                                        const currentCart = crateCart || [];
                                        const exists = currentCart.findIndex((x: any) => x.crate_type === ct);
                                        const currentQty = exists >= 0 ? currentCart[exists].qty : 0;
                                        
                                        if (currentQty + q > availableStock) {
                                            toast({
                                                title: "Stock Exceeded",
                                                description: `You are adding ${q} but only ${availableStock - currentQty} more available.`,
                                                variant: "destructive"
                                            });
                                            return;
                                        }
                                        
                                        const finalRate = isNaN(r) ? (crateDef?.sale_rate || 0) : r;
                                        
                                        setCrateCart(prev => {
                                            const exists = prev.findIndex(x => x.crate_type === ct);
                                            const newCart = [...prev];
                                            if (exists >= 0) {
                                                newCart[exists].qty += q;
                                                newCart[exists].rate = finalRate;
                                            } else {
                                                newCart.push({ crate_type: ct, qty: q, rate: finalRate });
                                            }
                                            return newCart;
                                        });
                                        qtyInput.value = "";
                                        rateInput.value = "";
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 rounded-lg text-xs font-black"
                                >
                                    Add
                                </Button>
                            </div>
                            
                            {crateCart.length > 0 && (
                                <div className="bg-white rounded-lg border border-amber-100 overflow-hidden mt-2 max-w-2xl">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-amber-50/50 text-[9px] uppercase tracking-widest text-amber-700">
                                            <tr>
                                                <th className="px-3 py-2">Type</th>
                                                <th className="px-3 py-2 text-right">Qty</th>
                                                <th className="px-3 py-2 text-right">Rate</th>
                                                <th className="px-3 py-2 text-right">Total</th>
                                                <th className="px-3 py-2 text-center">x</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-50">
                                            {crateCart.slice((cratePage - 1) * CRATES_PER_PAGE, cratePage * CRATES_PER_PAGE).map((c: any, displayIndex: number) => {
                                                const ci = (cratePage - 1) * CRATES_PER_PAGE + displayIndex;
                                                return (
                                                <tr key={ci} className="font-bold text-slate-700">
                                                    <td className="px-3 py-2">{c.crate_type}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input 
                                                            type="number" 
                                                            value={c.qty === 0 ? '' : c.qty}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const newQty = val === '' ? 0 : (parseInt(val) || 0);
                                                                const crateDef = crateTypes.find((x: any) => x.id === c.crate_type);
                                                                if (newQty > (crateDef?.available || 0)) {
                                                                    toast({ title: "Stock Exceeded", description: `Only ${crateDef?.available || 0} available.`, variant: "destructive" });
                                                                    return;
                                                                }
                                                                setCrateCart(prev => {
                                                                    const updated = [...prev];
                                                                    updated[ci].qty = newQty;
                                                                    return updated;
                                                                });
                                                            }}
                                                            className="w-16 text-right bg-transparent border-b border-amber-200 outline-none focus:border-amber-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input 
                                                            type="number" 
                                                            value={c.rate === 0 ? '' : c.rate}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                const newRate = val === '' ? 0 : (parseFloat(val) || 0);
                                                                setCrateCart(prev => {
                                                                    const updated = [...prev];
                                                                    updated[ci].rate = newRate;
                                                                    return updated;
                                                                });
                                                            }}
                                                            className="w-20 text-right bg-transparent border-b border-amber-200 outline-none focus:border-amber-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">₹{(c.qty * c.rate).toLocaleString('en-IN')}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button type="button" onClick={() => {
                                                            setCrateCart(prev => prev.filter((_, idx) => idx !== ci));
                                                        }} className="text-red-400 hover:text-red-600">×</button>
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {crateCart.length > CRATES_PER_PAGE && (
                                        <div className="px-3 py-2 border-t border-amber-100 flex items-center justify-between bg-amber-50/30">
                                            <span className="text-[10px] font-bold text-slate-500">
                                                Showing {(cratePage - 1) * CRATES_PER_PAGE + 1} - {Math.min(cratePage * CRATES_PER_PAGE, crateCart.length)} of {crateCart.length}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" disabled={cratePage === 1} onClick={() => setCratePage(p => Math.max(1, p - 1))}>Prev</Button>
                                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" disabled={cratePage * CRATES_PER_PAGE >= crateCart.length} onClick={() => setCratePage(p => p + 1)}>Next</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Buyer Section directly based on Sci-Fi Mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-1 border-t border-slate-200/50 pt-6">
                <div className="bg-blue-50/50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1 flex items-center gap-2">
                            🤝 Buyer Name (Sale)
                        </Label>
                        {buyerId && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setBuyerId(null);
                                    setBuyerLoading(0);
                                    setBuyerPacking(0);
                                }}
                                className="h-6 px-2 text-[9px] font-black text-red-600 hover:text-red-700 hover:bg-red-50 uppercase tracking-tighter"
                            >
                                Remove Buyer
                            </Button>
                        )}
                    </div>
                    <SearchableSelect
                        ref={buyerSearchRef}
                        options={buyers.map(b => ({ label: `${b.name}${b.internal_id ? ` [${b.internal_id}]` : ""}${b.city ? ` (${b.city})` : ""}`, value: b.id }))}
                        value={buyerId || ""}
                        onChange={setBuyerId}
                        onSelected={() => buyerLoadingRef.current?.focus()}
                        placeholder="Search buyer..."
                        className="h-12 text-base font-bold border-blue-200 focus:border-blue-500 bg-white rounded-xl"
                    />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 flex items-center gap-2 mb-2">
                        📦 Loading/crate charges (₹)
                    </Label>
                    <Input ref={buyerLoadingRef} type="number" min={0} step="any" placeholder="0" value={buyerLoading || ""} onChange={(e) => setBuyerLoading(parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, buyerPackingRef)} className="h-12 text-xl font-bold bg-white border-slate-200 rounded-xl" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1 flex items-center gap-2 mb-2">
                        📦 Packing charge (₹)
                    </Label>
                    <Input ref={buyerPackingRef} type="number" min={0} step="any" placeholder="0" value={buyerPacking || ""} onChange={(e) => setBuyerPacking(parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, submitBtnRef)} className="h-12 text-xl font-bold bg-white border-slate-200 rounded-xl" />
                </div>
            </div>

            {/* Final Submit & Print (Bottom Center) */}
            <div className="flex justify-center mt-12 mb-20">
                <Button
                    ref={submitBtnRef}
                    className="w-full max-w-xl h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-2xl tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    disabled={isCommitting}
                >
                    {isCommitting ? "GENERATING BILLS..." : "SUBMIT & PRINT"}
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
}
