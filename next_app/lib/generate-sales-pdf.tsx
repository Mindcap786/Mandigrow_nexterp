"use client";

/**
 * generate-sales-pdf.tsx
 * Programmatic Sales Audit PDF — grouped by commodity.
 * Shows what was sold within a selected date range.
 * Matches the visual style of generate-stock-pdf.tsx.
 */

const safe = (v: any, fb = "—") =>
    v !== null && v !== undefined && String(v).trim() !== "" ? String(v) : fb;

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    if (h.length !== 6) return [12, 131, 31];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export interface SalesAuditItem {
    commodity_name: string;
    item_id: string;
    total_qty: number;
    total_invoices: number;
    avg_rate: number;
    total_amount: number;
    uom: string;
}

export async function generateSalesAuditPDF(
    items: SalesAuditItem[],
    organizationName: string,
    dateFrom: string,
    dateTo: string,
    branding?: any
): Promise<Blob> {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const W = pdf.internal.pageSize.getWidth();   // 297
    const H = pdf.internal.pageSize.getHeight();  // 210
    const ML = 10;
    const MR = W - 10;
    const brandColor: [number, number, number] = branding?.brand_color
        ? hexToRgb(branding.brand_color) : [12, 131, 31];
    const dark: [number, number, number] = [26, 26, 46];
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const fmtDate = (d: string) => {
        try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return d; }
    };

    // ─── HEADER ─────────────────────────────────────────────────────────────────
    // Teal/green brand colour for Sales (slightly different shade than stock)
    const salesColor: [number, number, number] = [0, 105, 55]; // deep green
    pdf.setFillColor(...salesColor);
    pdf.rect(0, 0, W, 22, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14); pdf.setFont("helvetica", "bold");
    pdf.text(`${organizationName} — Sales Audit Report`, ML, 9);
    pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${dateStr} IST`, ML, 16);
    pdf.text(`SOLD FROM ${fmtDate(dateFrom)} TO ${fmtDate(dateTo)}`, MR, 9, { align: "right" });
    pdf.text("COMMODITY-WISE SALES SUMMARY", MR, 16, { align: "right" });

    let y = 28;

    // ─── SUMMARY CHIPS ──────────────────────────────────────────────────────────
    const totalCommodities = items.length;
    const totalQtySold = items.reduce((s, c) => s + Number(c.total_qty || 0), 0);
    const totalRevenue = items.reduce((s, c) => s + Number(c.total_amount || 0), 0);
    const totalInvoices = items.reduce((s, c) => s + Number(c.total_invoices || 0), 0);
    const avgRateOverall = totalQtySold > 0 ? totalRevenue / totalQtySold : 0;

    const chips: Array<{ label: string; value: string; bg: [number, number, number]; tc: [number, number, number] }> = [
        { label: "Commodities Sold", value: String(totalCommodities), bg: [220, 252, 231], tc: [21, 128, 61] },
        { label: "Total Qty Sold", value: totalQtySold.toLocaleString("en-IN"), bg: [219, 234, 254], tc: [29, 78, 216] },
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, bg: [237, 233, 254], tc: [109, 40, 217] },
        { label: "Total Invoices", value: String(totalInvoices), bg: [254, 243, 199], tc: [146, 64, 14] },
        { label: "Avg Rate / Unit", value: avgRateOverall > 0 ? `₹${avgRateOverall.toFixed(0)}` : "—", bg: [255, 247, 237], tc: [154, 52, 18] },
    ];
    const chipW = (MR - ML - chips.length * 3) / chips.length;
    chips.forEach((chip, i) => {
        const cx = ML + i * (chipW + 3);
        pdf.setFillColor(...chip.bg);
        pdf.roundedRect(cx, y, chipW, 13, 2, 2, "F");
        pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...chip.tc);
        pdf.text(chip.label, cx + chipW / 2, y + 4.5, { align: "center" });
        pdf.setFontSize(10);
        pdf.text(chip.value, cx + chipW / 2, y + 10.5, { align: "center" });
    });
    y += 18;

    // ─── TABLE HEADER ────────────────────────────────────────────────────────────
    const COL = {
        no:       ML,
        comm:     ML + 8,
        uom:      ML + 90,
        invoices: ML + 110,
        qty:      ML + 140,
        avgRate:  ML + 175,
        total:    MR,
    };
    const ROW_H = 7.5;

    const drawHeader = () => {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(ML, y, MR - ML, ROW_H, "F");
        pdf.setDrawColor(210, 210, 210);
        pdf.rect(ML, y, MR - ML, ROW_H, "S");
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.5); pdf.setTextColor(80, 80, 80);
        pdf.text("NO.",          COL.no + 1,       y + 5.2);
        pdf.text("COMMODITY",    COL.comm + 1,     y + 5.2);
        pdf.text("UOM",          COL.uom + 1,      y + 5.2);
        pdf.text("INVOICES",     COL.invoices + 1, y + 5.2);
        pdf.text("QTY SOLD",     COL.qty + 1,      y + 5.2);
        pdf.text("AVG RATE (₹)", COL.avgRate + 1,  y + 5.2);
        pdf.text("TOTAL (₹)",    COL.total,        y + 5.2, { align: "right" });
        return y + ROW_H;
    };

    y = drawHeader();

    // ─── ROWS ────────────────────────────────────────────────────────────────────
    for (let i = 0; i < items.length; i++) {
        if (y > H - 22) {
            addPageFooter(pdf, W, H, organizationName, dateFrom, dateTo);
            pdf.addPage();
            y = 15;
            y = drawHeader();
        }

        const c = items[i];

        // Alternate row shading
        if (i % 2 === 0) {
            pdf.setFillColor(250, 252, 250);
            pdf.rect(ML, y, MR - ML, ROW_H, "F");
        }
        pdf.setDrawColor(235, 235, 235);
        pdf.line(ML, y + ROW_H, MR, y + ROW_H);

        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7.5); pdf.setTextColor(...dark);
        pdf.text(String(i + 1), COL.no + 1, y + 5.2);

        // Commodity name — bold
        pdf.setFont("helvetica", "bold");
        const name = safe(c.commodity_name);
        const truncName = name.length > 28 ? name.slice(0, 26) + "…" : name;
        pdf.text(truncName, COL.comm + 1, y + 5.2);
        pdf.setFont("helvetica", "normal");

        pdf.text(safe(c.uom, "Kg"), COL.uom + 1, y + 5.2);
        pdf.text(String(c.total_invoices || 0), COL.invoices + 1, y + 5.2);

        // Qty — bold blue
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(29, 78, 216);
        pdf.text(Number(c.total_qty || 0).toLocaleString("en-IN"), COL.qty + 1, y + 5.2);

        // Avg rate — dark
        pdf.setTextColor(...dark);
        pdf.setFont("helvetica", "normal");
        const avg = Number(c.avg_rate || 0);
        pdf.text(avg > 0 ? avg.toLocaleString("en-IN", { maximumFractionDigits: 1 }) : "—", COL.avgRate + 1, y + 5.2);

        // Total amount — green
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 105, 55);
        const total = Number(c.total_amount || 0);
        pdf.text(
            total > 0 ? total.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—",
            COL.total, y + 5.2, { align: "right" }
        );

        y += ROW_H;
    }

    // ─── GRAND TOTAL FOOTER ──────────────────────────────────────────────────────
    y += 3;
    if (y > H - 25) { addPageFooter(pdf, W, H, organizationName, dateFrom, dateTo); pdf.addPage(); y = 15; }
    pdf.setDrawColor(150, 150, 150);
    pdf.line(ML, y, MR, y);
    y += 5;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...dark);
    pdf.text(
        `Total: ${totalCommodities} Commodities  |  ${totalQtySold.toLocaleString("en-IN")} Units Sold  |  Revenue: ₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        ML, y
    );
    pdf.setTextColor(...salesColor);
    pdf.text(`Period: ${fmtDate(dateFrom)} → ${fmtDate(dateTo)}`, MR, y, { align: "right" });

    addPageFooter(pdf, W, H, organizationName, dateFrom, dateTo);
    return pdf.output("blob");
}

function addPageFooter(pdf: any, W: number, H: number, orgName: string, from: string, to: string) {
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, H - 10, W, 10, "F");
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(6); pdf.setTextColor(130, 130, 130);
    pdf.text(
        `${orgName} — Sales Audit Report (${from} to ${to}) | CONFIDENTIAL | Generated by MandiGrow ERP`,
        W / 2, H - 4, { align: "center" }
    );
}
