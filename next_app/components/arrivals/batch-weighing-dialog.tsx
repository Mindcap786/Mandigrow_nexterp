"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useWebSerial } from "@/hooks/use-web-serial";
import { Usb, Plus, Trash2, CheckCircle2, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchWeighingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (totalWeight: number, count: number) => void;
    unit: string;
}

export function BatchWeighingDialog({ open, onOpenChange, onApply, unit }: BatchWeighingDialogProps) {
    const [weights, setWeights] = useState<number[]>([]);
    const [hwScaleEnabled, setHwScaleEnabled] = useState(false);

    useEffect(() => {
        setHwScaleEnabled(localStorage.getItem('mg_hw_scale_enabled') === 'true');
    }, [open]);

    const { isConnected, parsedWeight, requestConnection, disconnect } = useWebSerial({
        onWeightParsed: () => {} // Just read parsedWeight directly
    });

    const addWeight = (w: number) => {
        if (w > 0) {
            setWeights(prev => [...prev, w]);
        }
    };

    const removeWeight = (index: number) => {
        setWeights(prev => prev.filter((_, i) => i !== index));
    };

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden flex-shrink-0 border border-white/20 flex items-center justify-center">
                        <Scale className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <DialogTitle className="text-white text-xl font-black leading-tight">Batch Weighing</DialogTitle>
                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1">Capture Multiple Loads</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Hardware Scale Controls */}
                    {hwScaleEnabled && (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                            <Button
                                type="button"
                                variant="outline"
                                className={cn("h-12 w-full rounded-xl font-black transition-all mb-4", isConnected ? "border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "border-slate-300 text-slate-600 bg-white hover:bg-slate-100")}
                                onClick={() => {
                                    if (isConnected) disconnect();
                                    else requestConnection();
                                }}
                            >
                                <Usb className="w-5 h-5 mr-2" />
                                {isConnected ? "Disconnect Scale" : "Connect Hardware Scale"}
                            </Button>
                            
                            {isConnected && (
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Reading</div>
                                    <div className="text-5xl font-black text-indigo-600 font-mono tracking-tighter mb-4">{parsedWeight?.toFixed(2) || "0.00"} <span className="text-xl text-indigo-400">kg</span></div>
                                    <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 rounded-xl" onClick={() => addWeight(parsedWeight || 0)}>
                                        <Plus className="w-5 h-5 mr-2" /> Capture Weight
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Entry Fallback */}
                    <div className="flex items-center gap-2">
                        <input 
                            id="manualWeight"
                            type="number" 
                            step="0.01"
                            placeholder="Manual Weight (kg)" 
                            className="flex-1 bg-white border-2 border-slate-300 h-12 px-4 rounded-xl font-bold text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const w = parseFloat(e.currentTarget.value);
                                    if (!isNaN(w)) {
                                        addWeight(w);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                        <Button type="button" variant="outline" className="h-12 px-6 font-black border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50" onClick={() => {
                            const input = document.getElementById('manualWeight') as HTMLInputElement;
                            const w = parseFloat(input?.value);
                            if (!isNaN(w)) {
                                addWeight(w);
                                if (input) input.value = '';
                            }
                        }}>
                            Add
                        </Button>
                    </div>

                    {/* Recorded Weights List */}
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1">
                        {weights.length === 0 ? (
                            <div className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">No weights recorded</div>
                        ) : (
                            weights.map((w, i) => (
                                <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="font-mono font-bold text-sm text-slate-700">Load {i + 1}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-black text-slate-900">{w.toFixed(2)} kg</div>
                                        <button type="button" onClick={() => removeWeight(i)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Weight / Count</div>
                            <div className="text-lg font-black text-slate-900">{totalWeight.toFixed(2)} kg / {weights.length} {unit}</div>
                        </div>
                        <Button 
                            type="button"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 rounded-xl"
                            disabled={weights.length === 0}
                            onClick={() => {
                                onApply(totalWeight, weights.length);
                                setWeights([]);
                                onOpenChange(false);
                            }}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Apply Batch
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
