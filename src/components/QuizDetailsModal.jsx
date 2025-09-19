import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const QuizDetailsModal = ({ isOpen, onClose, analysis }) => {
  if (!analysis) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-50"
            >
              <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                <button
                  type="button"
                  className="bg-white rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Quiz Details
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Quiz Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{analysis.quiz.title}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium capitalize">{analysis.quiz.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="ml-2 font-medium capitalize">{analysis.quiz.difficulty}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">
                            {analysis.quiz.isCustom ? 'Custom Quiz' : 'Content-based'}
                          </span>
                        </div>
                        {analysis.content && (
                          <div className="col-span-2">
                            <span className="text-gray-600">From Content:</span>
                            <span className="ml-2 font-medium">{analysis.content.title}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Best Score:</span>
                          <span className={`ml-2 font-bold ${getScoreColor(analysis.performance.bestScore)}`}>
                            {analysis.performance.bestScore}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Attempts:</span>
                          <span className="ml-2 font-medium">{analysis.performance.totalAttempts}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 font-medium ${
                            analysis.performance.isPassed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {analysis.performance.isPassed ? 'Passed' : 'Not Passed'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Taken:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(analysis.performance.lastAttempt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Latest Attempt Details */}
                    {analysis.latestAnalysis && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Latest Attempt</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <span className={`ml-2 font-bold ${getScoreColor(analysis.latestAnalysis.score)}`}>
                              {analysis.latestAnalysis.score}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Correct:</span>
                            <span className="ml-2 font-medium">
                              {analysis.latestAnalysis.correctAnswers}/{analysis.latestAnalysis.totalQuestions}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time Spent:</span>
                            <span className="ml-2 font-medium">{analysis.latestAnalysis.timeSpent || 0} min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="ml-2 font-medium">
                              {formatDate(analysis.latestAnalysis.completedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Summary */}
                    {analysis.latestAnalysis?.aiSummary && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">AI Performance Summary</h4>
                        {analysis.latestAnalysis.aiSummary.summary && (
                          <p className="text-sm text-gray-700 mb-3">
                            {analysis.latestAnalysis.aiSummary.summary}
                          </p>
                        )}
                        {analysis.latestAnalysis.aiSummary.motivationalMessage && (
                          <p className="text-sm text-purple-700 font-medium">
                            💡 {analysis.latestAnalysis.aiSummary.motivationalMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuizDetailsModal;