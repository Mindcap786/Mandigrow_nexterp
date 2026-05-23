'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { callApi } from '@/lib/frappeClient'
import { useAuth } from '@/components/auth/auth-provider'
import {
    Package, ArrowUpRight, ArrowDownLeft, AlertTriangle, Loader2, Plus, X,
    CheckCircle, Users, Calendar, Search, ChevronRight, IndianRupee,
    RefreshCw, Clock, BarChart3, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast, Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'

type Tab = 'give' | 'receive' | 'report'

interface CrateType { id: string; name: string; purchase_rate: number; sale_rate: number; available: number }
interface Contact { id: string; name: string; type: string; city?: string }
interface IssueRow {
    issue_id: string; issue_date: string; party_id: string; party_name: string; party_type: string
    expected_return_date: string | null; status: string; row_name: string; crate_type: string
    qty_issued: number; qty_returned: number; qty_balance: number; rate: number
    is_overdue: boolean; outstanding_value: number; charge_to_ledger: boolean
}

export default function CrateIssuePage() {
    const { profile } = useAuth()
    const [tab, setTab] = useState<Tab>('give')
    const [crateTypes, setCrateTypes] = useState<CrateType[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [issues, setIssues] = useState<IssueRow[]>([])
    const [summary, setSummary] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [searchParty, setSearchParty] = useState('')
    const [searchIssue, setSearchIssue] = useState('')

    // Give crates form
    const [giveForm, setGiveForm] = useState({
        party_id: '', party_name: '', party_type: 'buyer', expected_return_date: '', notes: '',
        items: [{ crate_type: '', qty: '', rate: '' }]
    })
    const [partyPickerOpen, setPartyPickerOpen] = useState(false)

    // Receive dialog
    const [receiveOpen, setReceiveOpen] = useState(false)
    const [receiveIssueId, setReceiveIssueId] = useState('')
    const [receiveItems, setReceiveItems] = useState<{ row_name: string; crate_type: string; max: number; qty: string }[]>([])
    const [receiveSaving, setReceiveSaving] = useState(false)

    // Charge to ledger dialog
    const [chargeOpen, setChargeOpen] = useState(false)
    const [chargeIssueId, setChargeIssueId] = useState('')
    const [chargeIssueRows, setChargeIssueRows] = useState<any[]>([])
    const [chargePartyName, setChargePartyName] = useState('')
    const [chargeSaving, setChargeSaving] = useState(false)

    const fetchAll = useCallback(async () => {
        if (!profile?.organization_id) return
        setLoading(true)
        try {
            const [ctRes, contactRes, issueRes] = await Promise.all([
                callApi('mandigrow.api.get_crate_master_data'),
                callApi('mandigrow.api.get_contacts', { org_id: profile.organization_id }),
                callApi('mandigrow.api.get_crate_issues_report'),
            ])
            setCrateTypes(ctRes?.crate_types || [])
            const rawContacts = contactRes?.contacts || contactRes?.records || contactRes || []
            setContacts(rawContacts.map((c: any) => ({
                id: c.name || c.id,
                name: c.full_name || c.name,
                type: c.contact_type || 'buyer',
                city: c.city || ''
            })))
            const rows = issueRes?.rows || []
            setIssues(rows)
            setSummary(issueRes?.summary || {})
        } catch (e: any) {
            toast.error('Failed to load data', { description: e.message })
        } finally {
            setLoading(false)
        }
    }, [profile?.organization_id])

    useEffect(() => { fetchAll() }, [fetchAll])

    // ── Give Crates ────────────────────────────────────────────────────────────

    const addGiveItem = () => setGiveForm(f => ({ ...f, items: [...f.items, { crate_type: '', qty: '', rate: '' }] }))
    const removeGiveItem = (i: number) => setGiveForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
    const updateGiveItem = (i: number, key: string, val: string) =>
        setGiveForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [key]: val } : item) }))

    const handleGive = async () => {
        if (!giveForm.party_id && !giveForm.party_name) { toast.error('Select or enter a party name'); return }
        const validItems = giveForm.items.filter(i => i.crate_type && parseInt(i.qty) > 0)
        if (validItems.length === 0) { toast.error('Add at least one crate item'); return }
        setSaving(true)
        try {
            const res = await callApi('mandigrow.api.create_crate_issue', {
                party_id: giveForm.party_id,
                party_name: giveForm.party_name,
                party_type: giveForm.party_type,
                expected_return_date: giveForm.expected_return_date || null,
                notes: giveForm.notes,
                items: JSON.stringify(validItems.map(i => ({
                    crate_type: i.crate_type,
                    qty: parseInt(i.qty),
                    rate: parseFloat(i.rate) || 0,
                }))),
            })
            if (res?.success) {
                toast.success('Crates issued successfully!', { description: `Issue ID: ${res.issue_id}` })
                setGiveForm({ party_id: '', party_name: '', party_type: 'buyer', expected_return_date: '', notes: '', items: [{ crate_type: '', qty: '', rate: '' }] })
                setTab('receive')
                fetchAll()
            } else {
                toast.error(res?.error || 'Failed to issue crates')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    // ── Receive Crates ─────────────────────────────────────────────────────────

    const openReceive = (issueId: string) => {
        const rows = issues.filter(r => r.issue_id === issueId && r.qty_balance > 0)
        if (rows.length === 0) { toast.info('All crates already returned'); return }
        setReceiveIssueId(issueId)
        setReceiveItems(rows.map(r => ({ row_name: r.row_name, crate_type: r.crate_type, max: r.qty_balance, qty: String(r.qty_balance) })))
        setReceiveOpen(true)
    }

    const handleReceive = async () => {
        const payload = receiveItems.filter(r => parseInt(r.qty) > 0).map(r => ({
            row_name: r.row_name, crate_type: r.crate_type, qty_now_returned: parseInt(r.qty)
        }))
        if (payload.length === 0) { toast.error('Enter qty to receive'); return }
        setReceiveSaving(true)
        try {
            const res = await callApi('mandigrow.api.receive_crates', {
                issue_id: receiveIssueId,
                received_items: JSON.stringify(payload)
            })
            if (res?.success) {
                toast.success('Crates received!', { description: `Status: ${res.status}` })
                setReceiveOpen(false)
                fetchAll()
            } else {
                toast.error(res?.error || 'Failed to receive crates')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setReceiveSaving(false)
        }
    }

    // ── Charge to Ledger ───────────────────────────────────────────────────────

    const openCharge = (issueId: string) => {
        const rows = issues.filter(r => r.issue_id === issueId && r.qty_balance > 0)
        if (rows.length === 0) { toast.info('No outstanding balance to charge'); return }
        setChargeIssueId(issueId)
        setChargePartyName(rows[0]?.party_name || '')
        setChargeIssueRows(rows.map(r => ({ ...r, qty_to_charge: r.qty_balance })))
        setChargeOpen(true)
    }

    const handleCharge = async () => {
        setChargeSaving(true)
        try {
            const res = await callApi('mandigrow.api.charge_crate_to_ledger_v2', {
                issue_id: chargeIssueId,
                items_to_charge: JSON.stringify(chargeIssueRows.map(r => ({
                    row_name: r.row_name, crate_type: r.crate_type, qty_to_charge: r.qty_to_charge
                })))
            })
            if (res?.success) {
                toast.success('Charged to ledger!', { description: res.message })
                setChargeOpen(false)
                fetchAll()
            } else {
                toast.error(res?.error || 'Failed to charge')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setChargeSaving(false)
        }
    }

    // Group issues by issue_id for receive/charge
    const issueGroups = Array.from(new Set(issues.map(r => r.issue_id))).map(id => {
        const rows = issues.filter(r => r.issue_id === id)
        const first = rows[0]
        const totalBalance = rows.reduce((s, r) => s + r.qty_balance, 0)
        const totalValue = rows.reduce((s, r) => s + r.outstanding_value, 0)
        const hasOverdue = rows.some(r => r.is_overdue)
        return { id, party_name: first?.party_name, party_type: first?.party_type, issue_date: first?.issue_date, expected_return_date: first?.expected_return_date, status: first?.status, rows, totalBalance, totalValue, hasOverdue }
    }).filter(g => searchIssue ? g.party_name?.toLowerCase().includes(searchIssue.toLowerCase()) : true)

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchParty.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchParty.toLowerCase())
    )

    const TABS: { id: Tab; label: string; icon: any; color: string }[] = [
        { id: 'give', label: 'Give Crates', icon: ArrowUpRight, color: 'text-orange-600 bg-orange-50 border-orange-200' },
        { id: 'receive', label: 'Receive / Track', icon: ArrowDownLeft, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        { id: 'report', label: 'Summary Report', icon: BarChart3, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/10 p-4 md:p-6">
            <Toaster richColors position="top-center" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Crate Tracker</h1>
                    <p className="text-slate-500 text-sm">Issue, receive, and charge crates to parties</p>
                </div>
                <button onClick={fetchAll} className="ml-auto p-2 rounded-xl hover:bg-slate-100 text-slate-500" title="Refresh">
                    <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
                </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'Open Issues', value: summary.open_issues || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Crates Out', value: summary.total_crates_out || 0, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Overdue', value: summary.overdue_count || 0, color: 'text-red-700', bg: 'bg-red-50' },
                ].map((s, i) => (
                    <div key={i} className={cn('rounded-2xl p-3 text-center', s.bg)}>
                        <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
                        <div className="text-xs font-bold text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border whitespace-nowrap',
                            tab === t.id ? t.color : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-50'
                        )}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Give Crates ── */}
            {tab === 'give' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl mx-auto">
                    <h2 className="text-lg font-black text-slate-900 mb-5">Give Crates to Party</h2>

                    {/* Party Selection */}
                    <div className="mb-4">
                        <Label className="text-xs font-black uppercase text-slate-600 tracking-widest mb-1.5 block">Party (Buyer / Farmer / Supplier)</Label>
                        {giveForm.party_name ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                <Users className="w-5 h-5 text-blue-600" />
                                <div className="flex-1">
                                    <div className="font-black text-blue-900 text-sm">{giveForm.party_name}</div>
                                    <div className="text-xs text-blue-600 capitalize">{giveForm.party_type}</div>
                                </div>
                                <button onClick={() => setGiveForm(f => ({ ...f, party_id: '', party_name: '' }))} className="text-blue-400 hover:text-blue-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <Input
                                    placeholder="Search by name or type ad-hoc name..."
                                    value={searchParty}
                                    onChange={e => setSearchParty(e.target.value)}
                                    onFocus={() => setPartyPickerOpen(true)}
                                    className="h-11 rounded-xl border-slate-200"
                                />
                                {partyPickerOpen && searchParty && (
                                    <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto z-50">
                                        {filteredContacts.slice(0, 10).map(c => (
                                            <button key={c.id} onClick={() => {
                                                setGiveForm(f => ({ ...f, party_id: c.id, party_name: c.name, party_type: c.type }))
                                                setSearchParty('')
                                                setPartyPickerOpen(false)
                                            }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                                                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900">{c.name}</div>
                                                    <div className="text-xs text-slate-500 capitalize">{c.type}{c.city ? ` • ${c.city}` : ''}</div>
                                                </div>
                                            </button>
                                        ))}
                                        {filteredContacts.length === 0 && (
                                            <button onClick={() => {
                                                setGiveForm(f => ({ ...f, party_id: '', party_name: searchParty }))
                                                setSearchParty('')
                                                setPartyPickerOpen(false)
                                            }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                                                <Plus className="w-4 h-4 text-orange-500" />
                                                <div className="font-bold text-sm text-orange-700">Use "{searchParty}" (ad-hoc)</div>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Expected Return Date */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest mb-1.5 block">Expected Return Date</Label>
                            <Input
                                type="date"
                                value={giveForm.expected_return_date}
                                onChange={e => setGiveForm(f => ({ ...f, expected_return_date: e.target.value }))}
                                className="h-11 rounded-xl border-slate-200 font-semibold"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest mb-1.5 block">Party Type</Label>
                            <select
                                value={giveForm.party_type}
                                onChange={e => setGiveForm(f => ({ ...f, party_type: e.target.value }))}
                                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="buyer">Buyer</option>
                                <option value="farmer">Farmer</option>
                                <option value="supplier">Supplier</option>
                                <option value="adhoc">Ad-hoc</option>
                            </select>
                        </div>
                    </div>

                    {/* Crate Items */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Crate Items</Label>
                            <button onClick={addGiveItem} className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                <Plus className="w-3.5 h-3.5" /> Add Row
                            </button>
                        </div>
                        <div className="space-y-2">
                            {giveForm.items.map((item, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <select
                                        value={item.crate_type}
                                        onChange={e => {
                                            const ct = crateTypes.find(c => c.id === e.target.value)
                                            updateGiveItem(i, 'crate_type', e.target.value)
                                            if (ct) updateGiveItem(i, 'rate', String(ct.sale_rate || ct.purchase_rate || ''))
                                        }}
                                        className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select crate type</option>
                                        {crateTypes.map(c => <option key={c.id} value={c.id}>{c.name} (Avail: {c.available})</option>)}
                                    </select>
                                    <Input type="number" placeholder="Qty" value={item.qty}
                                        onChange={e => updateGiveItem(i, 'qty', e.target.value)}
                                        className="w-24 h-10 rounded-xl border-slate-200 font-bold text-center" />
                                    <Input type="number" placeholder="Rate ₹" value={item.rate}
                                        onChange={e => updateGiveItem(i, 'rate', e.target.value)}
                                        className="w-28 h-10 rounded-xl border-slate-200 font-bold" />
                                    {giveForm.items.length > 1 && (
                                        <button onClick={() => removeGiveItem(i)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <Label className="text-xs font-black uppercase text-slate-600 tracking-widest mb-1.5 block">Notes (optional)</Label>
                        <Input placeholder="e.g. Given for packing purposes"
                            value={giveForm.notes}
                            onChange={e => setGiveForm(f => ({ ...f, notes: e.target.value }))}
                            className="h-11 rounded-xl border-slate-200" />
                    </div>

                    <Button onClick={handleGive} disabled={saving} className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base gap-2 shadow-lg">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                        Issue Crates
                    </Button>
                </div>
            )}

            {/* ── TAB: Receive / Track ── */}
            {tab === 'receive' && (
                <div className="space-y-4">
                    <Input
                        placeholder="Search by party name..."
                        value={searchIssue}
                        onChange={e => setSearchIssue(e.target.value)}
                        className="h-11 rounded-xl border-slate-200 max-w-sm"
                    />
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
                    ) : issueGroups.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <div className="font-black text-slate-600 text-lg">No Open Issues</div>
                            <div className="text-slate-400 text-sm mt-1">All crates have been returned</div>
                        </div>
                    ) : issueGroups.map(group => (
                        <div key={group.id} className={cn('bg-white rounded-2xl shadow-sm border overflow-hidden', group.hasOverdue ? 'border-red-200' : 'border-slate-100')}>
                            {/* Issue Header */}
                            <div className={cn('px-5 py-4 flex items-start justify-between', group.hasOverdue ? 'bg-red-50' : 'bg-slate-50/50')}>
                                <div className="flex items-center gap-3">
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', group.hasOverdue ? 'bg-red-100' : 'bg-blue-100')}>
                                        <Users className={cn('w-5 h-5', group.hasOverdue ? 'text-red-600' : 'text-blue-600')} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-900 text-sm">{group.party_name}</span>
                                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full capitalize', {
                                                'bg-blue-100 text-blue-700': group.party_type === 'buyer',
                                                'bg-green-100 text-green-700': group.party_type === 'farmer',
                                                'bg-purple-100 text-purple-700': group.party_type === 'supplier',
                                                'bg-slate-100 text-slate-700': !['buyer', 'farmer', 'supplier'].includes(group.party_type || ''),
                                            })}>{group.party_type}</span>
                                            {group.hasOverdue && <span className="text-xs font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />OVERDUE</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                                            <span>Issued: {group.issue_date}</span>
                                            {group.expected_return_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Return by: {group.expected_return_date}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">{group.totalBalance} crates</div>
                                    {group.totalValue > 0 && <div className="text-xs font-bold text-slate-500">₹{group.totalValue.toLocaleString('en-IN')}</div>}
                                </div>
                            </div>

                            {/* Issue Rows */}
                            <div className="px-5 py-3 divide-y divide-slate-50">
                                {group.rows.map(row => (
                                    <div key={row.row_name} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400" />
                                            <span className="font-bold text-slate-700 text-sm">{row.crate_type}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-slate-500">Issued: <b>{row.qty_issued}</b></span>
                                            <span className="text-emerald-600">Returned: <b>{row.qty_returned}</b></span>
                                            <span className={cn('font-black', row.qty_balance > 0 ? 'text-red-600' : 'text-emerald-700')}>Balance: {row.qty_balance}</span>
                                            {row.rate > 0 && <span className="text-slate-400">@₹{row.rate}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            {group.totalBalance > 0 && (
                                <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
                                    <Button size="sm" onClick={() => openReceive(group.id)} variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5">
                                        <ArrowDownLeft className="w-3.5 h-3.5" /> Receive Crates
                                    </Button>
                                    <Button size="sm" onClick={() => openCharge(group.id)} variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold gap-1.5">
                                        <IndianRupee className="w-3.5 h-3.5" /> Charge to Ledger
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── TAB: Summary Report ── */}
            {tab === 'report' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: 'Total Issues Open', value: summary.open_issues || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
                            { label: 'Total Crates Out', value: summary.total_crates_out || 0, color: 'text-amber-700', bg: 'bg-amber-50' },
                            { label: 'Overdue Parties', value: summary.overdue_count || 0, color: 'text-red-700', bg: 'bg-red-50' },
                            { label: 'Value Outstanding', value: `₹${(summary.total_value_out || 0).toLocaleString('en-IN')}`, color: 'text-purple-700', bg: 'bg-purple-50' },
                        ].map((s, i) => (
                            <div key={i} className={cn('rounded-2xl p-4', s.bg)}>
                                <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
                                <div className="text-xs font-bold text-slate-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="font-black text-slate-900">Outstanding Crates — Party Wise</h3>
                        </div>
                        {issues.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
                                <div className="font-bold">All crates accounted for!</div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            {['Party', 'Type', 'Crate Type', 'Issued', 'Returned', 'Balance', 'Return By', 'Status', 'Value'].map(h => (
                                                <th key={h} className="text-left text-xs font-black uppercase text-slate-500 tracking-widest px-4 py-3">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.map((row, i) => (
                                            <tr key={i} className={cn('border-b border-slate-50 hover:bg-slate-50/50', row.is_overdue && 'bg-red-50/30')}>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-900">{row.party_name}</div>
                                                    <div className="text-xs text-slate-400">{row.issue_id}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{row.party_type}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700">{row.crate_type}</td>
                                                <td className="px-4 py-3 font-bold text-slate-700">{row.qty_issued}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-700">{row.qty_returned}</td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('font-black', row.qty_balance > 0 ? 'text-red-700' : 'text-emerald-700')}>{row.qty_balance}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={cn('flex items-center gap-1 text-xs font-bold', row.is_overdue ? 'text-red-600' : 'text-slate-500')}>
                                                        {row.is_overdue && <AlertTriangle className="w-3 h-3" />}
                                                        {row.expected_return_date || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn('text-xs font-black px-2 py-0.5 rounded-full', {
                                                        'bg-amber-100 text-amber-700': row.status === 'Open',
                                                        'bg-blue-100 text-blue-700': row.status === 'Partially Returned',
                                                        'bg-emerald-100 text-emerald-700': row.status === 'Closed',
                                                    })}>{row.status}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700">
                                                    {row.outstanding_value > 0 ? `₹${row.outstanding_value.toLocaleString('en-IN')}` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Receive Dialog ── */}
            <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Receive Crates</DialogTitle>
                        <DialogDescription>Enter how many crates were returned.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {receiveItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                                <Package className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-black text-sm text-slate-900">{item.crate_type}</div>
                                    <div className="text-xs text-slate-500">Outstanding: {item.max}</div>
                                </div>
                                <Input
                                    type="number"
                                    value={item.qty}
                                    max={item.max}
                                    onChange={e => setReceiveItems(ri => ri.map((r, idx) => idx === i ? { ...r, qty: e.target.value } : r))}
                                    className="w-24 h-9 rounded-xl border-slate-200 font-black text-center text-lg"
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setReceiveOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleReceive} disabled={receiveSaving} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2">
                            {receiveSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Confirm Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Charge to Ledger Dialog ── */}
            <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Charge to Ledger</DialogTitle>
                        <DialogDescription>This will post a Debit entry to <b>{chargePartyName}</b>'s financial ledger for unreturned crates.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {chargeIssueRows.map((row, i) => {
                            const rate = row.rate || 0
                            const total = (row.qty_to_charge || 0) * rate
                            return (
                                <div key={i} className="flex items-center gap-3 bg-red-50 rounded-xl p-3">
                                    <Package className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-black text-sm text-slate-900">{row.crate_type}</div>
                                        <div className="text-xs text-red-600 font-bold">Balance: {row.qty_balance} × ₹{rate} = ₹{total.toLocaleString('en-IN')}</div>
                                    </div>
                                    <Input
                                        type="number"
                                        value={row.qty_to_charge}
                                        max={row.qty_balance}
                                        onChange={e => setChargeIssueRows(rows => rows.map((r, idx) => idx === i ? { ...r, qty_to_charge: parseInt(e.target.value) || 0 } : r))}
                                        className="w-20 h-9 rounded-xl border-red-200 font-black text-center text-base"
                                    />
                                </div>
                            )
                        })}
                        <div className="bg-red-100 rounded-xl p-3 text-center">
                            <div className="text-sm font-black text-red-800">
                                Total to charge: ₹{chargeIssueRows.reduce((s, r) => s + ((r.qty_to_charge || 0) * (r.rate || 0)), 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-red-600 mt-0.5">This will be posted as Debit in {chargePartyName}'s ledger</div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setChargeOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleCharge} disabled={chargeSaving} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-black gap-2">
                            {chargeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
                            Charge to Ledger
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
