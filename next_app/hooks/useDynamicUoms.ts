"use client";

import { useState, useEffect } from "react";
import { callApi } from "@/lib/frappeClient";
import { COMMODITY_UNITS } from "@/lib/utils/commodity-utils";
import { useAuth } from "@/components/auth/auth-provider";

export function useDynamicUoms() {
    const { profile } = useAuth();
    const [uoms, setUoms] = useState<string[]>(COMMODITY_UNITS);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!profile?.organization_id) return;
            try {
                const res = await callApi("mandigrow.api.get_all_uoms", {
                    organization_id: profile.organization_id
                });
                if (mounted && res && Array.isArray(res)) {
                    const apiUoms = res.map((u: any) => u.uom_name || u.name);
                    setUoms(Array.from(new Set([...COMMODITY_UNITS, ...apiUoms])));
                }
            } catch (e) {
                // Silently fallback to defaults
            }
        };
        load();
        return () => { mounted = false; };
    }, [profile?.organization_id]);

    const createUom = async (newUnit: string) => {
        try {
            const res = await callApi("mandigrow.api.create_custom_uom", { 
                uom_name: newUnit,
                organization_id: profile?.organization_id 
            });
            if (res && res.success && res.uom) {
                setUoms(prev => Array.from(new Set([...prev, res.uom])));
                return res.uom;
            }
        } catch (e) {
            console.error("Failed to create UOM", e);
        }
        return newUnit;
    };

    return { uoms, createUom };
}
