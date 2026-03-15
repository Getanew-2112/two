import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentLanguage, setLanguage as saveLanguage } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getCurrentLanguage());

  useEffect(() => {
    // Listen for language changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'language') {
        setLanguageState(e.newValue || 'en');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = (lang) => {
    saveLanguage(lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
