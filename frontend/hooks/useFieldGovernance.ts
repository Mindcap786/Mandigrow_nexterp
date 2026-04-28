import { useState, useEffect, useCallback } from 'react';
import { callApi } from '@/lib/frappeClient';
import { useAuth } from '@/components/auth/auth-provider';

export function useFieldGovernance(moduleId: string) {
    const { profile } = useAuth();
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    const fetchConfigs = useCallback(async () => {
        if (!profile?.organization_id) return;

        setLoading(true);
        try {
            const res = await callApi('mandigrow.api.get_field_governance', { context: moduleId });
            const data = (res as any)?.message;
            if (data) {
                setFieldConfigs(data);
            }
        } catch (err) {
            console.error('fetchConfigs error:', err);
        } finally {
            setLoading(false);
        }
    }, [profile?.organization_id, moduleId]);

    useEffect(() => {
        fetchConfigs();
    }, [fetchConfigs]);

    const isVisible = (fieldKey: string) => {
        const config = fieldConfigs[fieldKey];
        if (!config) return true;
        return config.visible !== false;
    };

    const isMandatory = (fieldKey: string) => {
        const config = fieldConfigs[fieldKey];
        if (!config) return false;
        return config.mandatory === true;
    };

    const getLabel = (fieldKey: string, defaultLabel: string) => {
        if (!fieldConfigs[fieldKey]) return defaultLabel;
        return fieldConfigs[fieldKey].label || defaultLabel;
    };

    const getDefaultValue = (fieldKey: string, fieldType?: string): any => {
        const config = fieldConfigs[fieldKey];
        if (!config?.default_value) return null;

        const value = config.default_value;
        const type = fieldType || config.field_type || 'text';

        switch (type) {
            case 'number':
                return Number(value);
            case 'boolean':
                return value === 'true' || value === '1';
            case 'date':
                try { return new Date(value); } catch { return null; }
            default:
                return value;
        }
    };

    return { fieldConfigs, isVisible, isMandatory, getLabel, getDefaultValue, loading };
}
