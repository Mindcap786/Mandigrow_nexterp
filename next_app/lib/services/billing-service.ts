import { callApi } from "@/lib/frappeClient";

export interface BillConfig {
    merchant_id: string
    farmer_id: string
    lot_ids: string[]
    settlement_rate: number
}

export class BillingService {
    /**
     * THE "ONE-SHOT" BILL GENERATOR
     * Converts a batch of Raw Arrivals (Lots) into a Final Financial Bill.
     * Migrated to Frappe. All calculation and ledger logic is on the backend.
     */
    static async generateFarmerBill(config: BillConfig) {
        console.log(`[BillingEngine] Starting Bill Gen for Farmer: ${config.farmer_id} via Frappe`);
        
        try {
            const res = await callApi('mandigrow.api.generate_farmer_bill', {
                merchant_id: config.merchant_id,
                farmer_id: config.farmer_id,
                lot_ids: config.lot_ids,
                settlement_rate: config.settlement_rate
            });
            
            if (res?.message?.success) {
                return res.message;
            } else {
                throw new Error(res?.message?.error || "Unknown billing error");
            }
        } catch (error: any) {
            console.error('[BillingEngine] Error:', error);
            throw new Error(`Failed to generate bill: ${error.message}`);
        }
    }
}

// Keep the organization billing stubs just in case other files use them
export async function getBillingInfo(orgId: string) {
    try {
        const res = await callApi('mandigrow.api.get_organization', { org_id: orgId });
        return res?.message || null;
    } catch (err) {
        console.error('[billing-service] Failed to get billing info:', err);
        return null;
    }
}

export async function updateBillingInfo(_orgId: string, _data: any) {
    console.warn('[billing-service] updateBillingInfo: use Frappe RPC directly.');
}
