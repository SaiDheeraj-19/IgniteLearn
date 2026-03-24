import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import te from '../i18n/te.json';

const TRANSLATIONS = { en, hi, te };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('ignite_lang') || 'en'
  );

  const t = useCallback((key, vars = {}) => {
    const keys = key.split('.');
    let val = TRANSLATIONS[language];
    for (const k of keys) val = val?.[k];
    if (!val) {
      // Fallback to English
      let enVal = TRANSLATIONS.en;
      for (const k of keys) enVal = enVal?.[k];
      val = enVal || key;
    }
    // Variable interpolation: {{var}}
    return String(val).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('ignite_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
