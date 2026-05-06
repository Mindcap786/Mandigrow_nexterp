"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Printer, ChevronLeft, Download, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { callApi } from "@/lib/frappeClient";
 // proxy fallback
import { useAuth } from "@/components/auth/auth-provider"
import PurchaseBillInvoice from "@/components/purchase/purchase-invoice-template"

export default function PurchaseBillInvoicePage() {
    const { id } = useParams()    // This is the lot_id
    const router = useRouter()
    const { profile } = useAuth()
    const organization = profile?.organization
    const [lot, setLot] = useState<any>(null)
    const [arrival, setArrival] = useState<any>(null)
    const [arrivalLots, setArrivalLots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        if (id && profile?.organization_id) {
            fetchData()
        }
    }, [id, profile])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res: any = await callApi('mandigrow.api.get_purchase_bill_details', { lot_id: id });
            
            if (res.error) throw new Error(res.error);
            const data = res.message || res; // handle both shapes

            // Map Frappe response to existing frontend state
            setLot({
                ...data,
                // Ensure we use the resolved human name from backend
                farmer: data.farmer || (data.arrival?.party_id ? { name: data.arrival.party_id } : null),
                item: data.all_lots?.find((l: any) => l.id === id) || null
            })
            setArrival(data.arrival)
            setArrivalLots(data.all_lots || [])

        } catch (err: any) {
            console.error("Purchase Bill Fetch Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = async () => {
        if (!lot || isDownloading) return;
        setIsDownloading(true);
        try {
            const { generatePurchaseBillPDF } = await import('@/lib/generate-invoice-pdf').catch(() => ({ generatePurchaseBillPDF: null })) as any;
            if (generatePurchaseBillPDF) {
                const { downloadBlob } = await import('@/lib/capacitor-share');
                const blob = await generatePurchaseBillPDF(lot, arrival, organization, arrivalLots);
                const billNo = arrival?.contact_bill_no || arrival?.bill_no || lot.lot_code || 'bill';
                await downloadBlob(blob, `PurchaseBill_${billNo}.pdf`);
            } else {
                // Fallback: print to PDF
                handlePrint();
            }
        } catch {
            // Fallback: print to PDF
            handlePrint();
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Resolving Purchase Bill...
            </div>
        )
    }

    if (!lot) {
        return (
            <div className="h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">
                Purchase Bill Not Found
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8 space-y-8">
            {/* Header / Actions */}
            <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <Button variant="ghost" className="text-gray-500 hover:text-white pl-0 md:pl-4" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" /> Back
                </Button>

                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full md:w-auto">
                    <Button
                        className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                        PRINT
                    </Button>
                    <Button
                        disabled={isDownloading}
                        className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm"
                        onClick={handleDownload}
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 animate-spin shrink-0" /> : <Download className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />}
                        <span className="truncate">{isDownloading ? "SAVING..." : "DOWNLOAD"}</span>
                    </Button>
                </div>
            </div>

            {/* Verification Header */}
            <div className="max-w-[800px] mx-auto bg-purple-950/20 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4 no-print">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm tracking-tight uppercase">
                        Purchase Bill — {lot.farmer?.name || 'Supplier'}
                    </h3>
                    <p className="text-purple-500/60 text-xs font-medium">
                        Lot {lot.lot_code} • {lot.item?.name || 'Item'} • Settlement document for farmer/supplier payment
                    </p>
                </div>
            </div>

            {/* Template — elevated card presentation */}
            <div className="max-w-[800px] mx-auto shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5">
                <PurchaseBillInvoice
                    lot={lot}
                    arrival={arrival}
                    organization={organization}
                    arrivalLots={arrivalLots}
                />
            </div>

            <style jsx global>{`
                @media print {
                    /* Step 1: hide every element on the page */
                    body * { visibility: hidden !important; }

                    /* Step 2: show only the invoice and its children */
                    #purchase-invoice-print,
                    #purchase-invoice-print * { visibility: visible !important; }

                    /* Step 3: pull the invoice to the top-left corner so it fills the page */
                    #purchase-invoice-print {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 24px !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                    }

                    /* Remove page margins so the invoice fills the sheet */
                    @page { margin: 0; size: A4 portrait; }
                }
            `}</style>
        </div>
    )
}
