"use client";

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { db } from '@/lib/db';
import { callApi } from '@/lib/frappeClient';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync(organizationId?: string) {
    const isOnline = useOnlineStatus();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    // 1. Sync Loop (Push Pending Sales)
    useEffect(() => {
        if (isOnline && organizationId) {
            pushPendingSales();
        }
    }, [isOnline, organizationId]);

    // 2. Master Data Pull (On Load)
    useEffect(() => {
        if (isOnline && organizationId) {
            pullMasterData();
        }
    }, [organizationId, isOnline]);

    const pushPendingSales = async () => {
        setIsSyncing(true);
        const pendingSales = await db.sales.where('sync_status').equals('pending').toArray();

        if (pendingSales.length === 0) {
            setIsSyncing(false);
            return;
        }

        toast({ title: "Syncing...", description: `Uploading ${pendingSales.length} offline sales.` });

        // Parallel flush — idempotency key (sale.id) guarantees server-side dedup
        const results = await Promise.allSettled(
            pendingSales.map(async (sale) => {
                if (sale.payload) {
                    await callApi('mandigrow.api.confirm_sale_transaction', {
                        p_organization_id: sale.payload.organizationId,
                        p_buyer_id: sale.payload.buyerId,
                        p_sale_date: sale.payload.saleDate,
                        p_payment_mode: sale.payload.paymentMode,
                        p_total_amount: sale.payload.totalAmount,
                        p_items: sale.payload.items,
                        p_market_fee: sale.payload.marketFee || 0,
                        p_nirashrit: sale.payload.nirashrit || 0,
                        p_misc_fee: sale.payload.miscFee || 0,
                        p_loading_charges: sale.payload.loadingCharges || 0,
                        p_unloading_charges: sale.payload.unloadingCharges || 0,
                        p_other_expenses: sale.payload.otherExpenses || 0,
                        p_amount_received: sale.payload.amountReceived ?? 0,
                        p_idempotency_key: sale.payload.idempotencyKey || sale.id,
                        p_due_date: sale.payload.dueDate,
                        p_bank_account_id: sale.payload.bankAccountId,
                        p_cheque_no: sale.payload.chequeNo,
                        p_cheque_date: sale.payload.chequeDate,
                        p_cheque_status: sale.payload.chequeStatus || false,
                        p_bank_name: sale.payload.bankName,
                        p_cgst_amount: sale.payload.cgstAmount || 0,
                        p_sgst_amount: sale.payload.sgstAmount || 0,
                        p_igst_amount: sale.payload.igstAmount || 0,
                        p_gst_total: sale.payload.gstTotal || 0,
                        p_discount_percent: sale.payload.discountPercent || 0,
                        p_discount_amount: sale.payload.discountAmount || 0,
                        p_place_of_supply: sale.payload.placeOfSupply,
                        p_buyer_gstin: sale.payload.buyerGstin,
                        p_is_igst: sale.payload.isIgst || false,
                        p_vehicle_number: sale.payload.vehicleNumber,
                        p_transport_name: sale.payload.transportName,
                        p_book_no: sale.payload.bookNo,
                        p_lot_no: sale.payload.lotNo,
                        p_narration: sale.payload.narration,
                        p_created_by: sale.payload.createdBy,
                        p_gst_enabled: sale.payload.gstEnabled || false,
                        p_crate_items: sale.payload.crateItems || [],
                    });
                } else {
                    // Fallback for older stored offline sales
                    await callApi('mandigrow.api.confirm_sale_transaction', {
                        p_organization_id: organizationId,
                        p_buyer_id: sale.contact_id,
                        p_sale_date: String(sale.sale_date).split('T')[0],
                        p_payment_mode: 'credit',
                        p_total_amount: sale.total_amount,
                        p_items: sale.items,
                        p_idempotency_key: sale.id,
                    });
                }
                await db.sales.update(sale.id, { sync_status: 'synced' });
            })
        );

        const failed = results.filter(r => r.status === 'rejected');
        await Promise.all(
            pendingSales
                .filter((_, i) => results[i].status === 'rejected')
                .map(sale => {
                    console.error("Sync Failed for Sale", sale.id);
                    return db.sales.update(sale.id, { sync_status: 'failed' });
                })
        );

        if (failed.length > 0) {
            toast({ title: "Sync Partial", description: `${pendingSales.length - failed.length} uploaded, ${failed.length} failed — will retry.`, variant: "destructive" });
        } else {
            toast({ title: "Sync Complete", description: "All offline data uploaded." });
        }
        setIsSyncing(false);
    };

    const pullMasterData = async () => {
        try {
            // callApi already unwraps the { message: ... } envelope
            const data: any = await callApi('mandigrow.api.get_master_data');
            if (data?.contacts) {
                // Re-key contacts to match Dexie v2 schema (PK = name)
                const mapped = data.contacts.map((c: any) => ({
                    name: c.name || c.id,
                    full_name: c.full_name || c.name,
                    type: c.type || c.contact_type || '',
                    city: c.city || '',
                }));
                await db.contacts.bulkPut(mapped);
            }
        } catch (err) {
            console.error("Master Data Pull Error:", err);
        }
    };

    return { isOnline, isSyncing };
}
