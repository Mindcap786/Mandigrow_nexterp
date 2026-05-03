"use client"
// Static export: client component — generateStaticParams is in layout.tsx



import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Printer, ChevronLeft, Download, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { callApi } from "@/lib/frappeClient";
 // proxy fallback
import { useAuth } from "@/components/auth/auth-provider"
import BuyerInvoice from "@/components/sales/invoice-template"
import SmartShareButton from "@/components/billing/smart-share-button"

export default function SaleInvoicePage() {
    const { id } = useParams()
    const router = useRouter()
    const { profile } = useAuth()
    const organization = profile?.organization
    const [sale, setSale] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        if (id && profile?.organization_id) {
            fetchSale()
        }
    }, [id, profile])

    const fetchSale = async (isRefresh = false, retryCount = 0) => {
        if (!isRefresh && retryCount === 0) setLoading(true)
        let isRetrying = false;

        try {
            const saleData: any = await callApi('mandigrow.api.get_sales_invoice_detail', { sale_id: id });
            
            if (!saleData) {
                console.warn("Sale Fetch lag/error: No Data", "Retry:", retryCount)
                if (retryCount < 4) { // Trigger 4 retries for safety
                    isRetrying = true;
                    setTimeout(() => fetchSale(false, retryCount + 1), 1000)
                    return;
                }
                console.error("No sale record found for ID:", id)
                return;
            }

            // Merge balance data into sale object matching Supabase's old structure
            const finalSale = {
                ...saleData,
                contact: {
                    name: saleData.buyer_name,
                    city: saleData.buyer_city,
                    gstin: saleData.buyer_gstin
                },
                sale_items: saleData.items,
                payment_summary: {
                    amount_paid: saleData.amount_received,
                    amount_received: saleData.amount_received,
                    balance_due: saleData.balance_due,
                    status: saleData.payment_status
                }
            }
            setSale(finalSale)
        } catch (e: any) {
            console.error("fetchSale Comprehensive Error:", e)
            setFetchError(e?.message || e?.toString() || "Unknown error fetching sale")
        } finally {
            if (!isRetrying) setLoading(false)
        }
    }

    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrint = () => {
        window.print();   // CSS @media print below isolates #invoice-print from the dark shell
    };

    const handleDownload = async () => {
        if (!sale || isDownloading) return;
        setIsDownloading(true);
        try {
            const { generateInvoicePDF } = await import('@/lib/generate-invoice-pdf');
            const { downloadBlob } = await import('@/lib/capacitor-share');
            const blob = await generateInvoicePDF(sale, organization);
            const billNo = sale.contact_bill_no ?? sale.bill_no;
            await downloadBlob(blob, `Invoice_${billNo}.pdf`);
        } catch (e) {
            console.error('Invoice Download Error:', e);
            alert('Failed to generate PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">Validating Voucher...</div>

    if (!sale) return <div className="h-screen flex flex-col items-center justify-center text-white font-black gap-4">
        <span>Invoice Not Found</span>
        <span className="text-gray-500 font-normal text-xs font-mono">ID: {id} | Org: {profile?.organization_id}</span>
        {fetchError && <span className="text-red-500 font-normal text-sm bg-red-950/30 px-4 py-2 rounded-lg">{fetchError}</span>}
    </div>

    return (
        <div className="min-h-screen bg-zinc-950 p-8 space-y-8">
            {/* Header / Actions */}
            <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <Button variant="ghost" className="text-gray-500 hover:text-white pl-0 md:pl-4" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" /> Back
                </Button>

                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full md:w-auto">
                    <Button className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                        PRINT
                    </Button>
                    <Button disabled={isDownloading} className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm" onClick={handleDownload}>
                        {isDownloading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 animate-spin shrink-0" /> : <Download className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />}
                        <span className="truncate">{isDownloading ? "SAVING..." : "DOWNLOAD"}</span>
                    </Button>
                    <div className="flex-1 md:flex-none min-w-[30%]">
                        {sale && (
                            <div className="[&>button]:w-full [&>button]:h-10 md:[&>button]:h-12 [&>button]:text-[10px] md:[&>button]:text-sm">
                                <SmartShareButton sale={sale} organization={organization} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Header */}
            <div className="max-w-[800px] mx-auto bg-green-950/20 border border-green-500/20 p-4 rounded-2xl flex items-center gap-4 no-print">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm tracking-tight uppercase">Double-Entry Verified</h3>
                    <p className="text-green-500/60 text-xs font-medium">This transaction has been cryptographically signed and logged in the organization ledger.</p>
                </div>
            </div>

            {/* Template */}
            <div className="relative">
                <BuyerInvoice sale={sale} organization={organization} onRefresh={() => fetchSale(true)} />
            </div>

            <style jsx global>{`
                @media print {
                    /* Step 1: hide every element on the page */
                    body * { visibility: hidden !important; }

                    /* Step 2: show only the invoice and its children */
                    #invoice-print,
                    #invoice-print * { visibility: visible !important; }

                    /* Step 3: pull the invoice to the top-left corner so it fills the page */
                    #invoice-print {
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
