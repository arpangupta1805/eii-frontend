import { useContext } from 'react';

export const useDynamicTranslation = () => {
  // This is a fallback hook for when DynamicTranslationProvider is not used
  // The actual hook is exported from DynamicTranslationContext.jsx
  
  console.warn('useDynamicTranslation used without DynamicTranslationProvider. Using fallback behavior.');
  return {
    translateDynamicContent: (content) => Promise.resolve(content),
    isTranslating: false,
    currentLanguage: 'en',
    clearCache: () => {}
  };
};
