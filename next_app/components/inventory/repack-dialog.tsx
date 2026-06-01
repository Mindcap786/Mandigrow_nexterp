"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, ArrowRight, Scale } from "lucide-react"
import { callApi } from "@/lib/frappeClient"
import { useToast } from "@/hooks/use-toast"

interface RepackDialogProps {
    isOpen: boolean
    onClose: () => void
    lot: any
    onSuccess: () => void
}

export function RepackDialog({ isOpen, onClose, lot, onSuccess }: RepackDialogProps) {
    const [loading, setLoading] = useState(false)
    const [sourceQty, setSourceQty] = useState<number | ''>('')
    const { toast } = useToast()

    if (!lot) return null

    const unitWeight = Number(lot.unit_weight) || 0
    const currentQty = Number(lot.current_qty) || 0
    const qtyToConvert = sourceQty === '' ? currentQty : Number(sourceQty)
    const kgQty = qtyToConvert * unitWeight
    const totalValue = qtyToConvert * (Number(lot.supplier_rate) || 0)

    const handleRepack = async () => {
        if (!qtyToConvert || qtyToConvert <= 0 || qtyToConvert > currentQty) {
            toast({ title: "Invalid quantity", variant: "destructive" })
            return
        }
        
        setLoading(true)
        try {
            await callApi("mandigrow.api.create_repack_entry", {
                lot_id: lot.name || lot.id,
                source_qty: qtyToConvert
            })
            toast({ title: "Repacked successfully", description: `Converted to ${kgQty} KG` })
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to repack", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white border-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-600" />
                        Repack to KG
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Source</p>
                            <p className="text-xl font-black text-slate-900">{qtyToConvert} {lot.unit}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300" />
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target</p>
                            <p className="text-xl font-black text-blue-600">{kgQty} KG</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Quantity to Repack ({lot.unit})
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={currentQty}
                                    value={sourceQty}
                                    onChange={(e) => setSourceQty(e.target.value ? Number(e.target.value) : '')}
                                    placeholder={`Max: ${currentQty}`}
                                    className="font-black text-lg h-12"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSourceQty(currentQty)}
                                    className="h-12 px-6 font-black uppercase text-xs"
                                >
                                    All
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-2">
                            <span className="text-xs font-bold text-slate-500">Value Preserved</span>
                            <span className="text-sm font-black text-emerald-600">₹{Math.round(totalValue).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <Button 
                        onClick={handleRepack} 
                        disabled={loading || qtyToConvert <= 0 || qtyToConvert > currentQty}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Repack"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
