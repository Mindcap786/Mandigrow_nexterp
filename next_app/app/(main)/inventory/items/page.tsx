"use client"

import { useCallback, useEffect, useState } from "react"
import { callApi } from "@/lib/frappeClient";
 // proxy fallback
import { useAuth } from "@/components/auth/auth-provider"
import { cacheGet, cacheSet } from "@/lib/data-cache"
import { ItemDialog } from "@/components/inventory/item-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCommodityName } from "@/lib/utils/commodity-utils"
import { Plus, Search, Package, Scale, Tag, Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ItemsPage() {
    const { profile, loading: authLoading } = useAuth()
    const schema = 'mandi';
    const [items, setItems] = useState<any[]>(() => {
        // Hydrate from cache immediately if available
        if (typeof window !== 'undefined') {
            const orgId = localStorage.getItem('mandi_profile_cache_org_id');
            if (orgId) return cacheGet<any[]>('commodity_master', orgId) || [];
        }
        return [];
    })
    const [loading, setLoading] = useState(() => {
        // If we have cached items, don't show the initial loader
        if (typeof window !== 'undefined') {
            const orgId = localStorage.getItem('mandi_profile_cache_org_id');
            const cached = orgId ? cacheGet<any[]>('commodity_master', orgId) : null;
            return !cached || cached.length === 0;
        }
        return true;
    })
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (profile?.organization_id) {
            fetchItems(false) // Background refresh (no loading state)
        } else if (!authLoading) {
            setLoading(false)
        }
    }, [profile?.organization_id, authLoading])

    const fetchItems = useCallback(async (showLoading = true) => {
        const currentOrgId = String(profile?.organization_id || "");
        if (!currentOrgId || currentOrgId === '[object Object]' || currentOrgId === 'undefined') return;

        try {
            if (showLoading && items.length === 0) setLoading(true)
            const res = await callApi('mandigrow.api.get_commodities')
            
            if (res && res.commodities) {
                setItems(res.commodities)
                cacheSet('commodity_master', currentOrgId, res.commodities)
            }
        } catch (error) {
            console.error("Error fetching items:", error)
        } finally {
            setLoading(false)
        }
    }, [profile?.organization_id, items.length])

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.local_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.internal_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        try {
            const res = await callApi('mandigrow.api.delete_commodity', { id });
            if (res && res.success) {
                toast({ title: "Deleted", description: "Item removed successfully." });
                fetchItems(false);
            }
        } catch (error: any) {
            toast({
                title: "Delete Failed",
                description: error.message || "Cannot delete item. It might be used in transactions.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="p-8 space-y-6 text-slate-900 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-[1000] tracking-tighter text-black uppercase">
                        Commodity Master
                    </h1>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4 text-blue-600" />
                        Manage Farmers, Buyers, and Suppliers
                    </p>
                </div>
                {profile?.organization_id && (
                    <ItemDialog onSuccess={() => fetchItems(false)}>
                        <Button className="bg-black text-white hover:bg-slate-800 font-black shadow-lg rounded-xl h-12 px-6">
                            <Plus className="w-5 h-5 mr-2" /> ADD NEW
                        </Button>
                    </ItemDialog>
                )}
            </header>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or local name..."
                            className="pl-9 bg-slate-50 border-slate-200 text-black font-bold focus:border-blue-500 rounded-xl h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="hover:bg-transparent border-slate-200">
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Commodity Name</TableHead>
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Variety</TableHead>
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Grade</TableHead>
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Local Name</TableHead>
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Unit</TableHead>
                                <TableHead className="text-slate-500 font-black uppercase tracking-wider text-[10px] w-28 text-right">Internal ID</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-neon-blue" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                        No commodities found. Define your first product.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <TableCell className="font-bold py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Tag className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-black text-sm">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.variety ? (
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase">
                                                    {item.variety}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.grade ? (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[9px] font-black text-amber-600 uppercase">
                                                    {item.grade}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500 font-medium italic text-xs">
                                            {item.local_name || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                                                {item.default_unit}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                                            {item.internal_id || '---'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 pr-2">
                                                {profile?.organization_id && (
                                                    <>
                                                        <ItemDialog onSuccess={() => fetchItems(false)} initialItem={item}>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 text-slate-400 hover:text-black">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </ItemDialog>
                                                        
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-2xl border-slate-200 shadow-2xl">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase">Delete {item.name}?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-slate-500 font-medium">
                                                                        Are you sure you want to remove this commodity? This action cannot be undone if the item has no transactions.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-black uppercase tracking-widest px-6"
                                                                    >
                                                                        Delete Item
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
            </div>
        </div>
    )
}
