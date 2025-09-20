import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  TrophyIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CommunityQuizLeaderboard = () => {
  const { communityId, quizId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchQuiz();
  }, [communityId, quizId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await communityAPI.getQuizLeaderboard(communityId, quizId);
      if (response.success) {
        setLeaderboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
      // Fallback to empty array if no data
      setLeaderboard([]);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await communityAPI.getCommunityQuizById(communityId, quizId);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    const badges = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return badges[rank] || `#${rank}`;
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          {quiz && (
            <p className="text-xl text-gray-600">{quiz.title}</p>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Top Performers
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
              <p className="text-gray-600">Be the first to take this quiz!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId || entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                        {getRankBadge(entry.rank)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {entry.username || `${entry.firstName} ${entry.lastName}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {entry.attempts} attempt{entry.attempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{entry.score}%</div>
                      <div className="text-sm text-gray-600">
                        in {formatTime(entry.timeTaken)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{leaderboard.length}</div>
            <div className="text-gray-600">Total Participants</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length) : 0}%
            </div>
            <div className="text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {leaderboard.length > 0 ? leaderboard[0].score : 0}%
            </div>
            <div className="text-gray-600">Highest Score</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityQuizLeaderboard;