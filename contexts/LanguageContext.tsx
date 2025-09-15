import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { translateText, translateBatch } from '../services/geminiService';

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
  const batchQueue = useRef(new Set<string>()).current;
  const batchTimer = useRef<number | null>(null);

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
    // If translation exists and is not the same as the original, return it
    if (langCache[text] && langCache[text] !== text) {
      return langCache[text]!;
    }

    const requestKey = `${language}:${text}`;
    if (!requestQueue.has(requestKey)) {
      requestQueue.add(requestKey);
      // Add to batch queue for periodic flushing
      batchQueue.add(text);

      // Schedule a batch flush in 300ms (collect small bursts)
      if (batchTimer.current) {
        window.clearTimeout(batchTimer.current);
      }
      batchTimer.current = window.setTimeout(async () => {
        const texts: string[] = Array.from(batchQueue) as string[];
        batchQueue.clear();
        try {
          const translations = await translateBatch(texts, language) as string[];
          setCache(prevCache => {
            const langObj = { ...(prevCache[language] || {}) };
            texts.forEach((txt, i) => {
              langObj[txt] = translations[i] || txt;
              requestQueue.delete(`${language}:${txt}`);
            });
            return { ...prevCache, [language]: langObj };
          });
          setVersion(v => {
            window.dispatchEvent(new Event('language-version'));
            return v + 1;
          });
        } catch (e) {
          // fallback: translate individually
          for (const txt of texts) {
            translateText(txt, language).then(translated => {
              setCache(prevCache => ({
                ...prevCache,
                [language]: {
                  ...(prevCache[language] || {}),
                  [txt]: translated,
                },
              }));
              requestQueue.delete(`${language}:${txt}`);
              setVersion(v => {
                window.dispatchEvent(new Event('language-version'));
                return v + 1;
              });
            }).catch(() => {
              requestQueue.delete(`${language}:${txt}`);
            });
          }
        }
      }, 300);
    }

    // If translation is pending or failed, return original text for now
    return text;
  }, [language, cache, requestQueue]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
