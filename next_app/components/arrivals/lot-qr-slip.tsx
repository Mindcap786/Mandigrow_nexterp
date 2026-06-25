"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, Tag, LayoutGrid } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface LotQRData {
    lotId: string;
    lotCode: string;
    qrNumber: string; // The distinct 6-digit code payload
    orgId: string;
    arrivalType: "direct" | "commission" | "commission_supplier";
    itemName: string;
    qty: number;
    unit: string;
    partyName?: string;
    date: string; // ISO date string
}

interface LotQRSlipProps {
    lots: LotQRData[];
    open: boolean;
    onClose: () => void;
}

function generateQRString(lot: LotQRData): string {
    return lot.qrNumber;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    direct: { label: "Direct Purchase", color: "#1A56DB" },
    commission: { label: "Farmer Commission", color: "#0E9F6E" },
    commission_supplier: { label: "Supplier Commission", color: "#9061F9" },
};

// ── Full-size slip (one per page, for Print Slips) ────────────────────────────
function SingleLotSlip({ lot }: { lot: LotQRData }) {
    const qrString = generateQRString(lot);
    const typeInfo = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;

    return (
        <div className="lot-qr-slip bg-white rounded-2xl p-4 flex gap-5 mb-4 shadow-sm w-full max-w-sm border-2 mx-auto relative overflow-hidden" style={{ borderColor: typeInfo.color }}>
            <div className="absolute top-0 right-0 left-0 text-center py-0.5 text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: typeInfo.color }}>
                {typeInfo.label}
            </div>
            <div className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center min-w-[120px] mt-4">
                <QRCodeSVG value={qrString} size={100} level="Q" includeMargin={false} />
                <div className="text-black font-black text-lg tracking-widest mt-2">{lot.qrNumber}</div>
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-0.5">Item</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{lot.itemName}</div>
                </div>
                <div className="flex gap-6 mt-3">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-0.5">Quantity</div>
                        <div className="text-xl font-black text-slate-900">{parseInt(lot.qty as any)} <span className="text-sm font-bold text-gray-500">{lot.unit}</span></div>
                    </div>
                    {lot.partyName && (
                        <div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-0.5">Party</div>
                            <div className="text-xl font-black text-slate-900 truncate max-w-[120px]">{lot.partyName}</div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold mt-4">
                    📅 {lot.date}
                </div>
            </div>
        </div>
    );
}

// ── Print mode type ───────────────────────────────────────────────────────────
type PrintMode = 'normal' | 'sheet10' | 'single';

export default function LotQRSlip({ lots, open, onClose }: LotQRSlipProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [printMode, setPrintMode] = useState<PrintMode>('normal');

    /**
     * Generates the print HTML string for a given mode.
     *
     * Mode: 'normal'   → Full QR slips, one per page (existing behaviour)
     * Mode: 'sheet10'  → 10 small labels per A4 sheet (2 col × 5 row)
     *                    Industry standard — Avery L7173 / Amazon label sheet
     * Mode: 'single'   → One large label per A4 page (for single-lot use)
     */
    const handlePrint = (mode: PrintMode) => {
        setPrintMode(mode);
        setTimeout(() => {
            const win = window.open("", "_blank", "width=800,height=1000");
            if (!win) { setPrintMode('normal'); return; }

            // ── Build label HTML for sheet10 and single modes ──────────────
            const buildLabelHtml = (lot: LotQRData, size: number): string => {
                const typeInfo = TYPE_LABELS[lot.arrivalType] || TYPE_LABELS.direct;
                // Inline SVG QR is rendered server-side — we pass the data only
                // and let the print window render via a data-qr attribute + script.
                return `
                    <div class="label" data-color="${typeInfo.color}">
                        <div class="label-top-bar" style="background:${typeInfo.color}">
                            ${typeInfo.label}
                        </div>
                        <div class="label-body">
                            <div class="label-qr">
                                <canvas class="qr-canvas" data-value="${lot.qrNumber}" data-size="${size}"></canvas>
                                <div class="label-code">${lot.qrNumber}</div>
                            </div>
                            <div class="label-info">
                                <div class="label-item">${lot.itemName}</div>
                                <div class="label-party">${lot.partyName || ''}</div>
                                <div class="label-qty">${parseInt(String(lot.qty))} ${lot.unit}</div>
                            </div>
                        </div>
                    </div>
                `;
            };

            let bodyHtml = '';
            let styleHtml = '';

            if (mode === 'normal') {
                // ── Full slips — reuse printRef DOM ───────────────────────
                const printContents = printRef.current?.innerHTML ?? "";
                styleHtml = `
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#fff; padding:16px; }
                    .print-container { display:flex; flex-direction:column; align-items:center; gap:16px; }
                    .lot-qr-slip { page-break-inside:avoid; margin-bottom:16px; width:380px !important; }
                `;
                bodyHtml = `<div class="print-container">${printContents}</div>`;

            } else if (mode === 'sheet10') {
                // ── 10 per A4 — 2 columns × 5 rows, Avery L7173 compatible ──
                // Each label: 105mm × 57mm with 5mm gutter
                styleHtml = `
                    @page { size: A4 portrait; margin: 10mm 5mm; }
                    body { margin:0; padding:0; font-family: sans-serif; }
                    .sheet { display:grid; grid-template-columns:1fr 1fr; gap:4mm; }
                    .label {
                        width:100%; height:57mm; border:1px solid #e2e8f0;
                        border-radius:3mm; overflow:hidden; display:flex;
                        flex-direction:column; page-break-inside:avoid;
                    }
                    .label-top-bar {
                        font-size:7px; font-weight:900; text-transform:uppercase;
                        letter-spacing:0.05em; color:#fff; text-align:center;
                        padding:1.5mm 0; flex-shrink:0;
                    }
                    .label-body {
                        display:flex; flex:1; align-items:center;
                        padding:2mm 3mm; gap:3mm; overflow:hidden;
                    }
                    .label-qr { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
                    .qr-canvas { width:38mm !important; height:38mm !important; }
                    .label-code {
                        font-size:11px; font-weight:900; letter-spacing:0.1em;
                        margin-top:1mm; text-align:center;
                    }
                    .label-info { flex:1; overflow:hidden; display:flex; flex-direction:column; justify-content:center; gap:1mm; }
                    .label-item { font-size:13px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                    .label-party { font-size:9px; color:#555; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
                    .label-qty { font-size:11px; font-weight:900; color:#333; }
                `;
                const labelsHtml = lots.map(lot => buildLabelHtml(lot, 144)).join('');
                bodyHtml = `<div class="sheet">${labelsHtml}</div>`;

            } else {
                // ── Single — 1 large label per A4 page ───────────────────
                styleHtml = `
                    @page { size: A4 portrait; margin: 15mm; }
                    body { margin:0; padding:0; font-family:sans-serif; }
                    .label {
                        width:100%; border:2px solid #e2e8f0; border-radius:5mm;
                        overflow:hidden; page-break-after:always;
                        display:flex; flex-direction:column;
                    }
                    .label-top-bar {
                        font-size:11px; font-weight:900; text-transform:uppercase;
                        letter-spacing:0.08em; color:#fff; text-align:center;
                        padding:3mm 0;
                    }
                    .label-body {
                        display:flex; align-items:center; padding:6mm; gap:6mm;
                    }
                    .label-qr { display:flex; flex-direction:column; align-items:center; }
                    .qr-canvas { width:70mm !important; height:70mm !important; }
                    .label-code { font-size:20px; font-weight:900; letter-spacing:0.15em; margin-top:3mm; }
                    .label-info { flex:1; }
                    .label-item { font-size:28px; font-weight:900; line-height:1.1; }
                    .label-party { font-size:16px; color:#555; font-weight:700; margin-top:2mm; }
                    .label-qty { font-size:20px; font-weight:900; margin-top:4mm; }
                `;
                const labelsHtml = lots.map(lot => buildLabelHtml(lot, 264)).join('');
                bodyHtml = labelsHtml;
            }

            // QR canvas rendering script (uses qrcodejs via CDN)
            const qrScript = (mode !== 'normal') ? `
                <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
                <script>
                    window.onload = function() {
                        document.querySelectorAll('.qr-canvas').forEach(function(el) {
                            var val = el.getAttribute('data-value');
                            var sz  = parseInt(el.getAttribute('data-size')) || 144;
                            new QRCode(el, {
                                text: val, width: sz, height: sz,
                                correctLevel: QRCode.CorrectLevel.Q
                            });
                            // Remove the placeholder canvas element
                            var img = el.querySelector('img');
                            if (img) { img.style.width='100%'; img.style.height='100%'; }
                        });
                        setTimeout(function(){ window.print(); window.close(); }, 800);
                    };
                <\/script>
            ` : `<script src="https://cdn.tailwindcss.com"><\/script>`;

            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8"/>
                    <title>MandiGrow QR Labels</title>
                    <style>
                        * { box-sizing:border-box; margin:0; padding:0; }
                        @media print {
                            body { background:transparent !important; }
                            * { -webkit-print-color-adjust:exact !important;
                                print-color-adjust:exact !important;
                                color-adjust:exact !important; }
                        }
                        ${styleHtml}
                    </style>
                    ${qrScript}
                </head>
                <body>${bodyHtml}</body>
                </html>
            `);
            win.document.close();
            win.focus();

            // For normal mode, trigger print after Tailwind loads
            if (mode === 'normal') {
                setTimeout(() => { win.print(); win.close(); setPrintMode('normal'); }, 1500);
            } else {
                // QR rendering + print triggered by window.onload in the script above
                // Just reset state after a safe delay
                setTimeout(() => { setPrintMode('normal'); }, 3000);
            }
        }, 50);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <QrCode className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-black">Arrival QR Slips</DialogTitle>
                                <p className="text-xs text-gray-500 font-bold">{lots.length} Lot{lots.length !== 1 ? "s" : ""} • Scan in POS to sell</p>
                            </div>
                        </div>

                        {/* ── Print buttons ── */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* 10 per A4 sheet — recommended */}
                            <Button
                                onClick={() => handlePrint('sheet10')}
                                variant="outline"
                                className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl h-9 text-xs font-black"
                                title="10 labels per A4 — industry standard (Avery L7173)"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                10 per Sheet ⭐
                            </Button>

                            {/* Single large label per page */}
                            <Button
                                onClick={() => handlePrint('single')}
                                variant="outline"
                                className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl h-9 text-xs font-black"
                                title="One large label per A4 page"
                            >
                                <Tag className="w-3.5 h-3.5" />
                                1 per Page
                            </Button>

                            {/* Full slip (original) */}
                            <Button
                                onClick={() => handlePrint('normal')}
                                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 text-xs font-black"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Slips
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Preview in modal */}
                <div ref={printRef} className="space-y-4 pt-2">
                    {lots.map(lot => (
                        <SingleLotSlip key={lot.lotId} lot={lot} />
                    ))}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">How to use</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">
                        In POS, scan this QR code with your barcode scanner (or type the code). The entire lot will appear in the cart ready for sale.
                    </p>
                    <p className="text-[10px] text-amber-500 mt-1.5 font-medium">
                        ⭐ <strong>10 per Sheet</strong> recommended — works with standard A4 sticker sheets (Avery L7173 / any 2×5 label sheet)
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { generateQRString };
