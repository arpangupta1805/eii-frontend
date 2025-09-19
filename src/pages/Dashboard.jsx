import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useLearning } from '../contexts/LearningContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useContentTranslation } from '../hooks/useContentTranslation';
import TranslatedText from '../components/TranslatedText';
import StreakTracker from '../components/StreakTracker';
import Chatbot from '../components/Chatbot';

const Dashboard = () => {
  const { contents } = useLearning();
  const { isSignedIn, user } = useUser();
  const { t } = useTranslation();
  const { translateDifficulty, translateStatus } = useContentTranslation();
  const totalContents = contents.length;
  const completedContents = contents.filter(c => c.progress === 100).length;
  const inProgressContents = contents.filter(c => c.progress > 0 && c.progress < 100).length;
  const averageProgress = Math.round(contents.reduce((sum, c) => sum + c.progress, 0) / totalContents);

  const stats = [
    {
      title: 'Total Content',
      value: totalContents,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Completed',
      value: completedContents,
      icon: TrophyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'In Progress',
      value: inProgressContents,
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Average Progress',
      value: `${averageProgress}%`,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (progress) => {
    if (progress === 100) return '🏆';
    if (progress > 50) return '🔥';
    if (progress > 0) return '📚';
    return '📝';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-interactive p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.bgColor} mr-4`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 font-medium">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.my_content')}</h2>
          </div>

          <div className="space-y-6">
            {contents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 card-interactive"
              >
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {t('dashboard.upload_first_content')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.upload_description')}
                </p>
                <Link to="/upload" className="btn-primary">
                  {t('dashboard.upload_button')}
                </Link>
              </motion.div>
            ) : (
              contents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="learning-card p-6 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {getStatusIcon(content.progress)} 
                            {content.progress < 100 ? (
                              <Link 
                                to={`/learning/${content.id}`}
                                className="hover:text-primary-600 transition-colors"
                              >
                                <TranslatedText text={content.title} cacheKey={`title_${content.id}`} />
                              </Link>
                            ) : (
                              <TranslatedText text={content.title} cacheKey={`title_${content.id}`} />
                            )}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            <TranslatedText text={content.summary} cacheKey={`summary_${content.id}`} />
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(content.difficulty)}`}>
                              {translateDifficulty(content.difficulty)}
                            </span>
                            <span className="text-gray-500">
                              Uploaded {new Date(content.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col space-y-2">
                            {content.progress === 100 && (
                              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-center">
                                {t('dashboard.content_status.completed')}! 🎉
                              </div>
                            )}
                            
                            <div className="flex space-x-2">
                              
                              {content.progress === 100 && (
                                content.quizHistory?.hasQuiz ? (
                                  <div className="flex flex-col space-y-1">
                                    <Link
                                      to={`/quiz/${content.id}`}
                                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center text-sm"
                                    >
                                      {content.quizHistory.totalAttempts > 0 ? 'Retake Quiz' : 'Take Quiz'}
                                    </Link>
                                    {content.quizHistory.totalAttempts > 0 && (
                                      <div className="text-xs text-gray-600 text-center">
                                        Best: {content.quizHistory.bestScore}% {content.quizHistory.isPassed && '✓'}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Link
                                    to={`/quiz/${content.id}`}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center text-sm"
                                  >
                                    Take Quiz
                                  </Link>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{content.progress}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${content.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-interactive p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/upload"
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Upload New Content</span>
              </Link>
              <Link
                to="/quizzes/past"
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <ClockIcon className="h-5 w-5" />
                <span>Past Quizzes</span>
              </Link>
              <Link
                to="/analytics"
                className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                View All Analytics
              </Link>
            </div>
          </motion.div>

          {/* Streak Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StreakTracker />
          </motion.div>

        </div>
      </div>
      
      {/* General Chatbot for dashboard */}
      <Chatbot 
        context="general"
        isVisible={true}
      />
    </div>
  );
};

export default Dashboard;
