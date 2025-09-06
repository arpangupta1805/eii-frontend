import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../hooks/useDynamicTranslation';

const TranslatedText = ({ text, fallback = '', cacheKey, className = '' }) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text || fallback);
  const [isTranslating, setIsTranslating] = useState(false);
  const { translateText } = useDynamicTranslation();

  useEffect(() => {
    const translateContent = async () => {
      if (!text || !text.trim()) {
        setTranslatedText(fallback);
        return;
      }

      // If the current language is English or if text is already in English, no translation needed
      if (i18n.language === 'en' || !text) {
        setTranslatedText(text || fallback);
        return;
      }

      // Check cache first
      const cacheKeyToUse = cacheKey || `translated_${text.substring(0, 50)}_${i18n.language}`;
      const cachedTranslation = localStorage.getItem(cacheKeyToUse);
      
      if (cachedTranslation) {
        setTranslatedText(cachedTranslation);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateText(text, i18n.language);
        if (translated && translated.trim()) {
          setTranslatedText(translated);
          // Cache the translation
          localStorage.setItem(cacheKeyToUse, translated);
        } else {
          setTranslatedText(text || fallback);
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text || fallback);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [text, i18n.language, fallback, cacheKey, translateText]);

  if (isTranslating) {
    return (
      <span className={`inline-block ${className}`}>
        {fallback || text || '...'}
      </span>
    );
  }

  return (
    <span className={className}>
      {translatedText || fallback || text || ''}
    </span>
  );
};

export default TranslatedText;
