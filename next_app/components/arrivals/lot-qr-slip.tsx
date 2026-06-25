"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, LayoutGrid } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface LotQRData {
    lotId: string;
    lotCode: string;
    qrNumber: string;
    orgId: string;
    arrivalType: "direct" | "commission" | "commission_supplier";
    itemName: string;
    qty: number;
    unit: string;
    partyName?: string;
    date: string;
}

interface LotQRSlipProps {
    lots: LotQRData[];
    open: boolean;
    onClose: () => void;
}

export function generateQRString(lot: LotQRData): string {
    return lot.qrNumber;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    direct:               { label: "DIRECT PURCHASE",    color: "#1A56DB" },
    commission:           { label: "FARMER COMMISSION",  color: "#0E9F6E" },
    commission_supplier:  { label: "SUPPLIER COMMISSION",color: "#9061F9" },
};

// ── QR image URL via free public API (no CDN scripts needed) ─────────────────
function qrImgUrl(code: string, size: number): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=${size}x${size}&ecc=Q&margin=1`;
}

// ── Open a new print window and trigger print ─────────────────────────────────
function openPrintWindow(html: string) {
    const win = window.open("", "_blank", "width=900,height=1100");
    if (!win) { alert("Please allow popups to print."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    // Wait for images (QR codes) to load before printing
    win.onload = () => { win.print(); win.close(); };
    // Fallback if onload doesn't fire
    setTimeout(() => { try { win.print(); win.close(); } catch (_) {} }, 3000);
}

// ── BASE HTML wrapper ─────────────────────────────────────────────────────────
function wrapHtml(title: string, style: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @media print {
      body { background: #fff !important; }
      * { -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important; }
    }
    ${style}
  </style>
</head>
<body>${body}</body>
</html>`;
}

