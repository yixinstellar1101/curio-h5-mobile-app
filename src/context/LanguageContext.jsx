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
    return localStorage.getItem('preferredLanguage') || 'zh';
  });

  useEffect(() => {
    // 保存语言设置到 localStorage
    localStorage.setItem('preferredLanguage', currentLanguage);
  }, [currentLanguage]);

  const switchLanguage = (language) => {
    setCurrentLanguage(language);
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
