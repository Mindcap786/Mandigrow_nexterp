import { GateEntryTable } from '@/components/gate/gate-entry-table'
import { Truck } from 'lucide-react'

// Migrated to Frappe — gate entries are fetched client-side via callApi()
export const dynamic = 'force-dynamic'

import { NewEntryModal } from '@/components/gate/new-entry-modal'

export default async function GateLogs() {
    // Data is now fetched client-side by the GateEntryTable component via Frappe RPC
    const gateEntries: any[] = []

    return (
        <div className="p-8">
            <header className="flex justify-between items-end mb-8 animate-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                        Inward Log
                    </h1>
                    <p className="text-gray-300 flex items-center font-medium">
                        <Truck className="w-4 h-4 mr-2 text-neon-blue" />
                        Real-time tracking of all vehicle arrivals and generated lots.
                    </p>
                </div>
                <NewEntryModal />
            </header>

            <GateEntryTable data={gateEntries} />
        </div>
    )
}