// ── BUILD: Full QR Slip (one per page) ───────────────────────────────────────
function buildSlipsHtml(lots: LotQRData[]): string {
    const style = `
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
               background: #f8fafc; }
        .slip {
            background: #fff;
            border-radius: 16px;
            border: 2px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 20px;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        .slip-banner {
            color: #fff;
            text-align: center;
            padding: 6px 0;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .slip-body {
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 20px 24px;
        }
        .slip-qr-col {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
        }
        .slip-qr-col img {
            width: 110px;
            height: 110px;
            display: block;
        }
        .slip-code {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.15em;
            margin-top: 8px;
            text-align: center;
            color: #0f172a;
        }
        .slip-info { flex: 1; }
        .slip-label {
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            margin-bottom: 2px;
        }
        .slip-item {
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.1;
            margin-bottom: 14px;
        }
        .slip-row { display: flex; gap: 32px; margin-bottom: 12px; }
        .slip-qty { font-size: 20px; font-weight: 900; color: #0f172a; }
        .slip-unit { font-size: 13px; font-weight: 700; color: #64748b; margin-left: 4px; }
        .slip-party { font-size: 20px; font-weight: 900; color: #0f172a; }
        .slip-date {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            margin-top: 4px;
        }
    `;

    const body = lots.map(lot => {
        const t = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;
        const qtyInt = parseInt(String(lot.qty));
        return `
        <div class="slip">
            <div class="slip-banner" style="background:${t.color}">${t.label}</div>
            <div class="slip-body">
                <div class="slip-qr-col">
                    <img src="${qrImgUrl(lot.qrNumber, 220)}" alt="QR ${lot.qrNumber}" />
                    <div class="slip-code">${lot.qrNumber}</div>
                </div>
                <div class="slip-info">
                    <div class="slip-label">Item</div>
                    <div class="slip-item">${lot.itemName}</div>
                    <div class="slip-row">
                        <div>
                            <div class="slip-label">Quantity</div>
                            <div><span class="slip-qty">${qtyInt}</span><span class="slip-unit">${lot.unit}</span></div>
                        </div>
                        ${lot.partyName ? `
                        <div>
                            <div class="slip-label">Party</div>
                            <div class="slip-party">${lot.partyName}</div>
                        </div>` : ''}
                    </div>
                    <div class="slip-date">📅 ${lot.date}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    return wrapHtml("MandiGrow QR Slips", style, body);
}

// ── BUILD: 10 labels per A4 sheet (2 col × 5 row, Avery L7173) ───────────────
function buildSheet10Html(lots: LotQRData[]): string {
    const style = `
        @page { size: A4 portrait; margin: 8mm 8mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
        }
        .label {
            height: 57mm;
            border: 1px solid #e2e8f0;
            border-radius: 3mm;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
        }
        .label-banner {
            color: #fff;
            text-align: center;
            padding: 2px 0;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            flex-shrink: 0;
        }
        .label-body {
            display: flex;
            flex: 1;
            align-items: center;
            padding: 3mm 4mm;
            gap: 4mm;
            overflow: hidden;
        }
        .label-qr { flex-shrink: 0; text-align: center; }
        .label-qr img { width: 38mm; height: 38mm; display: block; }
        .label-qr-code {
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.1em;
            margin-top: 1mm;
            text-align: center;
        }
        .label-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 1.5mm; }
        .label-item {
            font-size: 13px;
            font-weight: 900;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #0f172a;
        }
        .label-party {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .label-qty { font-size: 11px; font-weight: 900; color: #0f172a; }
    `;

    const labels = lots.map(lot => {
        const t = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;
        const qtyInt = parseInt(String(lot.qty));
        return `
        <div class="label">
            <div class="label-banner" style="background:${t.color}">${t.label}</div>
            <div class="label-body">
                <div class="label-qr">
                    <img src="${qrImgUrl(lot.qrNumber, 144)}" alt="${lot.qrNumber}" />
                    <div class="label-qr-code">${lot.qrNumber}</div>
                </div>
                <div class="label-info">
                    <div class="label-item">${lot.itemName}</div>
                    <div class="label-party">${lot.partyName || ''}</div>
                    <div class="label-qty">${qtyInt} ${lot.unit}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    return wrapHtml("MandiGrow — 10 per A4 Sheet", style,
        `<div class="grid">${labels}</div>`);
}

// ── BUILD: 1 large label per A4 page ─────────────────────────────────────────
function buildSingleHtml(lots: LotQRData[]): string {
    const style = `
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .label {
            border: 2px solid #e2e8f0;
            border-radius: 10mm;
            overflow: hidden;
            page-break-after: always;
            display: flex;
            flex-direction: column;
        }
        .label-banner {
            color: #fff;
            text-align: center;
            padding: 5px 0;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .label-body {
            display: flex;
            align-items: center;
            padding: 20mm;
            gap: 16mm;
        }
        .label-qr { flex-shrink: 0; text-align: center; }
        .label-qr img { width: 70mm; height: 70mm; display: block; }
        .label-qr-code {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 0.2em;
            margin-top: 5mm;
        }
        .label-info { flex: 1; }
        .lbl { font-size: 10px; font-weight: 900; text-transform: uppercase;
               letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 3px; }
        .label-item { font-size: 36px; font-weight: 900; color: #0f172a;
                      line-height: 1.1; margin-bottom: 10mm; }
        .label-qty  { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 6mm; }
        .label-party { font-size: 22px; font-weight: 900; color: #0f172a; margin-bottom: 6mm; }
        .label-date { font-size: 14px; color: #94a3b8; font-weight: 700; }
    `;

    const labels = lots.map(lot => {
        const t = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;
        const qtyInt = parseInt(String(lot.qty));
        return `
        <div class="label">
            <div class="label-banner" style="background:${t.color}">${t.label}</div>
            <div class="label-body">
                <div class="label-qr">
                    <img src="${qrImgUrl(lot.qrNumber, 264)}" alt="${lot.qrNumber}" />
                    <div class="label-qr-code">${lot.qrNumber}</div>
                </div>
                <div class="label-info">
                    <div class="lbl">Item</div>
                    <div class="label-item">${lot.itemName}</div>
                    ${lot.partyName ? `<div class="lbl">Party</div>
                    <div class="label-party">${lot.partyName}</div>` : ''}
                    <div class="lbl">Quantity</div>
                    <div class="label-qty">${qtyInt} ${lot.unit}</div>
                    <div class="label-date">📅 ${lot.date}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    return wrapHtml("MandiGrow — 1 Label per Page", style, labels);
}

// ── Modal preview component ───────────────────────────────────────────────────
function SlipPreview({ lot }: { lot: LotQRData }) {
    const t = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;
    const qtyInt = parseInt(String(lot.qty));
    return (
        <div className="bg-white rounded-2xl border-2 overflow-hidden shadow-sm max-w-sm mx-auto"
             style={{ borderColor: t.color }}>
            <div className="text-center py-1 text-[10px] font-black uppercase tracking-widest text-white"
                 style={{ backgroundColor: t.color }}>
                {t.label}
            </div>
            <div className="flex gap-5 p-4">
                {/* QR */}
                <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center mt-1">
                    <QRCodeSVG value={lot.qrNumber} size={100} level="Q" includeMargin={false} />
                    <div className="text-black font-black text-lg tracking-widest mt-2">{lot.qrNumber}</div>
                </div>
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-0.5">Item</div>
                        <div className="text-2xl font-black text-slate-900 leading-none">{lot.itemName}</div>
                    </div>
                    <div className="flex gap-5 mt-3">
                        <div>
                            <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-0.5">Quantity</div>
                            <div className="text-lg font-black text-slate-900">
                                {qtyInt} <span className="text-sm font-bold text-slate-400">{lot.unit}</span>
                            </div>
                        </div>
                        {lot.partyName && (
                            <div>
                                <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-0.5">Party</div>
                                <div className="text-lg font-black text-slate-900 truncate max-w-[100px]">{lot.partyName}</div>
                            </div>
                        )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold mt-3">📅 {lot.date}</div>
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LotQRSlip({ lots, open, onClose }: LotQRSlipProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* Title */}
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black">Arrival QR Slips</DialogTitle>
                                <p className="text-xs text-slate-500 font-bold">
                                    {lots.length} Lot{lots.length !== 1 ? "s" : ""} · Scan in POS to sell
                                </p>
                            </div>
                        </div>

                        {/* Print buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                onClick={() => openPrintWindow(buildSheet10Html(lots))}
                                variant="outline"
                                className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl h-9 text-xs font-black"
                                title="10 labels per A4 — Avery L7173 compatible"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                10 per Sheet ⭐
                            </Button>

                            <Button
                                onClick={() => openPrintWindow(buildSlipsHtml(lots))}
                                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 text-xs font-black"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Slips
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Modal preview */}
                <div ref={printRef} className="space-y-4 pt-2">
                    {lots.map(lot => (
                        <SlipPreview key={lot.lotId} lot={lot} />
                    ))}
                </div>

                {/* How to use */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">How to use</p>
                    <p className="text-xs text-amber-600 font-bold">
                        In POS, scan this QR code with your barcode scanner (or type the code).
                        The entire lot appears in the cart, ready for sale.
                    </p>
                    <p className="text-[10px] text-amber-500 font-medium">
                        ⭐ <strong>10 per Sheet</strong> works with standard A4 sticker sheets
                        (Avery L7173 / any 2×5 label sheet — available in any stationery shop).
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
