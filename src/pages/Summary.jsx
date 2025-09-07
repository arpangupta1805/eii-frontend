import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useLearning } from '../contexts/LearningContext';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '../hooks/useContentTranslation';
import Chatbot from '../components/Chatbot';

const Summary = () => {
  const { contentId } = useParams();
  const { contents } = useLearning();
  const { t } = useTranslation();
  const { translateDifficulty } = useContentTranslation();
  const [content, setContent] = useState(null);

  useEffect(() => {
    const foundContent = contents.find(c => c.id === contentId);
    if (foundContent) {
      setContent(foundContent);
      console.log('=== CONTENT LOADED IN SUMMARY PAGE ===');
      console.log('Content:', foundContent);
      console.log('AI Summary:', foundContent.aiSummary);
      console.log('=====================================');
    }
  }, [contentId, contents]);

  // Get real AI summary data or fallback
  const getContentSummary = () => {
    if (content?.aiSummary) {
      return {
        title: content.title,
        mainTopics: content.aiSummary.keyTopics?.map(topic => topic.topic || topic) || [],
        keyInsights: content.aiSummary.sections?.map(section => section.content || section.summary) || [content.aiSummary.summary],
        sections: content.aiSummary.sections || [],
        practicalExamples: [], // We don't have examples in our AI summary
        studyTips: content.aiSummary.learningObjectives || []
      };
    }
    
    return {
      title: content?.title || 'Content',
      mainTopics: ['Processing...'],
      keyInsights: [content?.summary || 'Processing...'],
      sections: [],
      practicalExamples: [],
      studyTips: ['Please wait while AI processes the content...']
    };
  };

  const summary = content ? getContentSummary() : {
    title: 'Loading...',
    mainTopics: [],
    keyInsights: [],
    sections: [],
    practicalExamples: [],
    studyTips: []
  };

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">
          📋 Content Summary
        </h1>
        <p className="text-gray-600 text-lg">
          {summary.title}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-interactive p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-7 w-7 mr-3 text-primary-600" />
              Learning Progress
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3">
                  <CircularProgressbar
                    value={content.progress}
                    text={`${content.progress}%`}
                    styles={buildStyles({
                      textSize: '18px',
                      pathColor: content.progress === 100 ? '#22c55e' : 
                                content.progress > 50 ? '#3b82f6' : '#f59e0b',
                      textColor: '#374151',
                      trailColor: '#f3f4f6',
                    })}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900">Overall Progress</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrophyIcon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {content.progress === 100 ? 'Completed' : 'In Progress'}
                </p>
                <p className="text-sm text-gray-600">Status</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">{content.estimatedTime}</p>
                <p className="text-sm text-gray-600">Study Time</p>
              </div>
            </div>
          </motion.div>

          {/* Main Topics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-interactive p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpenIcon className="h-7 w-7 mr-3 text-primary-600" />
              Main Topics Covered
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.mainTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                >
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                  <span className="font-medium text-blue-900">{topic}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-interactive p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <LightBulbIcon className="h-7 w-7 mr-3 text-yellow-600" />
              Key Insights
            </h2>
            
            <div className="space-y-4">
              {summary.keyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{insight}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Practical Examples */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-interactive p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <PlayCircleIcon className="h-7 w-7 mr-3 text-green-600" />
              Practical Examples
            </h2>
            
            <div className="space-y-6">
              {summary.practicalExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
                >
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    {example.title}
                  </h3>
                  <p className="text-green-800 mb-3">{example.description}</p>
                  <div className="inline-flex items-center px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium">
                    💡 {example.algorithm}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-interactive p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {content.progress < 100 ? (
                <>
                  <Link
                    to={`/learning/${contentId}`}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    <span>Continue Learning</span>
                  </Link>
                  <Link
                    to={`/quiz/${contentId}`}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <TrophyIcon className="h-5 w-5" />
                    <span>Take Quiz</span>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-green-600 font-semibold">Content Completed!</p>
                  <Link
                    to={`/quiz/${contentId}`}
                    className="mt-3 w-full bg-green-100 hover:bg-green-200 text-green-700 font-medium py-3 px-4 rounded-xl transition-colors block"
                  >
                    Retake Quiz
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Study Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-interactive p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💡 Study Tips
            </h3>
            <div className="space-y-3">
              {summary.studyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card-interactive p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reading Time</span>
                <span className="font-semibold">{content.estimatedTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Difficulty</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  content.difficulty === 'advanced' ? 'bg-red-100 text-red-700' :
                  content.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {content.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{content.progress}%</span>
              </div>
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/"
              className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Chatbot for content context */}
      <Chatbot 
        contentId={contentId}
        context="content"
        isVisible={true}
      />
    </div>
  );
};

export default Summary;
