"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Trash2, CheckCircle2, TrendingDown, BookOpen } from "lucide-react"
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface WastageDialogProps {
    isOpen: boolean
    onClose: () => void
    lot: any
    onSuccess: () => void
}

export function WastageDialog({ isOpen, onClose, lot, onSuccess }: WastageDialogProps) {
    const { profile } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState("")
    const [reason, setReason] = useState("Spoilage")
    const [result, setResult] = useState<any>(null) // stores API response for audit trail

    const resetState = () => {
        setQuantity("")
        setReason("Spoilage")
        setResult(null)
    }

    if (!lot) return null

    const handleSubmit = async () => {
        if (!quantity || Number(quantity) <= 0) {
            toast({ title: "Invalid Quantity", description: "Please enter a valid quantity.", variant: "destructive" })
            return
        }
        if (Number(quantity) > Number(lot.current_qty)) {
            toast({ title: "Stock Limit Exceeded", description: "Cannot report more wastage than current stock.", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const res: any = await callApi('mandigrow.api.report_loss', {
                lot_id: lot.id || lot.lot_id,
                loss_qty: Number(quantity),
                reason: reason
            });

            if (res?.error) throw new Error(res.error);

            setResult(res)
            onSuccess()
        } catch (err: any) {
            console.error(err)
            toast({ title: "Error Recording Loss", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const estimatedLossValue = Number(quantity) * (Number(lot?.supplier_rate) || 0)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white border-slate-200 text-black sm:max-w-md shadow-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-black">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        Report Loss
                    </DialogTitle>
                </DialogHeader>

                {/* ── Success / Audit State ── */}
                {result ? (
                    <div className="px-6 py-5 space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="font-black text-emerald-700 text-sm">Loss Recorded Successfully</p>
                                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{result.message}</p>
                            </div>
                        </div>

                        {/* Ledger Impact Panel */}
                        {result.ledger_entry && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Ledger Impact — Double Entry Posted
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
                                    <div className="bg-rose-50 border-b border-slate-200 flex justify-between items-center px-4 py-2.5">
                                        <div>
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">DEBIT (Expense ↑ — P&L Impact)</p>
                                            <p className="font-bold text-rose-800 text-xs mt-0.5 truncate max-w-[220px]">{result.ledger_entry.debit_account}</p>
                                        </div>
                                        <p className="font-black font-mono text-rose-700">+₹{(result.ledger_entry.amount || 0).toLocaleString('en-IN')}</p>
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
                                        {' '}· Visible in Finance → P&L Tab
                                    </p>
                                )}
                                {!result.je_posted && (
                                    <p className="text-[10px] text-amber-600 font-bold">
                                        ⚠️ No financial JE created (zero-cost lot or accounts not configured in Chart of Accounts).
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Remaining stock */}
                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remaining Stock</p>
                                <p className="text-lg font-black text-black mt-0.5">{result.remaining_qty} <span className="text-[10px] text-slate-400 font-bold uppercase">{lot.unit}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Removed</p>
                                <p className="text-lg font-black text-rose-600 mt-0.5">−{result.removed_qty} <span className="text-[10px] text-rose-400 font-bold uppercase">{lot.unit}</span></p>
                            </div>
                        </div>

                        <Button onClick={handleClose} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black h-11">
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 space-y-5">
                            {/* Lot Info Banner */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">LOT CODE</div>
                                    <div className="font-mono text-xs text-black font-bold uppercase">{lot.lot_code}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">STOCK AVAILABLE</div>
                                    <div className="text-lg font-black text-black leading-none">
                                        {lot.current_qty} <span className="text-[10px] text-slate-500 font-bold uppercase">{lot.unit}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial impact preview */}
                            <div className="p-3 rounded-lg text-[10px] font-bold border leading-relaxed bg-rose-50 text-rose-700 border-rose-100">
                                Mandi bears the financial cost. Stock Losses expense will be debited and Stock In Hand will be credited — reducing Net Profit on the P&L tab.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qty to Remove</Label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-white border-slate-200 text-lg font-black font-mono text-black focus:border-blue-500 rounded-lg shadow-sm"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reason</Label>
                                    <Select value={reason} onValueChange={setReason}>
                                        <SelectTrigger className="bg-white border-slate-200 text-black font-bold shadow-sm h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-black shadow-xl">
                                            <SelectItem value="Spoilage">Spoilage / Rot</SelectItem>
                                            <SelectItem value="Damage">Damaged in Handling</SelectItem>
                                            <SelectItem value="Theft">Theft / Missing</SelectItem>
                                            <SelectItem value="Dryage">Moisture Loss (Dryage)</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Live P&L Impact Preview */}
                            {Number(quantity) > 0 && (
                                <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-rose-200 overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white">
                                        <TrendingDown className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">P&L Impact Preview</span>
                                    </div>
                                    <div className="bg-rose-50 px-4 py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">DEBIT: Stock Losses (Expense)</p>
                                            <p className="text-[9px] font-bold text-rose-400 mt-0.5">Net Profit will decrease by this amount</p>
                                        </div>
                                        <p className="text-xl font-[1000] font-mono text-rose-700 tracking-tighter">
                                            ₹{estimatedLossValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CREDIT: Stock In Hand (Asset)</p>
                                        <p className="text-sm font-black font-mono text-slate-500">−₹{estimatedLossValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="bg-slate-50 p-6 flex flex-row items-center justify-between gap-4">
                            <Button variant="ghost" onClick={handleClose} className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !quantity}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-200 px-8 h-11"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Confirm Loss
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
