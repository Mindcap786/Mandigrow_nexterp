"use client"
// Static export: client component — generateStaticParams is in layout.tsx

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Printer, ChevronLeft, Download, Loader2, FileText, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider"
import BuyerInvoice from "@/components/sales/invoice-template"
import ThermalReceipt from "@/components/sales/thermal-receipt"
import SmartShareButton from "@/components/billing/smart-share-button"
import { generateSaleReceiptESCPOS } from "@/lib/generate-thermal-escpos"
import { BluetoothPrinter } from "@/lib/bluetooth-printer"
import { useGlobalFeature } from "@/hooks/use-global-feature";
import { useLocalInvoice } from "@/hooks/use-local-invoice"
import LocalSaleInvoice from "@/components/local-invoices/LocalSaleInvoice"
import { LANG_LABELS, LANG_NAMES_ENGLISH, isValidLang } from "@/components/local-invoices/utils/fonts"
import type { LangCode } from "@/components/local-invoices/utils/fonts"
import { formatCommodityName } from "@/lib/utils/commodity-utils"
import html2canvas from "html2canvas"
import { useRef } from "react"
import { ESCPOS } from "@/lib/bluetooth-printer"

export default function SaleInvoicePage() {
    const { id } = useParams()
    const router = useRouter()
    const { profile } = useAuth()
    const organization = profile?.organization
    const [sale, setSale] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4')
    const [triggerPrint, setTriggerPrint] = useState(0)
    const [thermalWidth, setThermalWidth] = useState(48) // default 80mm
    const thermalRef = useRef<HTMLDivElement>(null);

    // Reset print mode after OS print dialog closes (prevents screen from staying blank after thermal print fallback)
    useEffect(() => {
        const handleAfterPrint = () => setPrintMode('a4');
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    // Local language invoices
    const { enabled: isGlobalEnabled } = useGlobalFeature('local_language_invoices')
    const isTenantEnabled = !!(profile as any)?.organization?.enable_local_invoices
    const localInvoice = useLocalInvoice(isGlobalEnabled, isTenantEnabled)

    useEffect(() => {
        const savedWidth = localStorage.getItem('thermalWidth');
        if (savedWidth) {
            setThermalWidth(parseInt(savedWidth, 10));
        } else if (organization?.settings?.thermal_printer_width) {
            setThermalWidth(organization.settings.thermal_printer_width === '58mm' ? 32 : 
                            organization.settings.thermal_printer_width === '110mm' ? 64 : 48);
        }
    }, [organization]);

    const handleWidthChange = (width: number) => {
        setThermalWidth(width);
        localStorage.setItem('thermalWidth', width.toString());
    };

    useEffect(() => {
        if (id && profile?.organization_id) {
            fetchSale()
        }
    }, [id, profile])

    useEffect(() => {
        if (triggerPrint > 0) {
            // Give React and browser engine ample time to apply print-specific DOM changes
            const timer = setTimeout(() => window.print(), 300);
            return () => clearTimeout(timer);
        }
    }, [triggerPrint]);

    // Auto-fetch translations for live preview
    useEffect(() => {
        if (localInvoice.isEnabled && localInvoice.activeLang && sale) {
            const itemNames = (sale.sale_items || []).map((i: any) => formatCommodityName(i.lot?.item?.name || i.item_name || '', i.lot?.item?.custom_attributes)).filter(Boolean)
            const partyName = sale.contact?.full_name || sale.buyer_name || ''
            localInvoice.fetchTranslations(itemNames, partyName)
        }
    }, [localInvoice.activeLang, sale, localInvoice.isEnabled])

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

    const handlePrint = async (mode: 'a4' | 'thermal', forcePrompt: boolean = false) => {
        // Fetch translations before printing if local language is active
        if (localInvoice.isEnabled && localInvoice.activeLang && sale) {
            const itemNames = (sale.sale_items || []).map((i: any) => formatCommodityName(i.lot?.item?.name || i.item_name || '', i.lot?.item?.custom_attributes)).filter(Boolean)
            const partyName = sale.contact?.name || sale.buyer_name || ''
            await localInvoice.fetchTranslations(itemNames, partyName)
        }

        if (mode === 'thermal') {
            try {
                // If local language is active, bypass raw text Bluetooth ESC/POS since thermal printers 
                // don't natively support rendering complex Indian scripts (Telugu/Gujarati, etc).
                if (!localInvoice.isEnabled || !localInvoice.activeLang || localInvoice.activeLang === 'en') {
                    const escposData = generateSaleReceiptESCPOS(sale, organization, thermalWidth);
                    const printer = new BluetoothPrinter();
                    await printer.connect(forcePrompt);
                    await printer.print(escposData);
                    // Successfully printed via Bluetooth, do not open OS print dialog
                    return;
                } else {
                    if (thermalRef.current) {
                        const originalCssText = thermalRef.current.style.cssText;
                        const originalDisplay = thermalRef.current.style.display;
                        
                        // Capture 384px (58mm) or 576px (80mm) based on thermalWidth
                        const pxWidth = thermalWidth === 48 ? 384 : 576;
                        
                        // Force strict top-left positioning to eliminate parent padding/margins offset
                        thermalRef.current.style.cssText = `position: fixed; top: 0; left: 0; width: ${pxWidth}px; display: block; z-index: -9999; margin: 0; padding: 0; background: white;`;
                        
                        const { toCanvas } = await import('html-to-image');
                        const canvas = await toCanvas(thermalRef.current, {
                            width: pxWidth,
                            canvasWidth: pxWidth,
                            pixelRatio: 1, // critical: prevent high-DPI scaling
                            backgroundColor: '#ffffff'
                        });
                        
                        thermalRef.current.style.cssText = originalCssText;
                        thermalRef.current.style.display = originalDisplay;

                        const escpos = new ESCPOS();
                        escpos.init();
                        escpos.image(canvas);
                        escpos.feed(3);
                        
                        const escposData = escpos.getBuffer();
                        const printer = new BluetoothPrinter();
                        await printer.connect(forcePrompt);
                        await printer.print(escposData);
                        return; // Successfully printed via Bluetooth
                    }
                }
            } catch (e: any) {
                console.error('Bluetooth print skipped or failed:', e);
                // Fall through to OS print dialog for iOS or if Bluetooth is not supported/connected
            }
            // Fall through to browser print for thermal fallback
            setPrintMode('thermal');
            setTriggerPrint(prev => prev + 1);
        } else {
            setPrintMode('a4');
            setTriggerPrint(prev => prev + 1);
        }
    };

    const handlePairPrinter = async () => {
        try {
            const printer = new BluetoothPrinter();
            await printer.connect(true); // force prompt to pair
            import('sonner').then(({ toast }) => {
                toast.success("Printer Paired Successfully", {
                    description: "You can now click THERMAL to print.",
                    position: 'top-center'
                });
            });
        } catch (e: any) {
            console.error('Bluetooth pairing failed:', e);
            import('sonner').then(({ toast }) => {
                toast.error("Pairing Failed", {
                    description: e.message || "Could not connect to printer.",
                    position: 'top-center'
                });
            });
        }
    };

    const handleDownload = async () => {
        if (!sale || isDownloading) return;
        setIsDownloading(true);
        try {
            const { generateInvoicePDF } = await import('@/lib/generate-invoice-pdf');
            const { downloadBlob } = await import('@/lib/capacitor-share');
            const options = (localInvoice.isEnabled && localInvoice.activeLang) ? {
                lang: localInvoice.activeLang,
                itemTranslations: localInvoice.itemTranslations,
                partyTranslation: localInvoice.partyTranslation
            } : undefined;
            const blob = await generateInvoicePDF(sale, organization, options);
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
        <div className="min-h-screen print:min-h-0 bg-zinc-950 p-4 md:p-8 space-y-8 print:p-0 print:space-y-0 print:bg-white">
            {/* Header / Actions */}
            <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <Button variant="ghost" className="text-gray-500 hover:text-white pl-0 md:pl-4" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" /> Back
                </Button>

                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex items-center bg-white text-black rounded-md overflow-hidden">
                        <Button className="flex-1 md:flex-none bg-transparent text-black hover:bg-black/5 font-bold h-10 md:h-12 px-2 md:px-4 text-[10px] md:text-sm rounded-none border-r border-black/10" onClick={() => handlePrint('thermal')}>
                            <Printer className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                            THERMAL
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-transparent text-black hover:bg-black/5 h-10 md:h-12 px-2 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handlePairPrinter} className="cursor-pointer">
                                    Connect New Printer...
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Paper Size</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleWidthChange(32)} className="cursor-pointer">
                                    {thermalWidth === 32 ? "✓ " : ""}58mm (Small)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleWidthChange(48)} className="cursor-pointer">
                                    {thermalWidth === 48 ? "✓ " : ""}80mm (Standard)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleWidthChange(64)} className="cursor-pointer">
                                    {thermalWidth === 64 ? "✓ " : ""}110mm (Large)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm" onClick={() => handlePrint('a4')}>
                        <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                        A4 INVOICE
                    </Button>

                    {/* Language selector — only shown when local_language_invoices feature is enabled */}
                    {localInvoice.isEnabled && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-4 text-[10px] md:text-sm gap-1.5"
                                >
                                    <Globe className="w-4 h-4 shrink-0" />
                                    <span className="truncate">
                                        {localInvoice.activeLang
                                            ? LANG_LABELS[localInvoice.activeLang]
                                            : 'English'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Invoice Language</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* English (default) */}
                                <DropdownMenuItem
                                    onClick={() => localInvoice.setActiveLang(null)}
                                    className="cursor-pointer"
                                >
                                    {!localInvoice.activeLang ? '✓ ' : ''}English (Default)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {/* All 8 local languages */}
                                {(Object.entries(LANG_LABELS) as [LangCode, string][]).map(([code, label]) => (
                                    <DropdownMenuItem
                                        key={code}
                                        onClick={() => localInvoice.setActiveLang(code)}
                                        className="cursor-pointer"
                                    >
                                        {localInvoice.activeLang === code ? '✓ ' : ''}
                                        {label} <span className="text-gray-400 ml-1 text-[10px]">({LANG_NAMES_ENGLISH[code]})</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button disabled={isDownloading} className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm" onClick={handleDownload}>
                        {isDownloading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 animate-spin shrink-0" /> : <Download className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />}
                        <span className="truncate">{isDownloading ? "SAVING..." : "DOWNLOAD"}</span>
                    </Button>
                    <div className="flex-1 md:flex-none min-w-[30%]">
                        {sale && (
                            <div className="[&>button]:w-full [&>button]:h-10 md:[&>button]:h-12 [&>button]:text-[10px] md:[&>button]:text-sm">
                                <SmartShareButton 
                                    sale={sale} 
                                    organization={organization} 
                                    options={(localInvoice.isEnabled && localInvoice.activeLang) ? {
                                        lang: localInvoice.activeLang,
                                        itemTranslations: localInvoice.itemTranslations,
                                        partyTranslation: localInvoice.partyTranslation
                                    } : undefined}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Template — local language invoice takes over when activeLang is set */}
            <div className="relative">
                <div className={printMode === 'thermal' ? "hidden print:hidden" : "block print:block"}>
                    {localInvoice.isEnabled && localInvoice.activeLang ? (
                        <LocalSaleInvoice
                            sale={sale}
                            organization={organization}
                            lang={localInvoice.activeLang}
                            itemTranslations={localInvoice.itemTranslations}
                            partyTranslation={localInvoice.partyTranslation}
                        />
                    ) : (
                        <BuyerInvoice sale={sale} organization={organization} onRefresh={() => fetchSale(true)} />
                    )}
                </div>
                <div ref={thermalRef} className={printMode === 'a4' ? "hidden print:hidden" : "hidden print:block"} style={{ width: thermalWidth === 48 ? '384px' : '576px' }}>
                    <ThermalReceipt 
                        sale={sale} 
                        organization={organization} 
                        lang={localInvoice.activeLang}
                        itemTranslations={localInvoice.itemTranslations}
                        partyTranslation={localInvoice.partyTranslation}
                    />
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    /* Hide elements that shouldn't be printed without leaving gaps */
                    .no-print { 
                        display: none !important; 
                    }

                    /* Reset heights to prevent blank trailing pages */
                    html, body, #__next {
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    /* Invoice styling overrides for clean print */
                    #invoice-print {
                        width: 100% !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    /* Remove page margins so the browser doesn't print its own header/footer URLs */
                    @page { 
                        margin: 0; 
                        size: auto; 
                    }
                }
            `}</style>
        </div>
    )
}
