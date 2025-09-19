import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { analyticsAPI } from '../utils/api';
import QuizDetailsModal from '../components/QuizDetailsModal';

const AllAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState({});

  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnalysis(null);
  };

  const toggleInsights = (quizId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAllQuizAnalyses();
      console.log('Analytics API response:', response);
      
      // The API returns { success: true, data: { analyses: [...] } }
      if (response && response.data && Array.isArray(response.data.analyses)) {
        setAnalytics(response.data.analyses);
      } else if (response && Array.isArray(response.analyses)) {
        setAnalytics(response.analyses);
      } else if (Array.isArray(response)) {
        setAnalytics(response);
      } else {
        console.warn('Analytics API returned unexpected data structure:', response);
        setAnalytics([]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quiz Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive analysis of your quiz performance and learning progress
              </p>
            </div>
            <Link to="/" className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Quick Stats */}
          {Array.isArray(analytics) && analytics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(analytics) && analytics.length > 0 
                        ? Math.round(analytics.reduce((acc, analysis) => acc + analysis.performance.bestScore, 0) / analytics.length)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(analytics) ? analytics.reduce((acc, analysis) => acc + analysis.performance.totalAttempts, 0) : 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(analytics) && analytics.length > 0 
                        ? Math.max(...analytics.map(analysis => analysis.performance.bestScore))
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        {!Array.isArray(analytics) || analytics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Available</h3>
              <p className="text-gray-600 mb-6">
                Complete some quizzes to see your performance analytics here.
              </p>
              <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Learning
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quiz Cards - Takes 2/3 of space */}
            <div className="lg:col-span-2 space-y-6">
              {analytics.map((analysis, index) => (
                <motion.div
                  key={analysis.quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Quiz Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {analysis.quiz.title || 'Untitled Quiz'}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {analysis.performance.totalAttempts} attempt{analysis.performance.totalAttempts > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(analysis)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <TrophyIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-700">{analysis.performance.bestScore}%</div>
                        <div className="text-sm text-green-600">Best Score</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-700">{analysis.latestAnalysis?.score || 0}%</div>
                        <div className="text-sm text-blue-600">Latest Score</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <AcademicCapIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-700">{analysis.latestAnalysis?.totalQuestions || 0}</div>
                        <div className="text-sm text-purple-600">Questions</div>
                      </div>
                    </div>

                    {/* AI Insights Toggle */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <button
                        onClick={() => toggleInsights(analysis.quiz.id)}
                        className="w-full p-3 flex items-center justify-between hover:from-purple-100 hover:to-blue-100 transition-all rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <FireIcon className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-900">AI Insights</span>
                        </div>
                        {expandedInsights[analysis.quiz.id] ? 
                          <ChevronUpIcon className="w-5 h-5 text-purple-600" /> : 
                          <ChevronDownIcon className="w-5 h-5 text-purple-600" />
                        }
                      </button>
                      
                      {expandedInsights[analysis.quiz.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-3 pb-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Strengths */}
                            <div className="bg-white border border-green-200 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm font-semibold text-green-800">Strengths</span>
                              </div>
                              <div className="text-xs text-green-700 space-y-1">
                                {analysis.latestAnalysis?.strengths?.length > 0 ? (
                                  analysis.latestAnalysis.strengths.slice(0, 3).map((strength, idx) => (
                                    <p key={idx}>• {strength}</p>
                                  ))
                                ) : (
                                  <>
                                    <p>• Consistent performance across attempts</p>
                                    <p>• Strong grasp of core concepts</p>
                                    <p>• Quick learning and adaptation</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Areas of Improvement */}
                            <div className="bg-white border border-red-200 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <XCircleIcon className="w-4 h-4 text-red-600 mr-2" />
                                <span className="text-sm font-semibold text-red-800">Areas to Improve</span>
                              </div>
                              <div className="text-xs text-red-700 space-y-1">
                                {analysis.latestAnalysis?.weaknesses?.length > 0 ? (
                                  analysis.latestAnalysis.weaknesses.slice(0, 3).map((weakness, idx) => (
                                    <p key={idx}>• {weakness}</p>
                                  ))
                                ) : (
                                  <>
                                    <p>• Time management during quizzes</p>
                                    <p>• Complex problem-solving</p>
                                    <p>• Advanced conceptual questions</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-white border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <AcademicCapIcon className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-sm font-semibold text-blue-800">Recommendations</span>
                              </div>
                              <div className="text-xs text-blue-700 space-y-1">
                                {analysis.latestAnalysis?.recommendations?.length > 0 ? (
                                  analysis.latestAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                                    <p key={idx}>• {rec}</p>
                                  ))
                                ) : (
                                  <>
                                    <p>• Practice with timed quizzes</p>
                                    <p>• Focus on weak topic areas</p>
                                    <p>• Review incorrect answers</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-white border border-purple-200 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <ClockIcon className="w-4 h-4 text-purple-600 mr-2" />
                                <span className="text-sm font-semibold text-purple-800">Next Steps</span>
                              </div>
                              <div className="text-xs text-purple-700 space-y-1">
                                {analysis.latestAnalysis?.aiSummary?.nextSteps ? (
                                  <p>• {analysis.latestAnalysis.aiSummary.nextSteps}</p>
                                ) : (
                                  <>
                                    <p>• Take advanced level quizzes</p>
                                    <p>• Join study groups</p>
                                    <p>• Set weekly learning goals</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                      <Link
                        to={analysis.content ? `/quiz/${analysis.content.id}` : `/quiz/take/${analysis.quiz.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Take Again →
                      </Link>
                      <span className="text-gray-400 text-sm">
                        {analysis.quiz.category || 'Custom Quiz'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Overall Progress Sidebar - Takes 1/3 of space */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 sticky top-6"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Progress Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Learning Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Quizzes Completed</span>
                          <span className="font-semibold text-gray-800">{Array.isArray(analytics) ? analytics.length : 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Performance</span>
                          <span className="font-semibold text-green-600">
                            {Array.isArray(analytics) && analytics.length > 0 
                              ? Math.round(analytics.reduce((acc, analysis) => acc + analysis.performance.bestScore, 0) / analytics.length)
                              : 0
                            }%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Best Performance</span>
                          <span className="font-semibold text-blue-600">
                            {Array.isArray(analytics) && analytics.length > 0 ? Math.max(...analytics.map(analysis => analysis.performance.bestScore)) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Array.isArray(analytics) && analytics.length > 0 
                                ? Math.round(analytics.reduce((acc, analysis) => acc + analysis.performance.bestScore, 0) / analytics.length)
                                : 0
                              }%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Performance Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Excellent (90%+)</span>
                          <span className="text-sm font-medium text-green-600">
                            {Array.isArray(analytics) ? analytics.filter(analysis => analysis.performance.bestScore >= 90).length : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Good (70-89%)</span>
                          <span className="text-sm font-medium text-blue-600">
                            {Array.isArray(analytics) ? analytics.filter(analysis => analysis.performance.bestScore >= 70 && analysis.performance.bestScore < 90).length : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Needs Practice (&lt;70%)</span>
                          <span className="text-sm font-medium text-red-600">
                            {Array.isArray(analytics) ? analytics.filter(analysis => analysis.performance.bestScore < 70).length : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <Link to="/upload-content" className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                          Upload New Content
                        </Link>
                        <Link to="/custom-quiz" className="block w-full text-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                          Create Custom Quiz
                        </Link>
                        <Link to="/" className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Quiz Details Modal */}
        <QuizDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          analysis={selectedAnalysis}
        />
      </div>
    </div>
  );
};

export default AllAnalytics;