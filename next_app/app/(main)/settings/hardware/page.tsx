"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { MonitorSmartphone, ScanBarcode, Usb, Save, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function HardwareSettingsPage() {
    const { toast } = useToast();
    const [enableScale, setEnableScale] = useState(false);
    const [enableScanner, setEnableScanner] = useState(false);

    useEffect(() => {
        // Load settings from local storage since hardware is per-device
        setEnableScale(localStorage.getItem("mg_hw_scale_enabled") === "true");
        setEnableScanner(localStorage.getItem("mg_hw_scanner_enabled") === "true");
    }, []);

    const handleSave = () => {
        localStorage.setItem("mg_hw_scale_enabled", enableScale.toString());
        localStorage.setItem("mg_hw_scanner_enabled", enableScanner.toString());
        toast({ title: "Hardware Settings Saved", description: "These settings apply only to this specific computer/browser." });
    };

    return (
        <ProtectedRoute requiredPermission="manage_settings">
            <div className="min-h-screen bg-slate-50 text-black p-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-12">
                    <header className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div>
                            <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase flex items-center gap-3">
                                <MonitorSmartphone className="w-10 h-10 text-black" /> Device <span className="text-indigo-600">Hardware</span>
                            </h1>
                            <p className="text-slate-500 font-bold mt-1">Configure peripherals and integrations for THIS specific computer.</p>
                        </div>
                    </header>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
                            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                            <p className="text-sm font-bold text-amber-800 leading-relaxed">
                                <strong>Important:</strong> Hardware settings are saved locally to this browser (`localStorage`). 
                                If you use a different computer, or clear your browser data, you will need to re-enable these features.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Weighing Scale */}
                            <div className={cn("p-6 rounded-2xl border transition-all flex items-center justify-between", enableScale ? "border-indigo-200 bg-indigo-50/50" : "border-slate-200")}>
                                <div className="flex items-start gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", enableScale ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400")}>
                                        <Usb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800">Weighing Scale Integration (Web Serial API)</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">Allows the POS and Purchase screens to read live weight data directly from a connected USB/RS232 scale.</p>
                                        <p className="text-xs text-slate-400 mt-2 italic">*Requires Google Chrome or Microsoft Edge browser.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEnableScale(!enableScale)}
                                    className={cn("relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none shrink-0", enableScale ? "bg-indigo-600" : "bg-slate-200")}
                                >
                                    <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform", enableScale ? "translate-x-7" : "translate-x-1")} />
                                </button>
                            </div>

                            {/* Barcode Scanner */}
                            <div className={cn("p-6 rounded-2xl border transition-all flex items-center justify-between", enableScanner ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200")}>
                                <div className="flex items-start gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", enableScanner ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                                        <ScanBarcode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800">Barcode Scanner (Keyboard Wedge)</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">Enable global rapid-scanning listeners. When a barcode is scanned, the POS will instantly search and select the lot.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEnableScanner(!enableScanner)}
                                    className={cn("relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none shrink-0", enableScanner ? "bg-emerald-600" : "bg-slate-200")}
                                >
                                    <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform", enableScanner ? "translate-x-7" : "translate-x-1")} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSave} className="w-full bg-black text-white hover:bg-slate-800 font-black uppercase tracking-widest h-14 rounded-2xl shadow-lg">
                                <Save className="w-5 h-5 mr-2" /> Save Device Configuration
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
