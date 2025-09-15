import React, { useState } from 'react';
import TranslateIcon from './icons/TranslateIcon';
import CloseIcon from './icons/CloseIcon';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

const TranslateButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, setLanguage } = useTranslation();

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-green-800 p-2 -mr-2"
        aria-label="Change language"
      >
        <TranslateIcon className="h-7 w-7" />
      </button>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 id="language-modal-title" className="text-xl font-bold text-green-800">
                  Select Language
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 -mr-2"
                  aria-label="Close language selection"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
              <ul className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        language === lang.code
                          ? 'bg-green-100 text-green-800 font-bold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lang.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TranslateButton;
