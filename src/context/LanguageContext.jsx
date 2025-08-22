import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // 从 localStorage 获取保存的语言设置，默认为中文
    const saved = localStorage.getItem('preferredLanguage') || 'zh';
    console.log('🔍 LanguageProvider INIT - localStorage value:', saved);
    return saved;
  });

  useEffect(() => {
    // 保存语言设置到 localStorage
    console.log('🔍 LanguageProvider - Saving language to localStorage:', currentLanguage);
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  const switchLanguage = (language) => {
    console.log('🔍 LanguageProvider - switchLanguage called with:', language);
    console.log('🔍 LanguageProvider - before switch currentLanguage:', currentLanguage);
    setCurrentLanguage(language);
    console.log('🔍 LanguageProvider - after switch call (async)');
  };

  const value = {
    currentLanguage,
    switchLanguage,
    isZh: currentLanguage === 'zh',
    isEn: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
