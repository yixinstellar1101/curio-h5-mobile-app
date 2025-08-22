import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { texts } from '../../constants/texts';

const LanguageModal = ({ isOpen, onClose }) => {
  const { currentLanguage, switchLanguage } = useLanguage();

  if (!isOpen) return null;

  const handleLanguageSelect = (language) => {
    switchLanguage(language);
    onClose();
  };

  const t = texts.languageModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-6 mx-8 max-w-[300px] w-full shadow-xl">
        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-[20px] font-bold text-gray-900 mb-2">
            {t.title[currentLanguage]}
          </h3>
        </div>
        
        {/* Language Options */}
        <div className="space-y-3 mb-6">
          {/* Chinese Option */}
          <button
            onClick={() => handleLanguageSelect('zh')}
            className={`w-full p-4 rounded-[12px] border-2 transition-all duration-200 flex items-center justify-between ${
              currentLanguage === 'zh' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🇨🇳</span>
              <span className="text-[16px] font-medium text-gray-900">
                {t.chinese[currentLanguage]}
              </span>
            </div>
            {currentLanguage === 'zh' && (
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* English Option */}
          <button
            onClick={() => handleLanguageSelect('en')}
            className={`w-full p-4 rounded-[12px] border-2 transition-all duration-200 flex items-center justify-between ${
              currentLanguage === 'en' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">🇺🇸</span>
              <span className="text-[16px] font-medium text-gray-900">
                {t.english[currentLanguage]}
              </span>
            </div>
            {currentLanguage === 'en' && (
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>
        
        {/* Cancel Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[12px] font-medium transition-colors"
          >
            {t.cancel[currentLanguage]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
