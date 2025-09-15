
import { useContext, useSyncExternalStore } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Subscribe to version changes in LanguageContext to force re-render
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  // Use a dummy subscription to the version state in LanguageContext
  // This will force all consumers to re-render when translations update
  useSyncExternalStore(
    // Subscribe: listen to storage events (cache update triggers setVersion)
    (callback) => {
      window.addEventListener('language-version', callback);
      return () => window.removeEventListener('language-version', callback);
    },
    // Get snapshot: always return 0 (we only care about triggering re-render)
    () => 0
  );
  return context;
};
