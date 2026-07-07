import React, { createContext, useContext, useEffect, useState } from 'react';
import enTranslations from '../locales/en.json';
import kuTranslations from '../locales/ku.json';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  // Default to Kurdish (Sorani) per requirements
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ku');

  useEffect(() => {
    // Update HTML attributes for direction and language based on current lang
    const root = window.document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ku' ? 'rtl' : 'ltr');
    
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Helper function to get translation string by key
  const t = (key) => {
    const dictionary = lang === 'ku' ? kuTranslations : enTranslations;
    return dictionary[key] || key;
  };

  const toggleLang = () => {
    setLang(prev => (prev === 'ku' ? 'en' : 'ku'));
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
