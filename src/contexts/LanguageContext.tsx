import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import type { Localized } from '@/content/types';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Picks the current language's text, falling back to English when it's empty. */
  l: (text: Localized | null | undefined) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const l = useCallback(
    (text: Localized | null | undefined) => {
      if (!text) return '';
      return text[language]?.trim() ? text[language] : text.en ?? '';
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, l, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
