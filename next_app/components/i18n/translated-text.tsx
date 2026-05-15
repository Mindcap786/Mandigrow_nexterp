"use client"
import React from 'react';
import { useLanguage } from './language-provider';

export function TranslatedText({ tKey, fallback, className }: { tKey: string, fallback: string, className?: string }) {
    const { t } = useLanguage();
    const text = t(tKey);
    // If the translation returns the exact key (meaning it wasn't found), use the fallback
    const displayText = text === tKey ? fallback : text;
    
    if (className) {
        return <span className={className} dangerouslySetInnerHTML={{ __html: displayText }} />;
    }
    return <span dangerouslySetInnerHTML={{ __html: displayText }} />;
}
