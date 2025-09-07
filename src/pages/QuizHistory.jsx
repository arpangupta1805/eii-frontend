import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  CalendarIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { quizAPI } from '../utils/api';
import toast from 'react-hot-toast';

const QuizHistory = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quizId) {
      loadQuizHistory();
    }
  }, [quizId]);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      
      // Load quiz details
      const quizResponse = await quizAPI.getQuizById(quizId);
      if (quizResponse.success) {
        setQuiz(quizResponse.data);
      }

      // Load quiz attempts - we need to create this endpoint
      const attemptsResponse = await quizAPI.getQuizAttempts(quizId);
      if (attemptsResponse.success) {
        setAttempts(attemptsResponse.data || []);
        // Select the latest attempt by default
        if (attemptsResponse.data && attemptsResponse.data.length > 0) {
          setSelectedAttempt(attemptsResponse.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
      setError('Failed to load quiz history');
      toast.error('Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (passed) => {
    return passed ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Quiz history not found'}
          </h2>
          <button
            onClick={() => navigate('/quizzes/past')}
            className="btn-primary"
          >
            Back to Past Quizzes
          </button>
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
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Quiz History</h1>
            <h2 className="text-xl text-gray-700 mb-1">{quiz.title}</h2>
            <p className="text-gray-600">
              {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/quizzes/past"
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Past Quizzes</span>
            </Link>
            <Link
              to={`/quiz/take/${quizId}`}
              className="btn-primary flex items-center space-x-2"
            >
              <TrophyIcon className="h-5 w-5" />
              <span>Retake Quiz</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {attempts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 card-interactive"
        >
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Attempts Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't taken this quiz yet. Start your first attempt now!
          </p>
          <Link to={`/quiz/take/${quizId}`} className="btn-primary">
            Take Quiz
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attempts List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Attempts</h3>
            <div className="space-y-3">
              {attempts.map((attempt, index) => (
                <motion.div
                  key={attempt._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAttempt(attempt)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAttempt?._id === attempt._id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Attempt #{attempt.attemptNumber}</span>
                    {getStatusIcon(attempt.passed)}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className={`font-medium ${getScoreColor(attempt.score)}`}>
                        {attempt.score}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{attempt.timeSpent || 0}m</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(attempt.completedAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Overall Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Score:</span>
                  <span className={`font-medium ${getScoreColor(Math.max(...attempts.map(a => a.score)))}`}>
                    {Math.max(...attempts.map(a => a.score))}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">
                    {Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passed:</span>
                  <span className="font-medium">
                    {attempts.filter(a => a.passed).length}/{attempts.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attempt Details */}
          <div className="lg:col-span-2">
            {selectedAttempt ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedAttempt._id}
              >
                <div className="card-interactive">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Attempt #{selectedAttempt.attemptNumber} Details
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(selectedAttempt.score)}`}>
                      {selectedAttempt.score}% {selectedAttempt.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>

                  {/* Attempt Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedAttempt.score)}`}>
                        {selectedAttempt.score}%
                      </div>
                      <div className="text-gray-600 text-sm">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedAttempt.answers?.filter(a => a.isCorrect).length || 0}
                      </div>
                      <div className="text-gray-600 text-sm">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedAttempt.answers?.filter(a => !a.isCorrect).length || 0}
                      </div>
                      <div className="text-gray-600 text-sm">Incorrect</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedAttempt.timeSpent || 0}m
                      </div>
                      <div className="text-gray-600 text-sm">Time Taken</div>
                    </div>
                  </div>

                  {/* Question by Question Breakdown */}
                  {selectedAttempt.answers && selectedAttempt.answers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Question Breakdown
                      </h4>
                      <div className="space-y-4">
                        {selectedAttempt.answers.map((answer, index) => {
                          const question = quiz.questions[index];
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                answer.isCorrect
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-red-200 bg-red-50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Q{index + 1}</span>
                                  {answer.isCorrect ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-500" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {answer.points || 0} pts
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-700 mb-2">
                                <strong>Question:</strong> {question?.question || 'Question not found'}
                              </div>
                              
                              <div className="text-sm">
                                <div className="mb-1">
                                  <strong className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                                    Your Answer:
                                  </strong> {answer.userAnswer}
                                </div>
                                
                                {!answer.isCorrect && question && (
                                  <div className="text-green-700">
                                    <strong>Correct Answer:</strong> {
                                      question.options?.find(opt => opt.isCorrect)?.text || 
                                      question.correctAnswer || 
                                      'Not available'
                                    }
                                  </div>
                                )}
                                
                                {question?.explanation && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800 text-xs">
                                    <LightBulbIcon className="h-4 w-4 inline mr-1" />
                                    <strong>Explanation:</strong> {question.explanation}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 card-interactive">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an attempt to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
