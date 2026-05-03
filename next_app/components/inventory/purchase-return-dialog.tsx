"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeftRight, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react"
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface PurchaseReturnDialogProps {
    isOpen: boolean
    onClose: () => void
    lot: any
    onSuccess: () => void
}

export function PurchaseReturnDialog({ isOpen, onClose, lot, onSuccess }: PurchaseReturnDialogProps) {
    const { profile } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState("")
    const [rate, setRate] = useState(lot?.supplier_rate?.toString() || "")
    const [remarks, setRemarks] = useState("")
    const [result, setResult] = useState<any>(null)

    const resetState = () => {
        setQuantity("")
        setRate(lot?.supplier_rate?.toString() || "")
        setRemarks("")
        setResult(null)
    }

    if (!lot) return null

    const handleSubmit = async () => {
        if (!quantity || Number(quantity) <= 0) {
            toast({ title: "Invalid Quantity", description: "Please enter a valid quantity.", variant: "destructive" })
            return
        }
        if (Number(quantity) > Number(lot.current_qty)) {
            toast({ title: "Stock Limit Exceeded", description: "Cannot return more than current stock.", variant: "destructive" })
            return
        }
        if (!rate || Number(rate) < 0) {
            toast({ title: "Invalid Rate", description: "Please enter a valid return rate.", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const res: any = await callApi('mandigrow.api.return_stock', {
                lot_id: lot.id || lot.lot_id,
                return_qty: Number(quantity),
                return_rate: Number(rate),
                reason: remarks
            });

            if (res?.error) throw new Error(res.error);

            setResult(res)
            onSuccess()
        } catch (err: any) {
            console.error(err)
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const partyLabel = lot.arrival_type === 'commission' ? "Farmer" : "Supplier"
    const returnValue = (Number(quantity) || 0) * (Number(rate) || 0)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white border-slate-200 text-black sm:max-w-md shadow-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-black">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                            <ArrowLeftRight className="w-5 h-5" />
                        </div>
                        Return to {partyLabel}
                    </DialogTitle>
                </DialogHeader>

                {/* ── Success / Audit State ── */}
                {result ? (
                    <div className="px-6 py-5 space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="font-black text-emerald-700 text-sm">Return Processed Successfully</p>
                                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{result.message || `${result.return_qty} units returned.`}</p>
                            </div>
                        </div>

                        {/* Ledger Impact Panel */}
                        {result.ledger_entry && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Ledger Impact — {partyLabel} Account Updated
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
                                    <div className="bg-blue-50 border-b border-slate-200 flex justify-between items-center px-4 py-2.5">
                                        <div>
                                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">DEBIT ({partyLabel} Payable ↓)</p>
                                            <p className="font-bold text-blue-800 text-xs mt-0.5 truncate max-w-[220px]">{result.ledger_entry.debit_account}</p>
                                            <p className="text-[9px] text-blue-400 font-bold">Amount Mandi owes {partyLabel} is reduced</p>
                                        </div>
                                        <p className="font-black font-mono text-blue-700">₹{(result.ledger_entry.amount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="bg-slate-50 flex justify-between items-center px-4 py-2.5">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CREDIT (Stock Asset ↓)</p>
                                            <p className="font-bold text-slate-700 text-xs mt-0.5 truncate max-w-[220px]">{result.ledger_entry.credit_account}</p>
                                        </div>
                                        <p className="font-black font-mono text-slate-600">−₹{(result.ledger_entry.amount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                {result.je_name && (
                                    <p className="text-[10px] text-slate-500 font-bold">
                                        Journal Entry: <span className="font-mono text-blue-600">{result.je_name}</span>
                                        {' '}· Visible in Finance → {partyLabel} Ledger
                                    </p>
                                )}
                                {result.je_posted === false && (
                                    <p className="text-[10px] text-amber-600 font-bold">
                                        ⚠️ No financial JE created (accounts not configured or zero value).
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remaining Stock</p>
                                <p className="text-lg font-black text-black mt-0.5">{result.remaining_qty} <span className="text-[10px] text-slate-400 font-bold uppercase">{lot.unit}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Returned</p>
                                <p className="text-lg font-black text-orange-600 mt-0.5">−{result.return_qty} <span className="text-[10px] text-orange-400 font-bold uppercase">{lot.unit}</span></p>
                            </div>
                        </div>

                        <Button onClick={handleClose} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black h-11">
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-5 px-6 py-4">
                            {/* Lot Info Banner */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">LOT CODE</div>
                                    <div className="font-mono text-xs text-black font-bold uppercase">{lot.lot_code}</div>
                                    <div className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">
                                        Orig. Rate: ₹{lot.supplier_rate} / {lot.unit}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">AVAILABLE</div>
                                    <div className="text-lg font-black text-black leading-none">
                                        {lot.current_qty} <span className="text-[10px] text-slate-500 font-bold uppercase">{lot.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Return Qty ({lot.unit})</Label>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="bg-white border-slate-200 text-lg font-black font-mono text-black focus:border-orange-500 rounded-lg shadow-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Return Rate (₹)</Label>
                                        <Input
                                            type="number"
                                            value={rate}
                                            onChange={(e) => setRate(e.target.value)}
                                            className="bg-white border-slate-200 text-lg font-black font-mono text-black focus:border-orange-500 rounded-lg shadow-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Live financial credit preview */}
                                {returnValue > 0 && (
                                    <div className="rounded-xl border border-blue-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-blue-600 px-4 py-2 flex items-center justify-between text-white">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{partyLabel} Ledger Impact</span>
                                        </div>
                                        <div className="bg-blue-50 px-4 py-3 flex justify-between items-center">
                                            <div>
                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">DEBIT: {partyLabel} Payable</p>
                                                <p className="text-[9px] text-blue-400 font-bold">Amount Mandi owes {partyLabel} will decrease</p>
                                            </div>
                                            <p className="text-xl font-[1000] font-mono text-blue-700 tracking-tighter">
                                                ₹{returnValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center border-t border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CREDIT: Stock In Hand</p>
                                            <p className="text-sm font-black font-mono text-slate-500">−₹{returnValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reason / Remarks</Label>
                                    <Textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="bg-white border-slate-200 text-black resize-none shadow-sm placeholder:text-slate-300"
                                        placeholder="E.g., Rejected due to poor quality"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-orange-500" />
                                <p>This reduces stock and debits the {partyLabel}'s payable — reducing what Mandi owes them.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-6 gap-2 sm:gap-0 bg-slate-50">
                            <Button variant="ghost" onClick={handleClose} className="hover:bg-slate-50 text-slate-500 hover:text-black font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !quantity || Number(quantity) <= 0}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-tight shadow-lg shadow-orange-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowLeftRight className="w-4 h-4 mr-2" />}
                                Process Return
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
