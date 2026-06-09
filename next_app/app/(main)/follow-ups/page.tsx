"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Search, Loader2, MessageCircle, AlertCircle, Phone, IndianRupee } from "lucide-react"
import { Input } from "@/components/ui/input"
import { callApi } from "@/lib/frappeClient"
import { cn } from "@/lib/utils"

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);

export default function FollowUpsPage() {
    const { profile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<'receivable' | 'payable'>('receivable')
    const [parties, setParties] = useState<any[]>([])
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(20)

    const fetchBalances = async () => {
        if (!profile?.organization_id) return
        setLoading(true)
        try {
            const res: any = await callApi('mandigrow.api.get_party_balances', {
                sub_filter: filterType,
                search_query: search,
                limit_start: page * pageSize,
                limit_page_length: pageSize
            })
            let data = [];
            if (Array.isArray(res)) data = res;
            else if (res?.data && Array.isArray(res.data)) data = res.data;
            else if (res?.message?.data && Array.isArray(res.message.data)) data = res.message.data;
            else if (Array.isArray(res?.message)) data = res.message;
            setParties(data)
        } catch (err) {
            console.error("Failed to fetch party balances:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchBalances()
        }, 300) // debounce
        return () => clearTimeout(timeout)
    }, [search, filterType, page, pageSize, profile?.organization_id])

    const handleWhatsApp = (party: any) => {
        if (!party.contact_phone) {
            alert("No phone number found for this party.");
            return;
        }
        
        let phone = party.contact_phone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone; // Default to India country code if missing

        const isPayable = party.net_balance < 0;
        const absBalance = Math.abs(party.net_balance);
        const formattedBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(absBalance);
        
        const orgName = profile?.organization || "us";
        
        let message = "";
        if (isPayable) {
            message = `Hello ${party.contact_name},\n\nThis is a friendly message from ${orgName}. Your account currently has a payable balance of ${formattedBalance} from our side. We will be clearing this shortly.\n\nPlease let us know if you need any clarification.`;
        } else {
            message = `Hello ${party.contact_name},\n\nThis is a gentle reminder from ${orgName}. Your account currently has an outstanding balance of ${formattedBalance}. Please arrange for the payment at your earliest convenience.\n\nThank you!`;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-rose-600 tracking-tighter uppercase">
                        Overdue <span className="text-slate-900">Follow-Ups</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-lg flex items-center gap-2 mt-1">
                        <MessageCircle className="w-5 h-5 text-rose-500" /> WhatsApp Reminders (Click-to-Chat)
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Party Name..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="pl-10 h-12 rounded-xl text-lg font-bold border-slate-200"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl h-12">
                    <button
                        onClick={() => { setFilterType('receivable'); setPage(0); }}
                        className={cn(
                            "flex-1 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all",
                            filterType === 'receivable' ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        To Collect
                    </button>
                    <button
                        onClick={() => { setFilterType('payable'); setPage(0); }}
                        className={cn(
                            "flex-1 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all",
                            filterType === 'payable' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        To Pay
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] tracking-widest font-black text-slate-400">
                            <tr>
                                <th className="px-6 py-5 rounded-tl-3xl">Party Details</th>
                                <th className="px-6 py-5 text-right">Outstanding Balance</th>
                                <th className="px-6 py-5 rounded-tr-3xl w-48 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && parties.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-rose-300" />
                                        Loading Accounts...
                                    </td>
                                </tr>
                            ) : parties.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-slate-300" />
                                        No outstanding balances found.
                                    </td>
                                </tr>
                            ) : (
                                parties.map((party, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-800 text-sm tracking-tight">
                                                    {party.contact_name}
                                                </span>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">
                                                        {party.contact_type || 'PARTY'}
                                                    </span>
                                                    {party.contact_city && <span>• {party.contact_city}</span>}
                                                    {party.contact_phone && (
                                                        <span className="flex items-center gap-1 text-slate-500">
                                                            <Phone className="w-3 h-3" /> {party.contact_phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={cn(
                                                "font-black text-lg tracking-tight",
                                                party.net_balance > 0 ? "text-rose-600" : "text-emerald-600"
                                            )}>
                                                {formatNumber(Math.abs(party.net_balance))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleWhatsApp(party)}
                                                disabled={!party.contact_phone}
                                                className={cn(
                                                    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                                    party.contact_phone 
                                                        ? "bg-[#25D366] hover:bg-[#1DA851] text-white shadow-lg shadow-green-500/20"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                )}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {party.contact_phone ? "WhatsApp" : "No Phone"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination Controls */}
            {!loading && parties.length > 0 && (
                <div className="mt-6 flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-slate-500 disabled:opacity-50 hover:bg-slate-50 rounded-xl"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-black tracking-widest text-slate-400">Page {page + 1}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={parties.length < pageSize}
                        className="px-6 py-3 font-bold text-xs uppercase tracking-widest text-slate-500 disabled:opacity-50 hover:bg-slate-50 rounded-xl"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
