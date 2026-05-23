'use client'

import { useState, useEffect, useCallback } from 'react'
import { callApi } from '@/lib/frappeClient'
import { useAuth } from '@/components/auth/auth-provider'
import { Package, Plus, Edit2, Trash2, Loader2, X, CheckCircle, TrendingUp, TrendingDown, WarehouseIcon, IndianRupee, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast, Toaster } from 'sonner'
import { cn } from '@/lib/utils'

interface CrateType {
    id: string
    name: string
    purchase_rate: number
    sale_rate: number
    capacity_kg: number
    total_purchased: number
    total_issued_out: number
    total_sold: number
    available: number
}

export function CrateTypesView() {
    const { profile } = useAuth()
    const [crateTypes, setCrateTypes] = useState<CrateType[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stockSaving, setStockSaving] = useState(false)
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Add/Edit Crate Type modal
    const [showTypeModal, setShowTypeModal] = useState(false)
    const [editingCrate, setEditingCrate] = useState<CrateType | null>(null)
    const [typeForm, setTypeForm] = useState({ name: '', purchase_rate: '', sale_rate: '', capacity_kg: '' })

    // Add Stock modal
    const [showStockModal, setShowStockModal] = useState(false)
    const [stockForm, setStockForm] = useState({ crate_type: '', qty: '', purchase_rate: '', notes: '' })

    // Report Loss modal
    const [showLossModal, setShowLossModal] = useState(false)
    const [lossSaving, setLossSaving] = useState(false)
    const [lossForm, setLossForm] = useState({ crate_type: '', qty: '', notes: '' })

    const fetchData = useCallback(async () => {
        if (!profile?.organization_id) return
        setLoading(true)
        try {
            const res = await callApi('mandigrow.api.get_crate_master_data')
            setCrateTypes(res?.crate_types || [])
        } catch (e: any) {
            toast.error('Failed to load crate data', { description: e.message })
        } finally {
            setLoading(false)
        }
    }, [profile?.organization_id])

    useEffect(() => { fetchData() }, [fetchData])

    const openAdd = () => {
        setEditingCrate(null)
        setTypeForm({ name: '', purchase_rate: '', sale_rate: '', capacity_kg: '' })
        setShowTypeModal(true)
    }

    const openEdit = (c: CrateType) => {
        setEditingCrate(c)
        setTypeForm({
            name: c.name,
            purchase_rate: String(c.purchase_rate || ''),
            sale_rate: String(c.sale_rate || ''),
            capacity_kg: String(c.capacity_kg || ''),
        })
        setShowTypeModal(true)
    }

    const handleSaveType = async () => {
        if (!typeForm.name.trim()) { toast.error('Crate name is required'); return }
        setSaving(true)
        try {
            const res = await callApi('mandigrow.api.save_crate_type', {
                crate_name: typeForm.name,
                purchase_rate: parseFloat(typeForm.purchase_rate) || 0,
                sale_rate: parseFloat(typeForm.sale_rate) || 0,
                capacity_kg: parseFloat(typeForm.capacity_kg) || 0,
                crate_id: editingCrate?.id || null,
            })
            if (res?.success) {
                toast.success(editingCrate ? 'Crate type updated!' : 'Crate type added!')
                setShowTypeModal(false)
                fetchData()
            } else {
                toast.error(res?.error || 'Failed to save')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (c: CrateType) => {
        if (!confirm(`Delete crate type "${c.name}"? This cannot be undone.`)) return
        try {
            const res = await callApi('mandigrow.api.delete_crate_type', { crate_id: c.id })
            if (res?.success) {
                toast.success('Deleted')
                fetchData()
            } else {
                toast.error(res?.error || 'Cannot delete')
            }
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const openStockModal = (c?: CrateType) => {
        setStockForm({
            crate_type: c?.id || '',
            qty: '',
            purchase_rate: c ? String(c.purchase_rate) : '',
            notes: ''
        })
        setShowStockModal(true)
    }

    const handleAddStock = async () => {
        if (!stockForm.crate_type) { toast.error('Select a crate type'); return }
        if (!stockForm.qty || parseInt(stockForm.qty) <= 0) { toast.error('Enter a valid quantity'); return }
        setStockSaving(true)
        try {
            const res = await callApi('mandigrow.api.add_crate_stock_entry', {
                crate_type: stockForm.crate_type,
                quantity: parseInt(stockForm.qty),
                purchase_rate: parseFloat(stockForm.purchase_rate) || 0,
                notes: stockForm.notes,
            })
            if (res?.success) {
                toast.success('Stock added successfully!')
                setShowStockModal(false)
                fetchData()
            } else {
                toast.error(res?.error || 'Failed to add stock')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setStockSaving(false)
        }
    }

    const openLossModal = (c?: CrateType) => {
        setLossForm({
            crate_type: c?.id || '',
            qty: '',
            notes: ''
        })
        setShowLossModal(true)
    }

    const handleReportLoss = async () => {
        if (!lossForm.crate_type) { toast.error('Select a crate type'); return }
        const parsedQty = parseFloat(lossForm.qty);
        if (!parsedQty || parsedQty <= 0) { toast.error('Enter a valid quantity'); return }
        
        const selectedCrate = crateTypes.find(c => c.id === lossForm.crate_type);
        if (selectedCrate && parsedQty > selectedCrate.available) {
            toast.error(`Cannot report loss greater than available stock (${selectedCrate.available})`);
            return;
        }

        if (!lossForm.notes.trim()) { toast.error('Please enter a reason for the loss'); return }
        setLossSaving(true)
        try {
            const res = await callApi('mandigrow.api.report_crate_loss', {
                crate_type: lossForm.crate_type,
                qty: parseFloat(lossForm.qty),
                notes: lossForm.notes,
            })
            if (res?.status === 'success') {
                toast.success('Loss reported successfully!')
                setShowLossModal(false)
                fetchData()
            } else {
                toast.error(res?.error || 'Failed to report loss')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLossSaving(false)
        }
    }

    const totalTypes = crateTypes.length
    const totalAvailable = crateTypes.reduce((s, c) => s + c.available, 0)
    const totalValue = crateTypes.reduce((s, c) => s + (c.available * c.purchase_rate), 0)
    const totalIssued = crateTypes.reduce((s, c) => s + c.total_issued_out, 0)

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-center" />
            <div className="flex justify-end gap-2 mb-4">
                <Button onClick={() => openStockModal()} variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold gap-2">
                    <Archive className="w-4 h-4" /> Add Stock
                </Button>
                <Button onClick={openAdd} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black gap-2 shadow-lg">
                    <Plus className="w-4 h-4" /> Add Crate Type
                </Button>
            </div>
            <Toaster richColors position="top-center" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Crate Types', value: totalTypes, icon: Package, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
                    { label: 'Available Stock', value: totalAvailable, suffix: 'crates', icon: WarehouseIcon, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                    { label: 'Issued Out', value: totalIssued, suffix: 'crates', icon: TrendingDown, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
                    { label: 'Stock Value', value: `₹${totalValue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-purple-500 to-indigo-600', bg: 'bg-purple-50', text: 'text-purple-700' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', c.bg)}>
                            <c.icon className={cn('w-5 h-5', c.text)} />
                        </div>
                        <div className="text-2xl font-black text-slate-900">{c.value}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">{c.label}{c.suffix ? ` (${c.suffix})` : ''}</div>
                    </div>
                ))}
            </div>

            {/* Crate Types Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-black text-slate-900 text-lg">Crate Types</h2>
                    <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1 font-bold">{crateTypes.length} types</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : crateTypes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-orange-400" />
                        </div>
                        <div className="text-lg font-black text-slate-700 mb-1">No Crate Types Yet</div>
                        <div className="text-sm text-slate-500 mb-6">Add crate types to start tracking your crate inventory</div>
                        <Button onClick={openAdd} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
                            <Plus className="w-4 h-4" /> Add First Crate Type
                        </Button>
                    </div>
                ) : (
                    <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left text-xs font-black uppercase text-slate-500 tracking-widest px-6 py-3">Crate Type</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Purchase Rate</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Sale Rate</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Total Purchased</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Sold</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Issued Out</th>
                                    <th className="text-right text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Available</th>
                                    <th className="text-center text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crateTypes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((c) => {
                                    const profit = c.sale_rate - c.purchase_rate
                                    const profitColor = profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-red-600' : 'text-slate-500'
                                    return (
                                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-sm">{c.name}</div>
                                                        <div className={cn('text-xs font-semibold flex items-center gap-1', profitColor)}>
                                                            {profit > 0 ? <TrendingUp className="w-3 h-3" /> : profit < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                                            {profit !== 0 ? `₹${Math.abs(profit).toLocaleString('en-IN')} ${profit > 0 ? 'profit' : 'loss'}/crate` : 'No margin set'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-slate-700">₹{c.purchase_rate.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-slate-700">₹{c.sale_rate.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-slate-700">{c.total_purchased}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-blue-700">{c.total_sold}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-amber-700">{c.total_issued_out}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span className={cn('font-black text-lg', c.available > 0 ? 'text-emerald-700' : 'text-red-600')}>
                                                    {c.available}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openStockModal(c)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Add Stock">
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openLossModal(c)} className="p-2 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors" title="Report Loss">
                                                        <TrendingDown className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-50/30">
                        {crateTypes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((c) => {
                            const profit = c.sale_rate - c.purchase_rate
                            const profitColor = profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-red-600' : 'text-slate-500'
                            
                            return (
                                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                                                <Package className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg">{c.name}</div>
                                                <div className={cn('text-xs font-semibold flex items-center gap-1', profitColor)}>
                                                    {profit > 0 ? <TrendingUp className="w-3 h-3" /> : profit < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                                    {profit !== 0 ? `₹${Math.abs(profit).toLocaleString('en-IN')} ${profit > 0 ? 'profit' : 'loss'}/crate` : 'No margin set'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Available</div>
                                            <div className={cn('font-black text-xl', c.available > 0 ? 'text-emerald-600' : 'text-red-500')}>
                                                {c.available}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Rate</div>
                                            <div className="font-bold text-slate-700">₹{c.purchase_rate.toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sale Rate</div>
                                            <div className="font-bold text-slate-700">₹{c.sale_rate.toLocaleString('en-IN')}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchased / Sold</div>
                                            <div className="font-bold text-slate-700">{c.total_purchased} <span className="text-slate-300">/</span> <span className="text-blue-600">{c.total_sold}</span></div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issued Out</div>
                                            <div className="font-bold text-amber-600">{c.total_issued_out}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <button onClick={() => openStockModal(c)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-emerald-50 text-emerald-600 font-bold text-xs transition-colors">
                                            <Archive className="w-3.5 h-3.5" /> Stock
                                        </button>
                                        <button onClick={() => openLossModal(c)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-orange-50 text-orange-500 font-bold text-xs transition-colors">
                                            <TrendingDown className="w-3.5 h-3.5" /> Loss
                                        </button>
                                        <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-blue-50 text-blue-600 font-bold text-xs transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(c)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-red-50 text-red-500 font-bold text-xs transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Del
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    </>
                )}
                {crateTypes.length > ITEMS_PER_PAGE && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500 font-semibold">
                            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, crateTypes.length)} of {crateTypes.length}
                        </span>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page * ITEMS_PER_PAGE >= crateTypes.length}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Crate Type Modal */}
            <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
                <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">
                            {editingCrate ? 'Edit Crate Type' : 'Add New Crate Type'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Crate Name *</Label>
                            <Input
                                placeholder="e.g. 20kg Plastic Crate"
                                value={typeForm.name}
                                onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))}
                                className="mt-1.5 h-11 rounded-xl border-slate-200 font-semibold"
                                disabled={!!editingCrate}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Purchase Rate (₹/crate)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={typeForm.purchase_rate}
                                    onChange={e => setTypeForm(f => ({ ...f, purchase_rate: e.target.value }))}
                                    className="mt-1.5 h-11 rounded-xl border-slate-200 font-semibold"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Sale Rate (₹/crate)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={typeForm.sale_rate}
                                    onChange={e => setTypeForm(f => ({ ...f, sale_rate: e.target.value }))}
                                    className="mt-1.5 h-11 rounded-xl border-slate-200 font-semibold"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Capacity (kg) — optional</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 20"
                                value={typeForm.capacity_kg}
                                onChange={e => setTypeForm(f => ({ ...f, capacity_kg: e.target.value }))}
                                className="mt-1.5 h-11 rounded-xl border-slate-200 font-semibold"
                            />
                        </div>
                        {typeForm.purchase_rate && typeForm.sale_rate && (
                            <div className={cn('p-3 rounded-xl text-sm font-bold text-center', 
                                parseFloat(typeForm.sale_rate) > parseFloat(typeForm.purchase_rate) ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                                {parseFloat(typeForm.sale_rate) > parseFloat(typeForm.purchase_rate) 
                                    ? `✓ Profit: ₹${(parseFloat(typeForm.sale_rate) - parseFloat(typeForm.purchase_rate)).toLocaleString('en-IN')}/crate`
                                    : `⚠ Loss: ₹${(parseFloat(typeForm.purchase_rate) - parseFloat(typeForm.sale_rate)).toLocaleString('en-IN')}/crate`}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowTypeModal(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSaveType} disabled={saving} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            {editingCrate ? 'Update' : 'Add Crate Type'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Stock Modal */}
            <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
                <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Add Crate Stock</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Crate Type *</Label>
                            <select
                                value={stockForm.crate_type}
                                onChange={e => {
                                    const ct = crateTypes.find(c => c.id === e.target.value)
                                    setStockForm(f => ({ ...f, crate_type: e.target.value, purchase_rate: ct ? String(ct.purchase_rate) : '' }))
                                }}
                                className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Select crate type...</option>
                                {crateTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Quantity *</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 100"
                                value={stockForm.qty}
                                onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))}
                                className="mt-1.5 h-11 rounded-xl border-slate-200 font-bold"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Notes (optional)</Label>
                            <Input
                                placeholder="e.g. Purchased from XYZ supplier"
                                value={stockForm.notes}
                                onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))}
                                className="mt-1.5 h-11 rounded-xl border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowStockModal(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleAddStock} disabled={stockSaving} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2">
                            {stockSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Add Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Loss Modal */}
            <Dialog open={showLossModal} onOpenChange={setShowLossModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" /> Report Crate Loss
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Crate Type</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-slate-200"
                                value={lossForm.crate_type}
                                onChange={e => setLossForm({ ...lossForm, crate_type: e.target.value })}
                            >
                                <option value="">Select Crate Type</option>
                                {crateTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Lost Quantity</Label>
                            <Input type="number" placeholder="0" value={lossForm.qty} onChange={e => setLossForm({ ...lossForm, qty: e.target.value })} />
                            <p className="text-xs text-slate-500">This will reduce your available stock and record a loss in Trading P&L.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason / Notes</Label>
                            <Input placeholder="e.g. Broken during transit, Stolen, etc." value={lossForm.notes} onChange={e => setLossForm({ ...lossForm, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLossModal(false)}>Cancel</Button>
                        <Button onClick={handleReportLoss} disabled={lossSaving} className="bg-red-600 hover:bg-red-700 text-white">
                            {lossSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Report Loss
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
