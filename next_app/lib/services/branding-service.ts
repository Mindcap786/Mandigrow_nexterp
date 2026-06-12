import { callApi } from "@/lib/frappeClient";

export interface BrandingSettings {
    id: string;
    document_footer_powered_by_text: string;
    document_footer_presented_by_text: string;
    document_footer_developed_by_text: string;
    watermark_text: string;
    is_watermark_enabled: boolean;
    support_phone?: string;
}

let cachedSettings: BrandingSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds — super admin changes reflect quickly

const DEFAULT_BRANDING: BrandingSettings = {
    id: 'default',
    document_footer_presented_by_text: '',
    document_footer_powered_by_text: '',
    document_footer_developed_by_text: '',
    watermark_text: '',
    is_watermark_enabled: false,
    support_phone: ''
};

export async function getPlatformBranding(): Promise<BrandingSettings> {
    const now = Date.now();
    if (cachedSettings && (now - lastFetchTime < CACHE_TTL)) {
        return cachedSettings;
    }

    try {
        const res = await callApi('mandigrow.api.get_branding_settings');
        if (res) {
            // Merge with defaults so missing keys don't break UI, but empty strings ("") are preserved
            cachedSettings = { ...DEFAULT_BRANDING, ...res } as BrandingSettings;
            lastFetchTime = now;
            return cachedSettings;
        }
    } catch (err) {
        console.error("Failed to load branding:", err);
    }

    return cachedSettings || DEFAULT_BRANDING;
}
