"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check local storage or browser preference
        const savedLang = localStorage.getItem('language') as Language;
        let activeLang: Language = 'en';

        if (savedLang && (savedLang === 'en' || savedLang === 'ml')) {
            activeLang = savedLang;
        } else {
            // Default to Malayalam if browser language is Malayalam, else English
            const browserLang = navigator.language;
            if (browserLang.startsWith('ml')) {
                activeLang = 'ml';
            }
        }
        setLanguage(activeLang);
        document.documentElement.lang = activeLang;
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = language;
            localStorage.setItem('language', language);
        }
    }, [language, mounted]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
    };

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
    };

    if (!mounted) {
        return null; // or a loading spinner
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
