'use client'

import { useState, useEffect } from 'react'

import { callApi } from '@/lib/frappeClient'
import { DataTable } from '@/components/ui/data-table'
import { Plus, Users, Search, Loader2, ShoppingBag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth/auth-provider'

export default function BuyersPage() {
    const { user } = useAuth()
    const [buyers, setBuyers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '', shop_name: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchBuyers()
    }, [])

    async function fetchBuyers() {
        setLoading(true)
        try {
            const data: any = await callApi('mandigrow.api.get_contacts', { contact_type: 'buyer' });
            if (data) setBuyers(data);
        } catch (err) {
            console.error('Error fetching buyers:', err);
        }
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return

        setSubmitting(true)
        try {
            await callApi('mandigrow.api.create_contact', {
                name: formData.name,
                contact_type: 'buyer',
                phone: formData.phone,
                city: formData.shop_name, // shop_name stored in city for display
            });

            setModalOpen(false)
            setFormData({ name: '', phone: '', shop_name: '' })
            fetchBuyers()

        } catch (err: any) {
            console.error('Error saving buyer:', err)
            alert('Error saving buyer: ' + (err.message || 'Unknown error'))
        } finally {
            setSubmitting(false)
        }
    }

    const filteredBuyers = buyers.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search)
    )

    const columns = [
        { header: 'Name', accessorKey: 'name', className: 'text-white font-medium' },
        { header: 'Shop Name', accessorKey: 'shop_name', className: 'text-gray-400' },
        { header: 'Phone', accessorKey: 'phone', className: 'text-gray-400' },
        { header: 'Outstanding', accessorKey: (row: any) => <span className={row.outstanding_balance > 0 ? 'text-red-400' : 'text-green-400'}>₹{row.outstanding_balance || 0}</span> }
    ]

    return (
        <div className="p-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neon-green tracking-tight mb-2">Buyers / Customers</h1>
                    <p className="text-gray-400 flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Manage your buyers and credit limits.
                    </p>
                </div>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-neon-green text-black font-bold px-6 py-2 rounded-md hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Buyer
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-neon-green">Onboard New Buyer</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input
                                    required
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-green outline-none"
                                    placeholder="e.g. Mahesh fruit wala"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Shop / Agency Name</label>
                                <input
                                    required
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-green outline-none"
                                    placeholder="e.g. Mahesh Traders"
                                    value={formData.shop_name}
                                    onChange={e => setFormData({ ...formData, shop_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                <input
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-neon-green outline-none"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <button disabled={submitting} type="submit" className="w-full bg-neon-green text-black font-bold py-2 rounded hover:bg-green-400 transition-colors mt-4">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Buyer'}
                            </button>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="flex items-center space-x-4 mb-6 bg-gray-900 p-2 rounded-lg border border-gray-800 w-full max-w-md">
                <Search className="w-5 h-5 text-gray-500 ml-2" />
                <input
                    className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-full outline-none"
                    placeholder="Search by name, shop or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-neon-green animate-spin" /></div>
            ) : (
                <DataTable columns={columns} data={filteredBuyers} />
            )}
        </div>
    )
}
