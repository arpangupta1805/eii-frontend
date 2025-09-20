import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CommunityQuizDiscussion = () => {
  const { communityId, quizId } = useParams();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDiscussions();
    fetchQuiz();
  }, [communityId, quizId]);

  const fetchDiscussions = async () => {
    try {
      const response = await communityAPI.getQuizDiscussion(communityId, quizId);
      if (response.success) {
        setDiscussions(response.data);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
      // Fallback to empty array if no data
      setDiscussions([]);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await communityAPI.sendQuizDiscussionMessage(communityId, quizId, newMessage.trim());
      if (response.success) {
        setDiscussions([...discussions, response.data]);
        setNewMessage('');
        toast.success('Message posted!');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error('Failed to post message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
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
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Quiz Discussion</h1>
          </div>
          {quiz && (
            <p className="text-xl text-gray-600">{quiz.title}</p>
          )}
        </motion.div>

        {/* Discussion Thread */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Discussion ({discussions.length})
            </h2>
          </div>

          {discussions.length === 0 ? (
            <div className="p-8 text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
              <p className="text-gray-600">Start the conversation by asking a question or sharing your thoughts!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {discussions.map((discussion, index) => (
                <motion.div
                  key={discussion._id || discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {discussion.username || 
                           `${discussion.userId?.firstName} ${discussion.userId?.lastName}` ||
                           'Anonymous'}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatTime(discussion.timestamp || discussion.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{discussion.message || discussion.content}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                          👍 {discussion.likes || 0}
                        </button>
                        <button className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* New Message Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Join the Discussion</h3>
          <div className="flex space-x-4">
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts, ask questions, or help others..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  )}
                  Post Message
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityQuizDiscussion;