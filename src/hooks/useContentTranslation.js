import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

// Difficulty level translations
const difficultyTranslations = {
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate', 
    advanced: 'Advanced',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  },
  hi: {
    beginner: 'शुरुआती',
    intermediate: 'मध्यम',
    advanced: 'उन्नत',
    easy: 'आसान',
    medium: 'मध्यम',
    hard: 'कठिन'
  },
  gu: {
    beginner: 'શરૂઆતી',
    intermediate: 'મધ્યમ',
    advanced: 'અદ્યતન',
    easy: 'સરળ',
    medium: 'મધ્યમ',
    hard: 'મુશ્કેલ'
  },
  mr: {
    beginner: 'प्राथमिक',
    intermediate: 'मध्यम',
    advanced: 'प्रगत',
    easy: 'सोपे',
    medium: 'मध्यम',
    hard: 'कठीण'
  },
  bn: {
    beginner: 'শিক্ষানবিশ',
    intermediate: 'মধ্যম',
    advanced: 'উন্নত',
    easy: 'সহজ',
    medium: 'মধ্যম',
    hard: 'কঠিন'
  },
  ru: {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный'
  },
  zh: {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
};

// Status translations
const statusTranslations = {
  en: {
    new: 'New',
    'in-progress': 'In Progress',
    completed: 'Completed',
    processing: 'Processing',
    failed: 'Failed'
  },
  hi: {
    new: 'नया',
    'in-progress': 'प्रगति में',
    completed: 'पूर्ण',
    processing: 'प्रसंस्करण',
    failed: 'असफल'
  },
  gu: {
    new: 'નવું',
    'in-progress': 'પ્રગતિમાં',
    completed: 'પૂર્ણ',
    processing: 'પ્રક્રિયા',
    failed: 'નિષ્ફળ'
  },
  mr: {
    new: 'नवीन',
    'in-progress': 'प्रगतीत',
    completed: 'पूर्ण',
    processing: 'प्रक्रिया',
    failed: 'अयशस्वी'
  },
  bn: {
    new: 'নতুন',
    'in-progress': 'চলমান',
    completed: 'সম্পন্ন',
    processing: 'প্রক্রিয়াকরণ',
    failed: 'ব্যর্থ'
  },
  ru: {
    new: 'Новый',
    'in-progress': 'В процессе',
    completed: 'Завершено',
    processing: 'Обработка',
    failed: 'Неудачно'
  },
  zh: {
    new: '新的',
    'in-progress': '进行中',
    completed: '已完成',
    processing: '处理中',
    failed: '失败'
  }
};

// Enhanced translation function that handles multiple source languages
const translateText = async (text, targetLang, sourceLang = 'auto') => {
  if (targetLang === 'en' || !text || text.length < 2) return text;
  
  try {
    // If we're going from a specific source language, use it
    const langPair = sourceLang === 'auto' ? `auto|${targetLang}` : `${sourceLang}|${targetLang}`;
    
    // Using MyMemory API which is free and doesn't require API key
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=${encodeURIComponent('guptaarpan21@gmail.com')}`
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

export const useContentTranslation = () => {
  const { i18n } = useTranslation();
  const [translationCache, setTranslationCache] = useState({});
  const [previousLanguage, setPreviousLanguage] = useState(i18n.language);
  
  const currentLang = i18n.language;

  // Clear cache when language changes to ensure fresh translations
  useEffect(() => {
    if (previousLanguage !== currentLang) {
      setTranslationCache({});
      setPreviousLanguage(currentLang);
    }
  }, [currentLang, previousLanguage]);

  const translateDifficulty = (difficulty) => {
    if (!difficulty) return '';
    const lowercased = difficulty.toLowerCase();
    return difficultyTranslations[currentLang]?.[lowercased] || 
           difficultyTranslations.en[lowercased] || 
           difficulty;
  };

  const translateStatus = (status) => {
    if (!status) return '';
    const lowercased = status.toLowerCase();
    return statusTranslations[currentLang]?.[lowercased] || 
           statusTranslations.en[lowercased] || 
           status;
  };

  const translateContentText = async (text, cacheKey = null) => {
    if (!text || currentLang === 'en') return text;
    
    // Generate a unique cache key that includes target language
    const textHash = btoa(text.substring(0, 50));
    const key = cacheKey || `text_${textHash}_to_${currentLang}`;
    
    // Check if we have the translation in cache
    if (translationCache[key]) {
      return translationCache[key];
    }

    try {
      // For dynamic content translation, let the API auto-detect source language
      // This handles switching between different non-English languages properly
      const translated = await translateText(text, currentLang, 'auto');
      
      // Cache the translation
      setTranslationCache(prev => ({
        ...prev,
        [key]: translated
      }));
      
      return translated;
    } catch (error) {
      console.warn('Content translation failed:', error);
      return text;
    }
  };

  const translateContent = async (content) => {
    if (!content || currentLang === 'en') return content;

    const translatedContent = { ...content };

    // Translate title if it exists
    if (content.title) {
      translatedContent.title = await translateContentText(content.title, `title_${content.id}_${currentLang}`);
    }

    // Translate summary if it exists
    if (content.summary) {
      translatedContent.summary = await translateContentText(content.summary, `summary_${content.id}_${currentLang}`);
    }

    // Translate AI summary if it exists
    if (content.aiSummary?.summary) {
      translatedContent.aiSummary = {
        ...content.aiSummary,
        summary: await translateContentText(content.aiSummary.summary, `ai_summary_${content.id}_${currentLang}`)
      };

      // Translate key topics
      if (content.aiSummary.keyTopics) {
        const translatedTopics = await Promise.all(
          content.aiSummary.keyTopics.map(async (topic, index) => 
            await translateContentText(topic, `topic_${content.id}_${index}_${currentLang}`)
          )
        );
        translatedContent.aiSummary.keyTopics = translatedTopics;
      }

      // Translate sections
      if (content.aiSummary.sections) {
        const translatedSections = await Promise.all(
          content.aiSummary.sections.map(async (section, index) => ({
            ...section,
            title: await translateContentText(section.title, `section_title_${content.id}_${index}_${currentLang}`),
            summary: await translateContentText(section.summary, `section_summary_${content.id}_${index}_${currentLang}`),
            keyPoints: await Promise.all(
              (section.keyPoints || []).map(async (point, pointIndex) =>
                await translateContentText(point, `section_point_${content.id}_${index}_${pointIndex}_${currentLang}`)
              )
            )
          }))
        );
        translatedContent.aiSummary.sections = translatedSections;
      }
    }

    // Always translate difficulty and status using predefined translations
    if (content.difficulty) {
      translatedContent.difficulty = translateDifficulty(content.difficulty);
    }

    if (content.status) {
      translatedContent.status = translateStatus(content.status);
    }

    return translatedContent;
  };

  const clearTranslationCache = () => {
    setTranslationCache({});
  };

  return {
    translateDifficulty,
    translateStatus,
    translateContentText,
    translateContent,
    clearTranslationCache,
    isTranslating: false, // For now, we'll handle this simply
    currentLanguage: currentLang
  };
};
