import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ArrowLeftIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { quizAPI, communityAPI } from '../utils/api';
import Chatbot from '../components/Chatbot';

const PastQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchQuizzes = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      
      // Fetch both regular quizzes and community quiz attempts
      const [regularQuizzes, communityQuizzes] = await Promise.all([
        quizAPI.getAllQuizzes(page, 10, status),
        communityAPI.getUserCommunityQuizAttempts(page, 10)
      ]);
      
      let allQuizzes = [];
      let totalCount = 0;
      
      // Process regular quizzes
      if (regularQuizzes.success && regularQuizzes.data.quizzes) {
        const processedRegularQuizzes = regularQuizzes.data.quizzes.map(quiz => ({
          ...quiz,
          isCommunityQuiz: false,
          hasAttempts: quiz.attempts && quiz.attempts.length > 0,
          bestScore: quiz.attempts?.length > 0 ? Math.max(...quiz.attempts.map(a => a.score || 0)) : null,
          latestScore: quiz.attempts?.length > 0 ? quiz.attempts[quiz.attempts.length - 1]?.score || 0 : null,
          latestAttemptDate: quiz.attempts?.length > 0 ? quiz.attempts[quiz.attempts.length - 1]?.completedAt : null,
          totalAttempts: quiz.attempts?.length || 0,
          isPassed: quiz.attempts?.some(attempt => attempt.score >= 60) || false,
          questionCount: quiz.questions?.length || 0,
          category: quiz.category || 'general',
          difficulty: quiz.difficulty || 'medium'
        }));
        allQuizzes = [...allQuizzes, ...processedRegularQuizzes];
        totalCount += regularQuizzes.data.pagination?.total || 0;
      }
      
      // Process community quiz attempts
      if (communityQuizzes.success && communityQuizzes.data.attempts) {
        const processedCommunityQuizzes = communityQuizzes.data.attempts.map(attempt => ({
          _id: attempt.quizId,
          title: attempt.quizTitle || 'Community Quiz',
          isCommunityQuiz: true,
          hasAttempts: true,
          bestScore: attempt.score || 0,
          latestScore: attempt.score || 0,
          latestAttemptDate: attempt.completedAt,
          totalAttempts: 1, // Each community quiz attempt is a separate record
          isPassed: (attempt.score || 0) >= 60,
          questionCount: attempt.questionsCount || 0,
          category: 'community',
          difficulty: 'medium',
          contentId: null,
          isCustom: false,
          communityId: attempt.communityId,
          communityName: attempt.communityName
        }));
        allQuizzes = [...allQuizzes, ...processedCommunityQuizzes];
        totalCount += communityQuizzes.data.pagination?.total || 0;
      }
      
      // Sort by completion date (most recent first)
      allQuizzes.sort((a, b) => new Date(b.latestAttemptDate || b.createdAt) - new Date(a.latestAttemptDate || a.createdAt));
      
      setQuizzes(allQuizzes);
      setPagination({
        page: page,
        limit: 10,
        total: totalCount,
        pages: Math.ceil(totalCount / 10)
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load past quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not attempted';
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

  if (loading && quizzes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Past Quizzes</h1>
            <p className="text-gray-600">
              {quizzes.length > 0 
                ? `View your quiz history and performance across ${pagination.totalQuizzes} quiz${pagination.totalQuizzes !== 1 ? 'es' : ''}`
                : 'Your quiz history will appear here once you start taking quizzes'
              }
            </p>
          </div>
          <Link to="/" className="btn-secondary flex items-center space-x-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {quizzes.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 card-interactive"
        >
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Quizzes Yet</h3>
          <p className="text-gray-600 mb-6">
            Start by uploading some content or creating a custom quiz to see your quiz history here.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/upload" className="btn-primary">Upload Content</Link>
            <Link to="/custom-quiz" className="btn-secondary">Create Custom Quiz</Link>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Quizzes' },
                  { key: 'published', label: 'Active' },
                  { key: 'draft', label: 'Drafts' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleStatusFilterChange(filter.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      statusFilter === filter.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Quiz Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-interactive hover:shadow-lg transition-all duration-200 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {quiz.isCommunityQuiz 
                        ? `Community Quiz${quiz.communityName ? ` • ${quiz.communityName}` : ''}` 
                        : quiz.isCustom 
                        ? 'Custom Quiz' 
                        : quiz.contentId?.title || 'Unknown Content'
                      }
                    </p>
                  </div>
                  {quiz.isPassed ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : quiz.hasAttempts ? (
                    <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                  ) : (
                    <ClockIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Questions:</span>
                    <span className="font-medium">{quiz.questionCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium capitalize">{quiz.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className={`font-medium capitalize ${
                      quiz.difficulty === 'easy' ? 'text-green-600' :
                      quiz.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Attempts:</span>
                    <span className="font-medium">{quiz.totalAttempts}</span>
                  </div>
                </div>

                {quiz.hasAttempts && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Best Score</span>
                      <span className={`text-sm font-bold ${getScoreColor(quiz.bestScore)}`}>
                        {quiz.bestScore}%
                      </span>
                    </div>
                    {quiz.latestScore !== null && quiz.latestScore !== quiz.bestScore && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Latest Score</span>
                        <span className={`text-sm font-medium ${getScoreColor(quiz.latestScore)}`}>
                          {quiz.latestScore}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(quiz.latestAttemptDate)}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    to={quiz.isCommunityQuiz 
                      ? `/community/${quiz.communityId}/quiz/${quiz._id}` 
                      : `/quiz/take/${quiz._id}`
                    }
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    {quiz.hasAttempts ? 'Retake Quiz' : 'Take Quiz'}
                  </Link>
                  {quiz.hasAttempts && (
                    <Link
                      to={quiz.isCommunityQuiz 
                        ? `/community/${quiz.communityId}/quiz/${quiz._id}/results` 
                        : `/quiz/history/${quiz._id}`
                      }
                      className="flex-1 btn-secondary text-center text-sm py-2"
                    >
                      {quiz.isCommunityQuiz ? 'View Results' : 'View History'}
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                <span className="ml-2">
                  ({pagination.totalQuizzes} total quiz{pagination.totalQuizzes !== 1 ? 'es' : ''})
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
      
      {/* General Chatbot for past quizzes */}
      <Chatbot 
        context="general"
        isVisible={true}
      />
    </div>
  );
};

export default PastQuizzes;


