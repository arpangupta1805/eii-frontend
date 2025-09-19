import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useLearning } from '../contexts/LearningContext';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '../hooks/useContentTranslation';
import TranslatedText from '../components/TranslatedText';
import Chatbot from '../components/Chatbot';

const Learning = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { contents, updateProgress, updateSectionCompletion } = useLearning();
  const { t } = useTranslation();
  const { translateContent } = useContentTranslation();
  const [content, setContent] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());

  // Mock detailed summary content
  const summaryContent = {
    '1': {
      title: 'Machine Learning Fundamentals',
      sections: [
        {
          title: 'Introduction to Machine Learning',
          content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. It involves creating algorithms that can identify patterns in data and make predictions or decisions based on those patterns.',
          keyPoints: ['Pattern recognition', 'Data-driven decisions', 'Automated learning', 'Predictive modeling'],
          examples: ['Email spam detection', 'Recommendation systems', 'Image recognition']
        },
        {
          title: 'Types of Machine Learning',
          content: 'There are three main types of machine learning: Supervised Learning uses labeled data to train models, Unsupervised Learning finds hidden patterns in unlabeled data, and Reinforcement Learning learns through interaction with an environment using rewards and penalties.',
          keyPoints: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
          examples: ['Classification', 'Clustering', 'Game playing AI']
        },
        {
          title: 'Common Algorithms',
          content: 'Popular machine learning algorithms include Linear Regression for predicting continuous values, Decision Trees for classification problems, Neural Networks for complex pattern recognition, and Support Vector Machines for classification and regression tasks.',
          keyPoints: ['Linear Regression', 'Decision Trees', 'Neural Networks', 'Support Vector Machines'],
          examples: ['Price prediction', 'Medical diagnosis', 'Image classification']
        }
      ]
    },
    '2': {
      title: 'React Advanced Patterns',
      sections: [
        {
          title: 'Advanced React Hooks',
          content: 'Custom hooks allow you to extract component logic into reusable functions. useCallback and useMemo help optimize performance by preventing unnecessary re-renders and calculations.',
          keyPoints: ['Custom Hooks', 'useCallback', 'useMemo', 'Performance optimization'],
          examples: ['useLocalStorage hook', 'useDebounce hook', 'useFetch hook']
        }
      ]
    },
    '3': {
      title: 'Data Structures & Algorithms',
      sections: [
        {
          title: 'Fundamental Data Structures',
          content: 'Arrays, linked lists, stacks, and queues are the building blocks of computer science. Understanding these structures is crucial for writing efficient code and solving complex problems.',
          keyPoints: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'],
          examples: ['Dynamic arrays', 'Browser history', 'Task scheduling']
        }
      ]
    }
  };

  useEffect(() => {
    const foundContent = contents.find(c => c.id === contentId || c.id === parseInt(contentId) || c.id.toString() === contentId);
    
    if (foundContent) {
      setContent(foundContent);
      // Initialize completed sections from context
      const completedSectionsSet = new Set(foundContent.completedSections || []);
      setCompletedSections(completedSectionsSet);
    }
  }, [contentId, contents]);

  // Update reading progress based on completed sections
  useEffect(() => {
    const summary = content ? getContentSummary() : { sections: [] };
    const totalSections = summary.sections.length;
    const completedCount = completedSections.size;
    const newProgress = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
    
    setReadingProgress(newProgress);
    
    // Update content progress in context based on section completion
    if (content) {
      updateProgress(contentId, newProgress);
    }
    
    if (newProgress === 100 && totalSections > 0) {
      setShowQuizButton(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      // Update content progress to 100% when all sections are completed
      updateProgress(contentId, 100);
    }
  }, [completedSections, content, contentId, updateProgress]);


  const handleStartReading = () => {
    setIsReading(true);
    setReadingProgress(0);
  };

  const handlePauseReading = () => {
    setIsReading(false);
  };

  const handleSectionToggle = (sectionIndex) => {
    setCompletedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      
      // Update context with new completed sections
      const completedSectionsArray = Array.from(newSet);
      updateSectionCompletion(contentId, completedSectionsArray);
      
      return newSet;
    });
  };


  const handleTakeQuiz = () => {
    updateProgress(contentId, Math.max(content.progress, 50));
    navigate(`/quiz/${contentId}`);
  };

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
          <p className="mt-2 text-sm text-gray-500">Content ID: {contentId}</p>
        </div>
      </div>
    );
  }

  // Get real AI summary data or fallback
  const getContentSummary = () => {
    if (content?.aiSummary && content.aiSummary.sections && content.aiSummary.sections.length > 0) {
      // Use real AI-generated content
      return {
        title: content.title,
        sections: content.aiSummary.sections.map(section => ({
          title: section.title,
          content: section.content,
          keyPoints: section.keyPoints || [],
          // Remove examples, show keyTopics instead
          keyTopics: content.aiSummary.keyTopics?.map(topic => topic.topic || topic) || []
        }))
      };
    }
    
    // Fallback for content without AI summary
    return {
      title: content?.title || 'Content',
      sections: [
        {
          title: 'Content Summary',
          content: content?.summary || 'No summary available',
          keyPoints: content?.aiSummary?.keyTopics?.map(topic => topic.topic || topic) || ['Processing...'],
          keyTopics: content?.aiSummary?.keyTopics?.map(topic => topic.topic || topic) || []
        }
      ]
    };
  };

  const summary = content ? getContentSummary() : { title: 'Loading...', sections: [] };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          📚 <TranslatedText text={summary.title} fallback={t('common.loading')} />
        </h1>
        <div className="flex items-center justify-center space-x-6 text-gray-600">
          <div className="flex items-center">
            <BookOpenIcon className="h-5 w-5 mr-2" />
            <span>{summary.sections.length} {t('learning.sections')}</span>
          </div>
        </div>
      </motion.div>

      {/* Reading Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-interactive p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('learning.reading_progress')}</h2>
          {showQuizButton && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
              <span className="font-semibold">{t('learning.reading_complete')}</span>
            </div>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600">{readingProgress}% {t('learning.complete_progress')}</p>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-8 mb-8">
        {summary.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`learning-card p-8 transition-all duration-300 ${
              completedSections.has(index) ? 'ring-2 ring-green-200 bg-green-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">
                  {index === 0 ? '🎯' : index === 1 ? '📈' : '🚀'}
                </span>
                {section.title}
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${
                  completedSections.has(index) ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {completedSections.has(index) ? 'Completed' : 'In Progress'}
                </span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completedSections.has(index)}
                    onChange={() => handleSectionToggle(index)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    completedSections.has(index)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-400'
                  }`}>
                    {completedSections.has(index) && (
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                {section.content}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Key Points */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <LightBulbIcon className="h-6 w-6 mr-2" />
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {section.keyPoints && section.keyPoints.length > 0 ? (
                    section.keyPoints.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center text-blue-800"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-3 text-blue-600" />
                        {point}
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-blue-600 italic">No key points available</li>
                  )}
                </ul>
              </div>

              {/* Key Topics (instead of examples) */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  🏷️ Key Topics
                </h3>
                <ul className="space-y-2">
                  {section.keyTopics && section.keyTopics.length > 0 ? (
                    section.keyTopics.map((topic, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center text-purple-800"
                      >
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        {topic}
                      </motion.li>
                    ))
                  ) : (
                    content?.aiSummary?.keyTopics?.map((topicObj, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center text-purple-800"
                      >
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                        {topicObj.topic || topicObj}
                      </motion.li>
                    )) || [
                      <li key="no-topics" className="text-purple-600 italic">No topics available</li>
                    ]
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quiz Button */}
      <AnimatePresence>
        {showQuizButton && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="text-center"
          >
            <div className="card-interactive p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Great job reading the summary!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Ready to test your understanding? Take the quiz to see how well you've learned the material.
              </p>
              <button
                onClick={handleTakeQuiz}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-3 mx-auto"
              >
                <span>{t('learning.take_quiz')}</span>
                <ArrowRightIcon className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 card-interactive p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200"
      >
        <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
          💡 Study Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
          <div className="flex items-start space-x-2">
            <span>📝</span>
            <span>Take notes while reading to improve retention</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>🔄</span>
            <span>Review key points multiple times</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>❓</span>
            <span>Ask yourself questions about the content</span>
          </div>
          <div className="flex items-start space-x-2">
            <span>🎯</span>
            <span>Focus on understanding, not just memorizing</span>
          </div>
        </div>
      </motion.div>
      
      {/* Chatbot for content context */}
      <Chatbot 
        contentId={contentId}
        context="content"
        isVisible={true}
      />
    </div>
  );
};

export default Learning;
