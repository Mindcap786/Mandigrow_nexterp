
import { useEffect, useState } from 'react';
import { callApi } from '@/lib/frappeClient';

export function useFeature(key: string, orgId?: string) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkFeature();
    }, [key, orgId]);

    const checkFeature = async () => {
        try {
            // Check feature flag via Frappe RPC
            const data: any = await callApi('mandigrow.api.check_feature_enabled', {
                key: key,
                org_id: orgId || null
            });
            setEnabled(!!data);
        } catch (e) {
            console.error(`Failed to check feature ${key}:`, e);
            setEnabled(false); // Fail closed
        } finally {
            setLoading(false);
        }
    };

    return { enabled, loading };
}
