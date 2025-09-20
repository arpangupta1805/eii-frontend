import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  FaceSmileIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const CommunityChat = ({ communityId, community }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (pageNum = 1, append = false) => {
    try {
      const response = await communityAPI.getCommunityMessages(communityId, pageNum, 50, 'general');
      if (response.success) {
        const newMessages = response.data.messages;
        if (append) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await communityAPI.sendCommunityMessage(communityId, messageContent, 'general');
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await communityAPI.reactToMessage(communityId, messageId, emoji);
      if (response.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, reactions: response.data }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const MessageItem = ({ message }) => {
    const isOwn = message.userId._id === user?.id;
    const [showReactions, setShowReactions] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg`}>
          {!isOwn && (
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {message.userId.firstName?.[0] || message.userId.username?.[0] || 'U'}
              </div>
            </div>
          )}
          
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${isOwn ? 'mr-3' : 'ml-3'}`}>
            {!isOwn && (
              <div className="text-sm font-medium text-gray-700 mb-2">
                {message.userId.firstName} {message.userId.lastName}
                <span className="text-gray-500 ml-2 font-normal">@{message.userId.username}</span>
              </div>
            )}
            
            <div
              className={`relative px-5 py-3 rounded-2xl shadow-lg ${
                isOwn 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'bg-white border border-gray-100 text-gray-900'
              } max-w-full`}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              <p className="text-sm break-words leading-relaxed">{message.content}</p>
              
              {/* Message reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(
                    message.reactions.reduce((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message._id, emoji)}
                      className="text-sm bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center space-x-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <span className="text-base">{emoji}</span>
                      <span className="text-gray-600 font-medium">{count}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Quick reactions on hover */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-12 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-xl flex space-x-2 z-10 backdrop-blur-sm`}
                  >
                    {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message._id, emoji)}
                        className="text-xl hover:scale-125 transition-all duration-200 p-1 rounded-lg hover:bg-gray-50"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className={`text-xs text-gray-500 mt-2 ${isOwn ? 'text-right' : 'text-left'}`}>
              {formatTime(message.createdAt)}
              {message.isEdited && <span className="ml-2 text-gray-400">(edited)</span>}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg h-[600px] flex flex-col border border-white/20">

      {/* Enhanced Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50/50 to-white/50"
        style={{ minHeight: 0 }}
      >
        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => fetchMessages(page + 1, true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Load previous messages
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation!</h4>
            <p className="text-gray-500">Be the first to share your thoughts with the community.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message._id} message={message} />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts with the community..."
              className="w-full px-6 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
              maxLength={2000}
              disabled={sending}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-medium">
              {newMessage.length}/2000
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-6 w-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityChat;