"use client"

import React, { createContext, useContext, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/i18next-setup';
import { useAppLanguage } from '@/hooks/use-app-language';
import type { SupportedLanguage } from '@/lib/i18n/i18n-config';
import { getTextDirection } from '@/lib/i18n/i18n-config';

type LanguageContextType = {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    t: (key: string, params?: Record<string, any>) => string;
    dir: 'ltr' | 'rtl';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Inner provider that uses the hook (must be inside I18nextProvider)
function InnerLanguageProvider({ children }: { children: React.ReactNode }) {
    const { language, dir, changeLanguage, t } = useAppLanguage();

    return (
        <LanguageContext.Provider value={{
            language: (language || 'en') as SupportedLanguage,
            setLanguage: (lang) => changeLanguage(lang),
            t: (key, params) => t(key, params) as unknown as string,
            dir: dir === 'rtl' ? 'rtl' : 'ltr'
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Ensure direction is set immediately on mount if stored
    useEffect(() => {
        const saved = localStorage.getItem('app-language') as SupportedLanguage;
        if (saved) {
            document.documentElement.lang = saved;
            document.documentElement.dir = getTextDirection(saved);
        }
    }, []);

    return (
        <I18nextProvider i18n={i18n}>
            <InnerLanguageProvider>
                {children}
            </InnerLanguageProvider>
        </I18nextProvider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
