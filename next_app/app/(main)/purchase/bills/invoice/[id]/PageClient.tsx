"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Printer, ChevronLeft, Download, ShieldCheck, Loader2, Settings, FileText, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { callApi } from "@/lib/frappeClient";
import { useAuth } from "@/components/auth/auth-provider"
import PurchaseBillInvoice from "@/components/purchase/purchase-invoice-template"
import { BluetoothPrinter } from "@/lib/bluetooth-printer"
import { generatePurchaseReceiptESCPOS, generateLocalLangPurchaseReceiptESCPOS } from "@/lib/generate-thermal-escpos"
import { useGlobalFeature } from "@/hooks/use-global-feature";
import { useLocalInvoice } from "@/hooks/use-local-invoice"
import LocalPurchaseBill from "@/components/local-invoices/LocalPurchaseBill"
import { LANG_LABELS, LANG_NAMES_ENGLISH } from "@/components/local-invoices/utils/fonts"
import type { LangCode } from "@/components/local-invoices/utils/fonts"
import { formatCommodityName } from "@/lib/utils/commodity-utils"

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
    const [isSharing, setIsSharing] = useState(false)
    const [thermalWidth, setThermalWidth] = useState(48) // default 80mm
    const [triggerPrint, setTriggerPrint] = useState(0)
    const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4')
    const thermalRef = useRef<HTMLDivElement>(null);

    // Local language invoices
    const { enabled: isGlobalEnabled } = useGlobalFeature('local_language_invoices')
    const isTenantEnabled = !!(profile as any)?.organization?.enable_local_invoices
    const localInvoice = useLocalInvoice(isGlobalEnabled, isTenantEnabled)

    // Reset print mode after OS print dialog closes
    useEffect(() => {
        const handleAfterPrint = () => setPrintMode('a4');
        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

    useEffect(() => {
        if (triggerPrint > 0) {
            const timer = setTimeout(() => window.print(), 300);
            return () => clearTimeout(timer);
        }
    }, [triggerPrint]);

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

    // Auto-fetch translations for live preview and printing
    useEffect(() => {
        if (localInvoice.isEnabled && localInvoice.activeLang && lot && arrival) {
            const itemNamesSet = new Set<string>();
            if (lot.item?.name || lot.item_name) itemNamesSet.add(formatCommodityName(lot.item?.name || lot.item_name, lot.item?.custom_attributes));
            arrivalLots.forEach((l: any) => {
                if (l.item?.name || l.item_name) itemNamesSet.add(formatCommodityName(l.item?.name || l.item_name, l.item?.custom_attributes));
            });
            const itemNames = Array.from(itemNamesSet).filter(Boolean);
            const partyName = arrival.supplier_name || arrival.contact?.full_name || '';
            localInvoice.fetchTranslations(itemNames, partyName);
        }
    }, [localInvoice.activeLang, lot, arrival, arrivalLots, localInvoice.isEnabled]);

    const handleThermalPrint = async (forcePrompt: boolean = false) => {
        // Fetch translations before printing if local language is active
        if (localInvoice.isEnabled && localInvoice.activeLang && lot && arrival) {
            const itemNamesSet = new Set<string>();
            if (lot.item?.name || lot.item_name) itemNamesSet.add(formatCommodityName(lot.item?.name || lot.item_name, lot.item?.custom_attributes));
            arrivalLots.forEach((l: any) => {
                if (l.item?.name || l.item_name) itemNamesSet.add(formatCommodityName(l.item?.name || l.item_name, l.item?.custom_attributes));
            });
            const itemNames = Array.from(itemNamesSet).filter(Boolean);
            const partyName = arrival.supplier_name || arrival.contact?.full_name || '';
            await localInvoice.fetchTranslations(itemNames, partyName);
        }

        try {
            const isLocalLang = localInvoice.isEnabled && localInvoice.activeLang && localInvoice.activeLang !== 'en';

            if (!isLocalLang) {
                // English → fast raw ASCII ESC/POS text
                const escposData = generatePurchaseReceiptESCPOS(lot, arrival, organization, arrivalLots, thermalWidth);
                const printer = new BluetoothPrinter();
                await printer.connect(forcePrompt);
                await printer.print(escposData);
                return;
            } else {
                // Local language → image-based bitmap (standard printers have no Indian font ROMs)
                if (thermalRef.current) {
                    let pxWidth = 576;
                    if (thermalWidth === 32) pxWidth = 384;
                    if (thermalWidth === 64) pxWidth = 768;

                    const clone = thermalRef.current.cloneNode(true) as HTMLElement;
                    clone.style.cssText = `position: absolute; top: 0; left: 0; width: ${pxWidth}px; display: block; z-index: -9999; margin: 0; padding: 0; background: white; opacity: 1;`;
                    document.body.appendChild(clone);

                    const { toCanvas } = await import('html-to-image');
                    const canvas = await toCanvas(clone, {
                        width: pxWidth,
                        canvasWidth: pxWidth,
                        pixelRatio: 1, // Must be 1 to match printer width
                        backgroundColor: '#ffffff',
                        style: { margin: '0', padding: '0', transform: 'none' }
                    });

                    document.body.removeChild(clone);

                    const { ESCPOS } = await import('@/lib/bluetooth-printer');
                    const escpos = new ESCPOS();
                    escpos.init();
                    escpos.image(canvas);
                    escpos.feed(3);

                    const escposData = escpos.getBuffer();
                    const printer = new BluetoothPrinter();
                    await printer.connect(forcePrompt);
                    await printer.print(escposData);
                    return;
                }
            }
        } catch (e: any) {
            console.error('Bluetooth print skipped or failed:', e);
        }

        // Fallback: OS print dialog (for iOS or Bluetooth failure)
        setPrintMode('thermal');
        setTriggerPrint(prev => prev + 1);
    };

    const handlePairPrinter = async () => {
        try {
            const printer = new BluetoothPrinter();
            await printer.connect(true);
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
        if (!lot || isDownloading || isSharing) return;
        setIsDownloading(true);
        try {
            const { generatePurchaseBillPDF } = await import('@/lib/generate-invoice-pdf').catch(() => ({ generatePurchaseBillPDF: null })) as any;
            if (generatePurchaseBillPDF) {
                const { downloadBlob } = await import('@/lib/capacitor-share');
                const blob = await generatePurchaseBillPDF(lot, arrival, organization, arrivalLots, {
                    lang: localInvoice.activeLang,
                    itemTranslations: localInvoice.itemTranslations,
                    partyTranslation: localInvoice.partyTranslation,
                    contactLocalName: arrival?.contact?.local_name
                });
                const billNo = arrival?.contact_bill_no || arrival?.bill_no || lot.lot_code || 'bill';
                await downloadBlob(blob, `PurchaseBill_${billNo}.pdf`);
            } else {
                handlePrint();
            }
        } catch {
            handlePrint();
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!lot || isDownloading || isSharing) return;
        setIsSharing(true);
        try {
            const { generatePurchaseBillPDF } = await import('@/lib/generate-invoice-pdf').catch(() => ({ generatePurchaseBillPDF: null })) as any;
            if (generatePurchaseBillPDF) {
                const { shareBlob } = await import('@/lib/capacitor-share');
                const blob = await generatePurchaseBillPDF(lot, arrival, organization, arrivalLots, {
                    lang: localInvoice.activeLang,
                    itemTranslations: localInvoice.itemTranslations,
                    partyTranslation: localInvoice.partyTranslation,
                    contactLocalName: arrival?.contact?.local_name
                });
                const billNo = arrival?.contact_bill_no || arrival?.bill_no || lot.lot_code || 'bill';
                const shareTitle = `Purchase Bill #${billNo}`;
                const shareText = `Purchase Bill #${billNo} from ${organization?.name || 'Mandi'}`;
                await shareBlob(blob, `PurchaseBill_${billNo}.pdf`, { title: shareTitle, text: shareText });
            }
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            alert(`Failed to share: ${err?.message || err}`);
        } finally {
            setIsSharing(false);
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
        <div className="min-h-screen print:min-h-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8 space-y-8 print:p-0 print:space-y-0 print:bg-white">
            {/* Header / Actions */}
            <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
                <Button variant="ghost" className="text-gray-500 hover:text-white pl-0 md:pl-4" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5 mr-1 md:mr-2" /> Back
                </Button>

                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex items-center bg-white text-black rounded-md overflow-hidden">
                        <Button className="flex-1 md:flex-none bg-transparent text-black hover:bg-black/5 font-bold h-10 md:h-12 px-2 md:px-4 text-[10px] md:text-sm rounded-none border-r border-black/10" onClick={() => handleThermalPrint()}>
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
                    <Button
                        className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm"
                        onClick={handlePrint}
                    >
                        <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />
                        A4 INVOICE
                    </Button>

                    {/* Language selector — only when local_language_invoices is enabled */}
                    {localInvoice.isEnabled && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-4 text-[10px] md:text-sm gap-1.5"
                                >
                                    <Globe className="w-4 h-4 shrink-0" />
                                    <span className="truncate">
                                        {localInvoice.activeLang ? LANG_LABELS[localInvoice.activeLang] : 'English'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Invoice Language</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => localInvoice.setActiveLang(null)} className="cursor-pointer">
                                    {!localInvoice.activeLang ? '✓ ' : ''}English (Default)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(Object.entries(LANG_LABELS) as [LangCode, string][]).map(([code, label]) => (
                                    <DropdownMenuItem key={code} onClick={() => localInvoice.setActiveLang(code)} className="cursor-pointer">
                                        {localInvoice.activeLang === code ? '✓ ' : ''}
                                        {label} <span className="text-gray-400 ml-1 text-[10px]">({LANG_NAMES_ENGLISH[code]})</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button
                        disabled={isDownloading || isSharing}
                        className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm"
                        onClick={handleDownload}
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 animate-spin shrink-0" /> : <Download className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0" />}
                        <span className="truncate">{isDownloading ? "SAVING..." : "DOWNLOAD"}</span>
                    </Button>
                    <Button
                        disabled={isDownloading || isSharing}
                        className="flex-1 md:flex-none bg-white text-black hover:bg-white/90 font-bold h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-sm"
                        onClick={handleShare}
                    >
                        {isSharing ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 animate-spin shrink-0" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 shrink-0 lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>}
                        <span className="truncate">{isSharing ? "SHARING..." : "SHARE"}</span>
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

            {/* Template — local language takes over when activeLang is set */}
            <div className="relative">
                <div className={printMode === 'thermal' ? "hidden print:hidden" : "block print:block"}>
                    {localInvoice.isEnabled && localInvoice.activeLang ? (
                        <div className="max-w-[800px] mx-auto shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5 print:shadow-none print:ring-0">
                            <LocalPurchaseBill
                                lot={lot}
                                arrival={arrival}
                                organization={organization}
                                arrivalLots={arrivalLots}
                                lang={localInvoice.activeLang}
                                itemTranslations={localInvoice.itemTranslations}
                                partyTranslation={localInvoice.partyTranslation}
                            />
                        </div>
                    ) : (
                        <div className="max-w-[800px] mx-auto shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5 print:shadow-none print:ring-0">
                            <PurchaseBillInvoice
                                lot={lot}
                                arrival={arrival}
                                organization={organization}
                                arrivalLots={arrivalLots}
                            />
                        </div>
                    )}
                </div>

                {/* Off-screen thermal receipt for image capture / iOS fallback */}
                <div className={printMode === 'thermal' ? "print:static print:opacity-100 print:z-auto print:pointer-events-auto" : "print:hidden"} style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, pointerEvents: 'none', opacity: 0 }}>
                    <div ref={thermalRef} style={{ width: thermalWidth === 32 ? '384px' : (thermalWidth === 64 ? '768px' : '576px'), background: 'white', margin: 0, padding: 0 }}>
                        {localInvoice.isEnabled && localInvoice.activeLang ? (
                            <LocalPurchaseBill
                                lot={lot}
                                arrival={arrival}
                                organization={organization}
                                arrivalLots={arrivalLots}
                                lang={localInvoice.activeLang}
                                itemTranslations={localInvoice.itemTranslations}
                                partyTranslation={localInvoice.partyTranslation}
                            />
                        ) : null}
                    </div>
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
                    #purchase-invoice-print {
                        width: 100% !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    /* Remove page margins so the invoice fills the sheet */
                    @page { margin: 0; size: auto; }
                }
            `}</style>
        </div>
    )
}
