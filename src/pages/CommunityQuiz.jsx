import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CommunityQuiz = () => {
  const { communityId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [communityId, quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await communityAPI.getCommunityQuizById(communityId, quizId);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate(`/community/${communityId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    // Navigate to the existing quiz page with the quiz data
    navigate(`/quiz/${quizId}`, { 
      state: { 
        quiz,
        communityId,
        returnPath: `/community/${communityId}/quiz/${quizId}`
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate(`/community/${communityId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/community/${communityId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Community
        </button>

        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 text-lg">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {quiz.type === 'private' && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Private
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {quiz.difficulty}
              </span>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
              </span>
            </div>
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {quiz.participantCount || 0} participants
              </span>
            </div>
            <div className="flex items-center">
              <TrophyIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {quiz.questionCount || quiz.questions?.length || 0} questions
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleStartQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Quiz
            </button>
            <button
              onClick={() => navigate(`/community/${communityId}/quiz/${quizId}/leaderboard`)}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center"
            >
              <TrophyIcon className="h-5 w-5 mr-2" />
              Leaderboard
            </button>
            <button
              onClick={() => navigate(`/community/${communityId}/quiz/${quizId}/discussion`)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Discussion
            </button>
          </div>
        </motion.div>

        {/* Quiz Instructions */}
        {quiz.instructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <div className="prose max-w-none text-gray-600">
              {quiz.instructions.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunityQuiz;