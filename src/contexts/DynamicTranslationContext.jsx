import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicTranslationContext = createContext();

export { DynamicTranslationContext };

export const useDynamicTranslation = () => {
  const context = useContext(DynamicTranslationContext);
  if (!context) {
    throw new Error('useDynamicTranslation must be used within a DynamicTranslationProvider');
  }
  return context;
};

export const DynamicTranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationQueue, setTranslationQueue] = useState(new Set());

  // Simple translation function using MyMemory API
  const translateText = async (text, targetLang) => {
    if (targetLang === 'en' || !text || text.length < 2) return text;
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}&de=${encodeURIComponent('contact@example.com')}`
      );
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (error) {
      console.warn('Translation failed, using original text:', error);
      return text;
    }
  };


  // Clear cache and translation queue when language changes
  useEffect(() => {
    setTranslationCache({});
    setTranslationQueue(new Set());
    setIsTranslating(false);
  }, [i18n.language]);

  const translateDynamicContent = async (content, cacheKey = null) => {
    if (!content || i18n.language === 'en') {
      return content;
    }

    const key = cacheKey || `dynamic_${Date.now()}`;
    
    // Check cache first
    if (translationCache[key]) {
      return translationCache[key];
    }
    
    // Add to translation queue to show loading state
    setTranslationQueue(prev => new Set([...prev, key]));
    setIsTranslating(true);

    try {
      const translated = await translateText(content, i18n.language);
      
      // Cache the result
      setTranslationCache(prev => ({
        ...prev,
        [key]: translated
      }));
      
      // Remove from queue
      setTranslationQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(key);
        return newQueue;
      });

      // Update translating state
      setIsTranslating(prev => translationQueue.size > 1);

      return translated;
    } catch (error) {
      console.warn('Dynamic translation failed:', error);
      
      // Remove from queue even on error
      setTranslationQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(key);
        return newQueue;
      });
      
      setIsTranslating(prev => translationQueue.size > 1);
      
      return content;
    }
  };

  const clearCache = () => {
    setTranslationCache({});
  };

  const value = {
    translateDynamicContent,
    isTranslating,
    currentLanguage: i18n.language,
    clearCache
  };

  return (
    <DynamicTranslationContext.Provider value={value}>
      {children}
    </DynamicTranslationContext.Provider>
  );
};
