"use client"

import { useEffect, useState } from "react"
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider"
import { ContactDialog } from "@/components/contacts/contact-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Users, Phone, MapPin, Loader2, Printer, Download, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Trash2, Filter, ChevronDown, Pencil, Box, Archive, ArchiveRestore, Upload, QrCode, Share } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { isNativePlatform, isMobileAppView } from "@/lib/capacitor-utils"
import { useGlobalFeature } from "@/hooks/use-global-feature"
import { BulkImportDialog } from "@/components/contacts/bulk-import-dialog"
import { IDCard } from "@/components/contacts/id-card"
import { useRef } from "react"
import * as htmlToImage from 'html-to-image'
import { useReactToPrint } from "react-to-print"

// Native components
import { NativeCard } from "@/components/mobile/NativeCard"
import { SkeletonListScreen } from "@/components/mobile/ShimmerSkeleton"
import { ActionSheet, ActionSheetOption } from "@/components/mobile/ActionSheet"
import { DestructiveBottomSheet } from "@/components/mobile/BottomSheet"
import { SegmentedControl } from "@/components/mobile/SegmentedControl"

// ──────────────────────────────────────────────────────────────────────────────
// ALL BUSINESS LOGIC IDENTICAL — only JSX return changes on native
// ──────────────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
    const { profile } = useAuth()
    const schema = 'mandi'
    const [contacts, setContacts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [locationFilter, setLocationFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("active")
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [contactToDelete, setContactToDelete] = useState<{ id: string, name: string, error?: string } | null>(null)
    const [resetConfirm, setResetConfirm] = useState<{ id: string, name: string, type: string } | null>(null)
    const [resetSuccess, setResetSuccess] = useState<{ name: string, count: number } | null>(null)
    const [contactToPrint, setContactToPrint] = useState<any | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [mounted, setMounted] = useState(false)
    const [isBackfilling, setIsBackfilling] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)
    const itemsPerPage = 20

    const { enabled: isGlobalImportEnabled } = useGlobalFeature('bulk_import_contacts')
    const isTenantImportEnabled = profile?.organization?.enable_bulk_import
    const canImport = isGlobalImportEnabled || isTenantImportEnabled

    // Native ActionSheet state
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)
    const [activeFilterTarget, setActiveFilterTarget] = useState<'type' | 'location' | 'status'>('type')

    useEffect(() => {
        setMounted(true)
        if (profile?.organization_id) fetchContacts()
    }, [profile])

    // ──────────────────────────────────────────────────────────────────────────
    // REALTIME: Instant updates when contacts are added/changed
    // ──────────────────────────────────────────────────────────────────────────
    // Realtime neutralized for Frappe — polling can be added in Phase 4
    useEffect(() => {
        return () => {};
    }, [profile?.organization_id])

    const fetchContacts = async () => {
        if (!profile?.organization_id) return
        setLoading(true)
        try {
            const data: any = await callApi('mandigrow.api.get_contacts_page', {
                org_id: profile.organization_id,
                page: 1,
                page_size: 500,
            });
            const contacts = (data?.contacts || []).map((c: any) => ({
                ...c,
                type: c.contact_type || 'buyer',
                status: c.status || 'active',
            }));
            setContacts(contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
        setLoading(false)
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        setIsUpdating(id)
        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive'
        
        // Optimistic Update
        const previousContacts = [...contacts]
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))

        try {
            await callApi('mandigrow.api.update_contact', { contact_id: id, status: newStatus });
            toast.success(`Status updated to ${newStatus}`)
        } catch (error) {
            toast.error("Error updating status")
            console.error("Error updating status:", error)
            setContacts(previousContacts) // Rollback
        }
        setIsUpdating(null)
    }

    const resetSequence = async (contactId: string, contactName: string, type: string) => {
        setResetConfirm({ id: contactId, name: contactName, type })
    }

    const doResetSequence = async () => {
        if (!resetConfirm) return
        const { id: contactId, name: contactName } = resetConfirm
        setResetConfirm(null)
        setIsUpdating(contactId)
        try {
            const res: any = await callApi('mandigrow.api.reset_invoice_sequence', { contact_id: contactId });
            if (res?.success === false) {
                toast.error(`Reset failed: ${res.error || 'Unknown error'}`)
            } else {
                setResetSuccess({ name: contactName, count: res?.reset_count ?? 0 })
            }
        } catch (error: any) {
            toast.error(`Failed to reset sequence: ${error?.message || 'Network error'}`)
            console.error(error)
        }
        setIsUpdating(null)
    }

    const deleteContact = async (id: string, name: string) => {
        setIsUpdating(id)
        try {
            const res: any = await callApi('mandigrow.api.delete_contact', { contact_id: id });
            toast.success(res?.message || `Contact ${name} deleted successfully.`)
            fetchContacts()
            setContactToDelete(null)
        } catch (error: any) {
            console.error("Error deleting contact:", error)
            const msg = error?.message || `Failed to delete ${name}.`
            toast.error(msg)
            setContactToDelete(prev => prev ? { ...prev, error: msg } : null)
        }
        setIsUpdating(null)
    }

    const bulkResetSequences = async () => {
        const count = filteredContacts.length
        if (count === 0) return
        if (!confirm(`RESET SEQUENCES: Are you sure you want to reset sequences for ALL ${count} filtered contacts?`)) return
        setLoading(true)
        try {
            const contactIds = filteredContacts.map(c => c.id)
            const res: any = await callApi('mandigrow.api.bulk_reset_invoice_sequence', { contact_ids: JSON.stringify(contactIds) })
            
            if (res?.success === false) {
                toast.error(`Bulk reset failed: ${res.error || 'Unknown error'}`)
            } else {
                let msg = `Reset sequences for ${count} contacts`
                if (res?.reset_count) msg += ` (${res.reset_count} invoices archived)`
                if (res?.errors?.length > 0) msg += `. Failed for ${res.errors.length} contacts.`
                toast.success(msg)
            }
        } catch (error: any) { 
            toast.error(`Bulk reset failed: ${error?.message || 'Network error'}`) 
        }
        finally { setLoading(false) }
    }

    // One-time backfill: assign internal_id to all contacts that lack one
    const backfillIds = async () => {
        if (!profile?.organization_id) return
        setIsBackfilling(true)
        try {
            const res: any = await callApi('mandigrow.api.assign_missing_internal_ids', {
                org_id: profile.organization_id
            })
            if (res?.success) {
                toast.success(res.message || `Assigned IDs to ${res.assigned} contacts`)
                fetchContacts()
            } else {
                toast.error(res?.error || 'ID assignment failed')
            }
        } catch (e: any) {
            toast.error(`Failed: ${e?.message || 'Network error'}`)
        } finally {
            setIsBackfilling(false)
        }
    }

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.internal_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.contact_code?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === 'all' || c.type === typeFilter
        const matchesLocation = locationFilter === 'all' || c.city === locationFilter
        const contactStatus = c.status || 'active'
        const matchesStatus = statusFilter === 'all' || contactStatus === statusFilter
        return matchesSearch && matchesType && matchesLocation && matchesStatus
    })

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
    const currentItems = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
    }, [filteredContacts.length, currentPage, totalPages])

    const getPageNumbers = () => {
        const pages = []
        let start = Math.max(1, currentPage - 2)
        let end = Math.min(totalPages, start + 4)
        if (end - start < 4) start = Math.max(1, end - 4)
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
    }

    const handlePrintIdCard = useReactToPrint({
        contentRef: printRef,
        documentTitle: `ID_Card_${contactToPrint?.name || 'MandiGrow'}`,
    })

    const handlePrint = () => window.print()

    const handleDownloadCSV = () => {
        if (filteredContacts.length === 0) return
        const headers = ["Name", "Type", "Phone", "Location", "Status"]
        const csvContent = [headers.join(","), ...filteredContacts.map(c => [`"${c.name}"`, `"${c.type}"`, `"${c.phone || ''}"`, `"${c.city || ''}"`, `"${c.status || 'active'}"`].join(","))].join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        link.setAttribute("href", URL.createObjectURL(blob))
        link.setAttribute("download", `mandi_contacts_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const locations = Array.from(new Set(contacts.map(c => c.city).filter(Boolean)))

    // ── NATIVE TYPE BADGE COLORS ─────────────────────────────────────────────
    const typeBadge = (type: string) => {
        if (type === 'farmer') return { bg: '#DCFCE7', text: '#16A34A' }
        if (type === 'buyer') return { bg: '#DBEAFE', text: '#2563EB' }
        return { bg: '#EDE9FE', text: '#7C3AED' }
    }

    // ── NATIVE FILTER ACTION SHEET OPTIONS ───────────────────────────────────
    const filterOptions: Record<string, ActionSheetOption[]> = {
        type: [
            { label: 'All Types', value: 'all' },
            { label: 'Farmer', value: 'farmer' },
            { label: 'Buyer', value: 'buyer' },
            { label: 'Supplier', value: 'supplier' },
        ],
        location: [
            { label: 'All Locations', value: 'all' },
            ...locations.map(loc => ({ label: loc, value: loc })),
        ],
        status: [
            { label: 'All Statuses', value: 'all' },
            { label: 'Active Only', value: 'active' },
            { label: 'Archived', value: 'inactive' },
        ],
    }

    const filterValues: Record<string, string> = { type: typeFilter, location: locationFilter, status: statusFilter }
    const filterSetters: Record<string, (v: string) => void> = { type: setTypeFilter, location: setLocationFilter, status: setStatusFilter }

    const handleFilterSelect = (opt: ActionSheetOption) => {
        if (opt.value) filterSetters[activeFilterTarget](opt.value)
    }

    // ── TYPE SEGMENT OPTIONS ─────────────────────────────────────────────────
    const typeSegments = [
        { label: `All (${contacts.length})`, value: 'all' },
        { label: 'Farmers', value: 'farmer' },
        { label: 'Buyers', value: 'buyer' },
        { label: 'Suppliers', value: 'supplier' },
    ]

    // ── NATIVE MOBILE RENDER ─────────────────────────────────────────────────
    if (isMobileAppView()) {
        return (
            <div className="bg-[#EFEFEF] min-h-dvh pb-4">
                {/* Search + filter row */}
                <div className="px-4 pt-3 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search name, city, type…"
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1A6B3C]"
                        />
                    </div>
                    {/* Filter button */}
                    <button
                        onClick={() => { setActiveFilterTarget('status'); setFilterSheetOpen(true) }}
                        className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Filter className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    {/* Add Contact */}
                    <ContactDialog onSuccess={fetchContacts}>
                        <button className="w-11 h-11 rounded-xl bg-[#1A6B3C] flex items-center justify-center active:scale-95 transition-transform shadow-[0_2px_6px_rgba(26,107,60,0.3)]">
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </ContactDialog>
                </div>

                {/* Type segmented filter */}
                <SegmentedControl options={typeSegments} value={typeFilter} onChange={setTypeFilter} className="px-0" />

                {/* Summary count */}
                <div className="px-4 pb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#6B7280]">
                        {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                        {statusFilter !== 'all' && ` · ${statusFilter}`}
                    </p>
                    {typeFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'active' ?
                        <button
                            onClick={() => { setTypeFilter('all'); setLocationFilter('all'); setStatusFilter('active') }}
                            className="text-xs text-[#DC2626] font-semibold"
                        >
                            Clear filters
                        </button>
                        : null
                    }
                </div>

                {/* Contact list */}
                {loading ? (
                    <SkeletonListScreen count={6} />
                ) : (
                    <div className="px-4 space-y-2">
                        {filteredContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF]">
                                <Users className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">No contacts found</p>
                            </div>
                        ) : (
                            filteredContacts.map(contact => {
                                const badge = typeBadge(contact.type)
                                const isActive = (contact.status || 'active') === 'active'
                                return (
                                    <NativeCard key={contact.id} className="overflow-hidden">
                                        {/* Main row */}
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            {/* Avatar */}
                                            <div
                                                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                                                style={{ backgroundColor: badge.bg, color: badge.text }}
                                            >
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{contact.name}</p>
                                                    <span
                                                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md flex-shrink-0"
                                                        style={{ backgroundColor: badge.bg, color: badge.text }}
                                                    >
                                                        {contact.type}
                                                    </span>
                                                    {(contact.internal_id || contact.contact_code) && (
                                                        <span className="text-[9px] font-mono font-black border border-slate-200 bg-slate-50 px-1 rounded text-slate-500 uppercase">
                                                            ID: {contact.internal_id || contact.contact_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                    {contact.phone && (
                                                        <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                                                            <Phone className="w-3 h-3" /> {contact.phone}
                                                        </span>
                                                    )}
                                                    {contact.city && (
                                                        <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                                            <MapPin className="w-3 h-3" /> {contact.city}
                                                        </span>
                                                    )}
                                                    {contact.crate_balances && contact.crate_balances.length > 0 && (
                                                        <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                                            <Box className="w-3 h-3" />
                                                            {contact.crate_balances.map((cb: any) => `${cb.qty} ${cb.type}`).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status toggle */}
                                            <button
                                                onClick={() => toggleStatus(contact.id, contact.status || 'active')}
                                                disabled={isUpdating === contact.id}
                                                className="flex-shrink-0"
                                            >
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full transition-colors duration-300 relative",
                                                    isActive ? "bg-[#16A34A]" : "bg-[#D1D5DB]"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                                                        isActive ? "left-6" : "left-1"
                                                    )} />
                                                </div>
                                            </button>
                                        </div>

                                        {/* Action row */}
                                        <div className="flex border-t border-[#F3F4F6]">
                                            <ContactDialog onSuccess={fetchContacts} initialData={contact}>
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#2563EB] active:bg-blue-50 transition-colors border-r border-[#F3F4F6]"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                                </button>
                                            </ContactDialog>
                                            <button
                                                onClick={() => resetSequence(contact.id, contact.name, contact.type)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#6B7280] active:bg-gray-50 transition-colors border-r border-[#F3F4F6]"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Reset
                                            </button>
                                            <button
                                                onClick={() => setContactToPrint({ ...contact, internal_id: contact.internal_id || contact.contact_code })}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-purple-600 active:bg-purple-50 transition-colors border-r border-[#F3F4F6]"
                                            >
                                                <Printer className="w-3.5 h-3.5" /> ID Card
                                            </button>
                                            <button
                                                onClick={() => setContactToDelete({ id: contact.id, name: contact.name })}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#DC2626] active:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>
                                    </NativeCard>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Filter Action Sheet */}
                <ActionSheet
                    open={filterSheetOpen}
                    onClose={() => setFilterSheetOpen(false)}
                    title={activeFilterTarget === 'type' ? 'Filter by Type' : activeFilterTarget === 'location' ? 'Filter by Location' : 'Filter by Status'}
                    options={filterOptions[activeFilterTarget]}
                    onSelect={handleFilterSelect}
                    selectedValue={filterValues[activeFilterTarget]}
                />

                {/* Delete Confirmation */}
                <DestructiveBottomSheet
                    open={!!contactToDelete}
                    onClose={() => setContactToDelete(null)}
                    title="Delete Contact"
                    description={<>Are you sure you want to remove <strong>"{contactToDelete?.name}"</strong>? Their historical invoices and financial records will be preserved.</>}
                    confirmLabel="Delete Contact"
                    onConfirm={() => {
                        if (contactToDelete) {
                            deleteContact(contactToDelete.id, contactToDelete.name)
                        }
                    }}
                    loading={isUpdating === contactToDelete?.id}
                />
            </div>
        )
    }

    // ── WEB / DESKTOP RENDER (ORIGINAL — UNCHANGED) ──────────────────────────
    return (
        <div className="p-8 space-y-6 min-h-screen bg-slate-50 text-black print:bg-white print:p-0">
            {/* ── PRINT ONLY HEADER ─────────────────────────────────────────── */}
            <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{profile?.organization?.name || 'MANDIPRO NETWORK'}</h2>
                        <h1 className="text-4xl font-[1000] tracking-tighter uppercase mt-1">Network Contacts Report</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-500">Report Generated On</p>
                        <p className="font-mono font-bold text-sm">{mounted ? new Date().toLocaleString() : '--'}</p>
                    </div>
                </div>
            </div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-4xl font-[1000] tracking-tighter text-black uppercase">Network Contacts</h1>
                    <p className="text-slate-600 font-bold flex items-center gap-2 mt-1"><Users className="w-4 h-4 text-blue-600" />Manage Farmers, Buyers, and Suppliers</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handlePrint} className="h-12 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-100 hidden sm:flex"><Printer className="w-4 h-4 mr-2" /> Print</Button>
                    <Button variant="outline" onClick={handleDownloadCSV} className="h-12 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-100"><Download className="w-4 h-4 mr-2" /> Export</Button>
                    {(searchTerm || typeFilter !== 'all' || locationFilter !== 'all') && (
                        <Button variant="outline" onClick={bulkResetSequences} className="h-12 px-4 rounded-xl font-bold text-orange-600 border-orange-100 hover:bg-orange-50 bg-orange-50/30"><RotateCcw className="w-4 h-4 mr-2" /> Reset All Filtered</Button>
                    )}
                    {/* Backfill button — only shown if some contacts have no internal_id */}
                    {contacts.some(c => !c.internal_id) && (
                        <Button
                            variant="outline"
                            onClick={backfillIds}
                            disabled={isBackfilling}
                            className="h-12 px-4 rounded-xl font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50 bg-indigo-50/30 hidden sm:flex"
                        >
                            {isBackfilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                            Assign IDs
                        </Button>
                    )}
                    {canImport && (
                        <BulkImportDialog onSuccess={fetchContacts}>
                            <Button variant="outline" className="h-12 px-4 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-100 hidden sm:flex"><Upload className="w-4 h-4 mr-2" /> Import</Button>
                        </BulkImportDialog>
                    )}
                    <ContactDialog onSuccess={fetchContacts}>
                        <Button className="bg-black text-white hover:bg-slate-800 font-black shadow-lg rounded-xl h-12 px-6"><Plus className="w-5 h-5 mr-2 hidden sm:block" /> ADD</Button>
                    </ContactDialog>
                </div>
            </header>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm print:border-none print:p-0 print:shadow-none">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 print:hidden">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                        <div className="relative flex-1 w-full md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input placeholder="Search name, city, or type..." className="pl-9 bg-slate-50 border-slate-200 text-black font-bold focus:border-blue-500 rounded-xl h-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select className="h-11 px-4 bg-slate-50 border-slate-200 text-black font-bold rounded-xl text-xs focus:ring-0 focus:border-blue-500 outline-none transition-all cursor-pointer" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">All Types</option>
                                <option value="farmer">Farmer</option>
                                <option value="buyer">Buyer</option>
                                <option value="supplier">Supplier</option>
                            </select>
                            <select className="h-11 px-4 bg-slate-50 border-slate-200 text-black font-bold rounded-xl text-xs focus:ring-0 focus:border-blue-500 outline-none transition-all cursor-pointer" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                                <option value="all">All Locations</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                        <Button
                            variant={statusFilter === 'active' ? "default" : "ghost"}
                            className={`rounded-lg px-6 font-bold text-sm h-11 transition-all flex-1 md:flex-none ${statusFilter === 'active' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
                            onClick={() => setStatusFilter('active')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={statusFilter === 'inactive' ? "default" : "ghost"}
                            className={`rounded-lg px-6 font-bold text-sm h-11 transition-all flex-1 md:flex-none ${statusFilter === 'inactive' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
                            onClick={() => setStatusFilter('inactive')}
                        >
                            <Archive className="w-4 h-4 mr-2" />
                            Archived
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="hover:bg-transparent border-slate-200">
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Internal ID</TableHead>
                                <TableHead className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Name</TableHead>
                                <TableHead className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Type</TableHead>
                                <TableHead className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Phone</TableHead>
                                <TableHead className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Location</TableHead>
                                <TableHead className="text-slate-600 font-black uppercase tracking-wider text-[10px]">Crates</TableHead>
                                <TableHead className="text-right text-slate-600 font-black uppercase tracking-wider text-[10px] print:hidden">Sequences</TableHead>
                                <TableHead className="text-right text-slate-600 font-black uppercase tracking-wider text-[10px] print:hidden">Status</TableHead>
                                <TableHead className="w-12 print:hidden"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={8} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                            ) : filteredContacts.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="h-32 text-center"><div className="flex flex-col items-center gap-2 text-slate-400"><Users className="w-8 h-8 opacity-50" /><span className="font-bold text-sm">No contacts found in network.</span></div></TableCell></TableRow>
                            ) : (
                                currentItems.map((contact) => (
                                    <TableRow key={contact.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <TableCell className="font-mono text-[10px] font-black text-blue-600/70 group-hover:text-blue-700 transition-colors uppercase tracking-widest bg-slate-50/50 px-3 py-1 rounded-md inline-block mt-3 ml-3">
                                            {contact.internal_id || contact.contact_code || '---'}
                                        </TableCell>
                                        <TableCell className="font-bold text-black text-sm py-4">{contact.name}</TableCell>
                                        <TableCell><span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${contact.type === 'farmer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : contact.type === 'buyer' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{contact.type}</span></TableCell>
                                        <TableCell className="text-slate-800 font-black text-xs"><div className="flex items-center gap-2">{contact.phone ? (<><Phone className="w-3.5 h-3.5 text-blue-500" /> {contact.phone}</>) : <span className="text-slate-300">-</span>}</div></TableCell>
                                        <TableCell className="text-slate-800 font-black text-xs"><div className="flex items-center gap-2">{contact.city ? (<><MapPin className="w-3.5 h-3.5 text-red-500" /> {contact.city}</>) : <span className="text-slate-300">-</span>}</div></TableCell>
                                        <TableCell className="text-slate-800 font-bold text-xs">
                                            {contact.crate_balances && contact.crate_balances.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {contact.crate_balances.map((cb: any, i: number) => (
                                                        <span key={i} className="text-[10px] uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 inline-block whitespace-nowrap">
                                                            {cb.qty > 0 ? `To Recv: ${cb.qty}` : cb.qty < 0 ? `To Pay: ${Math.abs(cb.qty)}` : 0} <span className="font-black">{cb.type}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-slate-300">-</span>}
                                        </TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors" onClick={() => resetSequence(contact.id, contact.name, contact.type)} title="Reset Invoice Sequence"><RotateCcw className="w-3.5 h-3.5" /></Button>
                                        </TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${(contact.status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{(contact.status || 'active') === 'inactive' ? 'archived' : contact.status || 'active'}</span>
                                        </TableCell>
                                        <TableCell className="text-right print:hidden">
                                            <div className="flex justify-end gap-1">
                                                {(contact.status || 'active') === 'inactive' ? (
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => toggleStatus(contact.id, 'inactive')}
                                                        className="h-8 px-3 rounded-full hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 font-bold text-xs transition-colors"
                                                    >
                                                        <ArchiveRestore className="w-4 h-4 mr-1" />
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <ContactDialog onSuccess={fetchContacts} initialData={contact}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Contact"><Pencil className="w-3.5 h-3.5" /></Button>
                                                        </ContactDialog>
                                                        <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setContactToPrint({ ...contact, internal_id: contact.internal_id || contact.contact_code }) }} title="Print ID Card"><Printer className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setContactToDelete({ id: contact.id, name: contact.name }) }} title="Delete Contact" disabled={isUpdating === contact.id}><Trash2 className="w-4 h-4" /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 px-2 print:hidden">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length}</p>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></Button>
                            {getPageNumbers().map(pageNum => (<Button key={pageNum} variant={pageNum === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(pageNum)} className={cn("h-8 w-8 p-0 rounded-lg font-bold text-xs transition-all", pageNum === currentPage ? "bg-black text-white shadow-md border-black hover:bg-black" : "border-slate-200 text-slate-600 hover:bg-slate-100")}>{pageNum}</Button>))}
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Contact Dialog */}
            <Dialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Delete Contact</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-2">Are you sure you want to remove <span className="font-bold text-slate-900">"{contactToDelete?.name}"</span> from your network?<br /><br />Their historical invoices and financial records will be preserved for your accounting.</DialogDescription>
                    </DialogHeader>
                    
                    {contactToDelete?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200">
                            {contactToDelete.error}
                        </div>
                    )}
                    
                    <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setContactToDelete(null)} className="font-bold">Cancel</Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white font-bold" onClick={() => { if (contactToDelete) { deleteContact(contactToDelete.id, contactToDelete.name) } }} disabled={isUpdating === contactToDelete?.id}>
                            {isUpdating === contactToDelete?.id ? "Deleting..." : "Delete Contact"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Sequence Confirmation Dialog */}
            <Dialog open={!!resetConfirm} onOpenChange={(open) => !open && setResetConfirm(null)}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Reset Invoice Sequence</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-2">
                            Reset invoice numbering for <span className="font-bold text-slate-900">"{resetConfirm?.name}"</span>?<br /><br />
                            All existing bill numbers will be archived. The <strong>next invoice for this contact will start from #1</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setResetConfirm(null)} className="font-bold">Cancel</Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={doResetSequence}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Confirm Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Sequence Success Dialog */}
            <Dialog open={!!resetSuccess} onOpenChange={(open) => !open && setResetSuccess(null)}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-emerald-600">✅ Sequence Reset Done</DialogTitle>
                        <DialogDescription className="text-slate-600 font-medium pt-2">
                            Invoice sequence for <span className="font-bold text-slate-900">"{resetSuccess?.name}"</span> has been reset.<br /><br />
                            {resetSuccess?.count === 0
                                ? 'No previous invoices found — sequence was already clear.'
                                : <>{resetSuccess?.count} invoice(s) archived. </>}
                            The <strong>next invoice will be #1</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full" onClick={() => setResetSuccess(null)}>Got It</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print ID Card Dialog */}
            <Dialog open={!!contactToPrint} onOpenChange={(open) => !open && setContactToPrint(null)}>
                <DialogContent className="sm:max-w-md bg-white border-slate-200 p-0 overflow-hidden">
                    <div className="bg-slate-50 p-6 pb-4 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-[1000] italic tracking-tighter text-black uppercase">
                                PRINT <span className="text-blue-600">ID CARD</span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-700 font-bold">
                                Print ID card for {contactToPrint?.name}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 pt-6 flex flex-col items-center">
                        {contactToPrint && (
                            <div className="print:absolute print:inset-0 print:m-0 print:flex print:items-start print:justify-start">
                                <IDCard 
                                    ref={printRef} 
                                    contact={contactToPrint} 
                                    organizationName={profile?.organization?.name} 
                                />
                            </div>
                        )}
                        <div className="flex gap-3 w-full pt-6 print:hidden">
                            <Button variant="outline" className="flex-1 rounded-xl border-slate-300 font-bold text-black" onClick={() => setContactToPrint(null)}>
                                Close
                            </Button>
                            <Button 
                                variant="outline" 
                                className="flex-1 rounded-xl border-slate-300 font-bold text-blue-600 hover:bg-blue-50" 
                                onClick={async () => {
                                    if (!printRef.current) return;
                                    try {
                                        const toastId = toast.loading('Preparing image...');
                                        const blob = await htmlToImage.toBlob(printRef.current, { 
                                            pixelRatio: 3, // High quality for sharing
                                            backgroundColor: '#ffffff'
                                        });
                                        toast.dismiss(toastId);
                                        if (!blob) throw new Error('Could not generate image');
                                        
                                        const file = new File([blob], `${contactToPrint?.name}-ID.png`, { type: 'image/png' });
                                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                                            await navigator.share({
                                                title: `${contactToPrint?.name} - ID Card`,
                                                text: `Official ID Card for ${contactToPrint?.name}`,
                                                files: [file]
                                            });
                                        } else {
                                            // Fallback to download
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${contactToPrint?.name}-ID.png`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            toast.success('Image downloaded (Share not supported on this browser)');
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        toast.error('Failed to share ID card');
                                    }
                                }}
                            >
                                <Share className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            <Button onClick={() => handlePrintIdCard()} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-black tracking-tight rounded-xl">
                                <Printer className="w-4 h-4 mr-2" />
                                Print Now
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
