import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { communityAPI, contentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CommunityQuizzes = ({ communityId, community }) => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [communityContent, setCommunityContent] = useState([]);
  const [myContent, setMyContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createQuizType, setCreateQuizType] = useState('content'); // 'content' or 'custom'
  const [accessCode, setAccessCode] = useState('');

  // Create quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    difficulty: 'intermediate',
    questionCount: 10,
    timeLimit: 30,
    type: 'public',
    customTopic: '',
    selectedContentId: ''
  });

  useEffect(() => {
    fetchQuizzes();
    fetchContent();
  }, [communityId, activeTab]);

  const fetchQuizzes = async () => {
    try {
      const response = await communityAPI.getCommunityQuizzes(
        communityId, 
        1, 
        20, 
        activeTab
      );
      if (response.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      // Fetch community content
      const communityResponse = await communityAPI.getCommunityContent(communityId, 1, 50);
      if (communityResponse.success) {
        setCommunityContent(communityResponse.data.content);
      }

      // Fetch user's personal content
      const myContentResponse = await contentAPI.getAllContent(1, 50);
      if (myContentResponse.success) {
        setMyContent(myContentResponse.data.content);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      toast.error('Please provide a quiz title');
      return;
    }

    if (createQuizType === 'content' && !quizForm.selectedContentId) {
      toast.error('Please select content for the quiz');
      return;
    }

    if (createQuizType === 'custom' && !quizForm.customTopic.trim()) {
      toast.error('Please provide a topic for the custom quiz');
      return;
    }

    setCreating(true);

    try {
      let response;
      if (createQuizType === 'content') {
        response = await communityAPI.createQuizFromContent(
          communityId,
          quizForm.selectedContentId,
          {
            title: quizForm.title,
            description: quizForm.description,
            difficulty: quizForm.difficulty,
            questionCount: quizForm.questionCount,
            timeLimit: quizForm.timeLimit,
            type: quizForm.type
          }
        );
      } else {
        response = await communityAPI.createCustomQuiz(
          communityId,
          {
            title: quizForm.title,
            description: quizForm.description,
            customTopic: quizForm.customTopic,
            difficulty: quizForm.difficulty,
            questionCount: quizForm.questionCount,
            timeLimit: quizForm.timeLimit,
            type: quizForm.type
          }
        );
      }

      if (response.success) {
        // Show different messages based on quiz type
        if (quizForm.type === 'private') {
          const accessCode = response.data?.accessCode;
          if (accessCode) {
            toast.success(
              `Private quiz created! Access code: ${accessCode}`, 
              { duration: 6000 }
            );
            // Copy access code to clipboard
            if (navigator.clipboard) {
              navigator.clipboard.writeText(accessCode);
              toast.success('Access code copied to clipboard!', { duration: 3000 });
            }
          } else {
            toast.success('Private quiz created successfully!');
          }
        } else {
          toast.success('Quiz created successfully!');
        }
        
        setShowCreateModal(false);
        setQuizForm({
          title: '',
          description: '',
          difficulty: 'intermediate',
          questionCount: 10,
          timeLimit: 30,
          type: 'public',
          customTopic: '',
          selectedContentId: ''
        });
        
        // Refresh quizzes - switch to appropriate tab if needed
        if (quizForm.type === 'private' && activeTab !== 'private') {
          setActiveTab('private');
        }
        fetchQuizzes();
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create quiz';
      toast.error(`Quiz creation failed: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinPrivateQuiz = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    try {
      const response = await communityAPI.joinPrivateQuiz(accessCode.trim());
      if (response.success) {
        toast.success('Successfully joined private quiz!');
        setShowJoinModal(false);
        setAccessCode('');
        if (activeTab === 'private') {
          fetchQuizzes();
        } else {
          setActiveTab('private');
        }
      }
    } catch (error) {
      console.error('Error joining private quiz:', error);
      toast.error(error.message || 'Failed to join quiz');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'medium':
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const QuizCard = ({ quiz }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-blue-100 rounded-lg p-2">
            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              {quiz.title}
              {quiz.type === 'private' && (
                <LockClosedIcon className="h-4 w-4 text-gray-500 ml-2" />
              )}
            </h3>
            {quiz.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {quiz.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {quiz.timeLimit} mins
              </span>
              <span>{quiz.questionCount} questions</span>
              <span>Created {formatDate(quiz.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          {quiz.type === 'private' && quiz.accessCode && (
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(quiz.accessCode);
                  toast.success('Access code copied!', { duration: 2000 });
                }
              }}
              className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              title="Click to copy access code"
            >
              Code: {quiz.accessCode}
            </button>
          )}
        </div>
      </div>

      {/* Author and stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {quiz.userId?.firstName?.[0] || 'U'}
          </div>
          <span className="text-sm text-gray-600">
            {quiz.userId?.firstName} {quiz.userId?.lastName}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <UserGroupIcon className="h-3 w-3 mr-1" />
            {quiz.stats?.totalAttempts || 0} attempts
          </span>
          <span className="flex items-center">
            <TrophyIcon className="h-3 w-3 mr-1" />
            {quiz.stats?.averageScore || 0}% avg
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={async () => {
            try {
              // Fetch quiz data and navigate directly to quiz taking page
              const response = await communityAPI.getCommunityQuizById(communityId, quiz._id);
              if (response.success) {
                navigate(`/quiz/take/${quiz._id}`, { 
                  state: { 
                    quiz: response.data.quiz,
                    communityId,
                    isCommunityQuiz: true,
                    returnPath: `/community/${communityId}`
                  }
                });
              }
            } catch (error) {
              console.error('Error starting quiz:', error);
              toast.error('Failed to start quiz');
            }
          }}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          Take Quiz
        </button>
        <button
          onClick={() => navigate(`/community/${communityId}/quiz/${quiz._id}/leaderboard`)}
          className="bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          <TrophyIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate(`/community/${communityId}/quiz/${quiz._id}/discussion`)}
          className="bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-3">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Arena</h2>
              <p className="text-gray-600">Challenge yourself and compete with the community</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
            >
              <KeyIcon className="h-5 w-5" />
              <span>Join Private</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
        <nav className="flex space-x-1">
          {[
            { id: 'public', name: 'Public Quizzes', icon: UserGroupIcon, description: 'Open to everyone' },
            { id: 'private', name: 'Private Quizzes', icon: LockClosedIcon, description: 'Access code required' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } relative flex-1 py-4 px-6 rounded-xl font-semibold text-sm flex flex-col items-center space-y-1 transition-all duration-300`}
              >
                <Icon className={`h-6 w-6 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
                <span>{tab.name}</span>
                <span className={`text-xs ${activeTab === tab.id ? 'text-purple-100' : 'text-gray-500'} hidden sm:block`}>
                  {tab.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Quiz Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-xl h-64 shadow-lg"></div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <AcademicCapIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No {activeTab} quizzes available
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {activeTab === 'public' 
              ? 'Be the first to create an engaging quiz for the community to enjoy!' 
              : 'Join private quizzes using access codes or create your own exclusive challenges.'}
          </p>
          <div className="flex justify-center space-x-3">
            {activeTab === 'private' && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                Join with Code
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              Create Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      )}

      {/* Enhanced Create Quiz Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 rounded-xl p-3">
                      <AcademicCapIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Create New Quiz</h3>
                      <p className="text-purple-100">Design an engaging quiz for your community</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Content with Scroll */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <form onSubmit={handleCreateQuiz} className="p-8 space-y-8">
                  {/* Enhanced Quiz Type Selection */}
                  <div>
                    <label className="block text-lg font-bold text-gray-800 mb-6">
                      Choose Quiz Source
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        type="button"
                        onClick={() => setCreateQuizType('content')}
                        className={`p-8 rounded-2xl border-3 transition-all duration-300 ${
                          createQuizType === 'content'
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl scale-105 ring-4 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${
                            createQuizType === 'content' 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <DocumentIcon className="h-10 w-10" />
                          </div>
                          <div className="font-bold text-xl mb-3">From Content</div>
                          <div className="text-sm text-gray-600 leading-relaxed">Generate questions from shared study materials and documents</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateQuizType('custom')}
                        className={`p-8 rounded-2xl border-3 transition-all duration-300 ${
                          createQuizType === 'custom'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl scale-105 ring-4 ring-purple-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${
                            createQuizType === 'custom' 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <AcademicCapIcon className="h-10 w-10" />
                          </div>
                          <div className="font-bold text-xl mb-3">Custom Topic</div>
                          <div className="text-sm text-gray-600 leading-relaxed">Create questions on any subject you choose with AI assistance</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Content Selection */}
                  {createQuizType === 'content' && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                      <label className="block text-lg font-bold text-gray-800 mb-4">
                        📚 Select Content Source
                      </label>
                      <select
                        value={quizForm.selectedContentId}
                        onChange={(e) => setQuizForm({ ...quizForm, selectedContentId: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-white shadow-sm text-lg"
                        required
                      >
                        <option value="">Choose content to generate quiz from...</option>
                        <optgroup label="📚 Community Content">
                          {communityContent.map((content) => (
                            <option key={content._id} value={content._id}>
                              {content.title} (by {content.userId?.firstName})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📖 My Content">
                          {myContent.map((content) => (
                            <option key={content._id} value={content._id}>
                              {content.title} (My Content)
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <p className="text-sm text-gray-600 mt-3">AI will analyze the selected content and generate relevant questions</p>
                    </div>
                  )}

                  {/* Enhanced Custom Topic */}
                  {createQuizType === 'custom' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                      <label className="block text-lg font-bold text-gray-800 mb-4">
                        🎯 Quiz Topic
                      </label>
                      <input
                        type="text"
                        value={quizForm.customTopic}
                        onChange={(e) => setQuizForm({ ...quizForm, customTopic: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white shadow-sm text-lg"
                        placeholder="e.g., Physics - Newton's Laws, Organic Chemistry Reactions"
                        required
                      />
                      <p className="text-sm text-gray-600 mt-3">Specify the subject and topic for AI-generated questions</p>
                    </div>
                  )}

                  {/* Enhanced Basic Quiz Info */}
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-6">📝 Quiz Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Quiz Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={quizForm.title}
                          onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                          placeholder="Enter an engaging quiz title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Visibility
                        </label>
                        <select
                          value={quizForm.type}
                          onChange={(e) => setQuizForm({ ...quizForm, type: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        >
                          <option value="public">🌍 Public (Anyone can join)</option>
                          <option value="private">🔐 Private (Access code required)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Description
                      </label>
                      <textarea
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm resize-none"
                        placeholder="Describe what this quiz covers and any special instructions"
                      />
                    </div>
                  </div>

                  {/* Enhanced Quiz Settings */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                      ⚙️ Quiz Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Difficulty Level
                        </label>
                        <select
                          value={quizForm.difficulty}
                          onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        >
                          <option value="beginner">🟢 Beginner</option>
                          <option value="intermediate">🟡 Intermediate</option>
                          <option value="advanced">🔴 Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Number of Questions
                        </label>
                        <select
                          value={quizForm.questionCount}
                          onChange={(e) => setQuizForm({ ...quizForm, questionCount: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        >
                          <option value={5}>5 Questions</option>
                          <option value={10}>10 Questions</option>
                          <option value={15}>15 Questions</option>
                          <option value={20}>20 Questions</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Time Limit
                        </label>
                        <select
                          value={quizForm.timeLimit}
                          onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                        >
                          <option value={15}>⏱️ 15 minutes</option>
                          <option value={30}>⏱️ 30 minutes</option>
                          <option value={45}>⏱️ 45 minutes</option>
                          <option value={60}>⏱️ 60 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Fixed Action Buttons */}
              <div className="bg-white border-t border-gray-200 p-6 sticky bottom-0">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-lg"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="quiz-form"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('form').requestSubmit();
                    }}
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Creating Quiz...</span>
                      </div>
                    ) : (
                      <span>🚀 Create Quiz</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Join Private Quiz Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowJoinModal(false);
                setAccessCode('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <KeyIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Join Private Quiz</h3>
                    <p className="text-green-100">Enter the access code to participate</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleJoinPrivateQuiz} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Access Code
                  </label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-2xl tracking-widest bg-gray-50 hover:bg-white transition-colors"
                    placeholder="ABCD12"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Enter the 6-character code provided by the quiz creator
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setAccessCode('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!accessCode.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Join Quiz
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityQuizzes;