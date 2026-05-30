import { roundTo2 } from "./accounting-logic";

export type SaleTaxSettings = {
    market_fee_percent?: number | string | null;
    nirashrit_percent?: number | string | null;
    misc_fee_percent?: number | string | null;
    gst_enabled?: boolean | null;
    gst_type?: string | null;
    cgst_percent?: number | string | null;
    sgst_percent?: number | string | null;
    igst_percent?: number | string | null;
};

export type SaleTaxableItem = {
    amount?: number | string | null;
    gst_rate?: number | string | null;
    is_gst_exempt?: boolean | null;
    gst_inclusive?: boolean | null;
};

const toNumber = (value: number | string | null | undefined) => Number(value) || 0;

const resolveIsIgst = (
    taxSettings: SaleTaxSettings,
    orgStateCode?: string | null,
    buyerStateCode?: string | null
) => {
    if (taxSettings.gst_enabled) {
        if (taxSettings.gst_type === "inter") return true;
        if (taxSettings.gst_type === "intra") return false;
    }

    return !!orgStateCode && !!buyerStateCode && orgStateCode !== buyerStateCode;
};

export function calculateSaleItemTaxBreakdown({
    amount,
    gstRate,
    isGstExempt,
    gstInclusive,
    taxSettings,
    orgStateCode,
    buyerStateCode,
}: {
    amount?: number | string | null;
    gstRate?: number | string | null;
    isGstExempt?: boolean | null;
    gstInclusive?: boolean | null;
    taxSettings: SaleTaxSettings;
    orgStateCode?: string | null;
    buyerStateCode?: string | null;
}) {
    const taxableAmount = toNumber(amount);
    const isIgst = resolveIsIgst(taxSettings, orgStateCode, buyerStateCode);

    if (taxableAmount <= 0 || isGstExempt) {
        return {
            isIgst,
            gstRateApplied: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            gstTotal: 0,
        };
    }

    const effectiveGstRate = taxSettings.gst_enabled ? toNumber(gstRate) : 0;

    let gstRaw = 0;
    if (effectiveGstRate > 0) {
        if (gstInclusive) {
            const actualBase = taxableAmount / (1 + effectiveGstRate / 100);
            gstRaw = taxableAmount - actualBase;
        } else {
            gstRaw = taxableAmount * (effectiveGstRate / 100);
        }
    }
    
    const cgstRaw = isIgst ? 0 : gstRaw / 2;
    const sgstRaw = isIgst ? 0 : gstRaw / 2;
    const igstRaw = isIgst ? gstRaw : 0;

    const cgstAmount = roundTo2(cgstRaw);
    const sgstAmount = roundTo2(sgstRaw);
    const igstAmount = roundTo2(igstRaw);

    return {
        isIgst,
        gstRateApplied: effectiveGstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        gstTotal: cgstAmount + sgstAmount + igstAmount,
    };
}

export function calculateSaleTotals({
    items,
    taxSettings,
    orgStateCode,
    buyerStateCode,
    loadingCharges = 0,
    unloadingCharges = 0,
    otherExpenses = 0,
    discountAmount = 0,
}: {
    items: SaleTaxableItem[];
    taxSettings: SaleTaxSettings;
    orgStateCode?: string | null;
    buyerStateCode?: string | null;
    loadingCharges?: number | string | null;
    unloadingCharges?: number | string | null;
    otherExpenses?: number | string | null;
    discountAmount?: number | string | null;
}) {
    const subTotal = items.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const safeDiscountAmount = Math.min(toNumber(discountAmount), subTotal);
    const taxableSubTotal = subTotal - safeDiscountAmount;

    // Fees calculated on taxable subtotal (post-discount)
    const marketFee = roundTo2(toNumber(taxSettings.market_fee_percent));
    const nirashrit = roundTo2(taxableSubTotal * (toNumber(taxSettings.nirashrit_percent) / 100));
    const miscFee = roundTo2(taxableSubTotal * (toNumber(taxSettings.misc_fee_percent) / 100));

    // Calculate GST proportionally based on the discounted ratio of total amount
    const discountRatio = subTotal > 0 ? taxableSubTotal / subTotal : 0;
    
    const taxBreakdowns = items.map((item) => {
        const itemRes = calculateSaleItemTaxBreakdown({
            amount: toNumber(item.amount) * discountRatio, // apply proportional discount on item level
            gstRate: item.gst_rate,
            isGstExempt: item.is_gst_exempt,
            gstInclusive: item.gst_inclusive,
            taxSettings,
            orgStateCode,
            buyerStateCode,
        });
        return {
            ...itemRes,
            isInclusive: !!item.gst_inclusive
        };
    });

    const cgstAmount = taxBreakdowns.reduce((sum, item) => sum + item.cgstAmount, 0);
    const sgstAmount = taxBreakdowns.reduce((sum, item) => sum + item.sgstAmount, 0);
    const igstAmount = taxBreakdowns.reduce((sum, item) => sum + item.igstAmount, 0);
    const gstTotal = cgstAmount + sgstAmount + igstAmount;
    
    // Only exclusive GST gets added on top of the taxable base for the grand total
    const exclusiveGstTotal = taxBreakdowns
        .filter((item) => !item.isInclusive)
        .reduce((sum, item) => sum + item.gstTotal, 0);
    const isIgst = taxBreakdowns[0]?.isIgst ?? resolveIsIgst(taxSettings, orgStateCode, buyerStateCode);

    const extraCharges =
        toNumber(loadingCharges) + toNumber(unloadingCharges) + toNumber(otherExpenses);

    // Grand Total MUST match backend decimal precision (2 decimals) to avoid ledger drift
    const grandTotal = Math.round(
        (taxableSubTotal + marketFee + nirashrit + miscFee + exclusiveGstTotal + extraCharges) * 100
    ) / 100;

    // For display: when some items are inclusive, the "Taxable Val" panel should
    // show the base-before-GST, not the raw amount that still contains the tax.
    const inclusiveGstExtracted = taxBreakdowns
        .filter((item) => item.isInclusive)
        .reduce((sum, item) => sum + item.gstTotal, 0);
    const taxableBase = taxableSubTotal - inclusiveGstExtracted;

    return {
        subTotal, // Raw subtotal before discount
        taxableBase, // Subtotal with inclusive GST extracted — use this for "Taxable Val" display
        discountAmount: safeDiscountAmount,
        marketFee,
        nirashrit,
        miscFee,
        cgstAmount,
        sgstAmount,
        igstAmount,
        gstTotal,
        exclusiveGstTotal,
        inclusiveGstExtracted,
        extraCharges,
        loadingCharges: toNumber(loadingCharges),
        unloadingCharges: toNumber(unloadingCharges),
        otherExpenses: toNumber(otherExpenses),
        grandTotal,
        isIgst,
    };
}
