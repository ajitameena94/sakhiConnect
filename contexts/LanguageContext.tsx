import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { translateText } from '../services/geminiService';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type Cache = {
  [lang: string]: {
    [text: string]: string | null; // null means translation is in progress
  };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'hi';
  });
  const [cache, setCache] = useState<Cache>({});
  const [, setVersion] = useState(0); // Used to force re-render on cache updates

  const requestQueue = useRef(new Set<string>()).current;

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = useCallback((text: string): string => {
    if (!text || language === 'hi') {
      return text;
    }

    const langCache = cache[language] || {};
    if (langCache[text]) {
      return langCache[text]!;
    }
    
    const requestKey = `${language}:${text}`;
    if (!requestQueue.has(requestKey)) {
        requestQueue.add(requestKey);

        translateText(text, language).then(translated => {
            setCache(prevCache => ({
                ...prevCache,
                [language]: {
                    ...(prevCache[language] || {}),
                    [text]: translated,
                },
            }));
            requestQueue.delete(requestKey);
            setVersion(v => v + 1); // Force update on consumers
        }).catch(() => {
            requestQueue.delete(requestKey);
        });
    }

    return text; // Return original text while translation is pending
  }, [language, cache, requestQueue]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
