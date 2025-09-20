import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  FireIcon,
  XMarkIcon,
  PhotoIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'Study Group',
    isPrivate: false,
    image: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
    fetchMyCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await communityAPI.getCommunities();
      setCommunities(response.data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
      if (error.status === 429) {
        toast.error(`Rate limit exceeded. Please wait ${error.retryAfter || 60} seconds and try again.`);
      } else {
        toast.error('Failed to load communities');
      }
    }
  };

  const fetchMyCommunities = async () => {
    try {
      const response = await communityAPI.getMyCommunities();
      setMyCommunities(response.data || []);
    } catch (error) {
      console.error('Error fetching my communities:', error);
      if (error.status === 429) {
        toast.error(`Rate limit exceeded. Please wait ${error.retryAfter || 60} seconds and try again.`);
      } else if (error.message && error.message.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    setJoiningCommunity(communityId);
    try {
      await communityAPI.joinCommunity(communityId);
      toast.success('Successfully joined community!');
      await fetchCommunities();
      await fetchMyCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error(error.response?.data?.message || 'Failed to join community');
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Please provide a community name');
      return;
    }
    if (!createForm.description.trim()) {
      toast.error('Please provide a community description');
      return;
    }

    setCreating(true);
    try {
      const response = await communityAPI.createCommunity(createForm);
      if (response.success) {
        toast.success('Community created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          category: 'Study Group',
          isPrivate: false,
          image: null
        });
        // Refresh communities
        fetchCommunities();
        fetchMyCommunities();
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error(error.message || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  const getCommunityIcon = (name) => {
    switch (name) {
      case 'JEE':
        return '🔧';
      case 'NEET':
        return '🩺';
      default:
        return '📚';
    }
  };

  const getCommunityColor = (name) => {
    switch (name) {
      case 'JEE':
        return 'from-blue-500 to-blue-600';
      case 'NEET':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableCommunities = communities.filter(
    community => !myCommunities.find(my => my._id === community._id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
                <UserGroupIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
              Study Communities
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connect with passionate learners, share knowledge, and excel together in your JEE and NEET preparation journey.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

        {/* My Communities */}
        {myCommunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-3 mr-4">
                  <FireIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Communities</h2>
                  <p className="text-gray-600 mt-1">Continue your learning journey</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCommunities.map((community) => (
                  <motion.div
                    key={community._id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300"
                    onClick={() => navigate(`/community/${community._id}`)}
                  >
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 text-white">
                          <span className="text-2xl">{getCommunityIcon(community.name)}</span>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          Joined
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {community.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium">{community.memberCount || 0} members</span>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Communities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-3 mr-4">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Discover Communities</h2>
                  <p className="text-gray-600 mt-1">Join new study groups and expand your network</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Community</span>
              </motion.button>
            </div>
            
            {availableCommunities.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {myCommunities.length > 0 
                    ? "You're all caught up!" 
                    : "No communities available yet"
                  }
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {myCommunities.length > 0 
                    ? "You've joined all available communities. New ones will appear here when they're created." 
                    : "Check back later for new study communities to join."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCommunities.map((community) => (
                  <motion.div
                    key={community._id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300"
                  >
                    <div className={`h-32 bg-gradient-to-br ${getCommunityColor(community.name)} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl filter drop-shadow-lg">{getCommunityIcon(community.name)}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col space-y-2">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-white text-xs font-semibold">{community.category}</span>
                        </div>
                        {community.isCreatedByUser && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full">
                            <span className="text-white text-xs font-bold">👑 Created by You</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {community.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium">{community.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {[...Array(Math.min(3, community.memberCount || 0))].map((_, i) => (
                              <div key={i} className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full border-2 border-white"></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {community.isCreatedByUser ? (
                        <Link
                          to={`/community/${community._id}`}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <ArrowRightIcon className="h-5 w-5 mr-2" />
                          Manage Community
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(community._id)}
                          disabled={joiningCommunity === community._id}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {joiningCommunity === community._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <PlusIcon className="h-5 w-5 mr-2" />
                              Join Community
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Join Study Communities?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Unlock powerful features designed to enhance your learning experience and connect with like-minded students.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Live Discussions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Engage in real-time conversations with peers, share insights, and get instant help with your doubts.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <DocumentIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Resource Library</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access curated study materials, notes, and resources shared by top performers and mentors.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <AcademicCapIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Quiz Challenges</h3>
                <p className="text-gray-600 leading-relaxed">
                  Test your knowledge, compete with friends, and track your progress through engaging quiz competitions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Community Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create Community</h2>
                      <p className="text-gray-600">Start a new study group and invite others to join</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleCreateCommunity} className="p-8 space-y-6">
                {/* Community Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white shadow-sm text-lg"
                    placeholder="e.g., JEE Physics Masters, NEET Biology Squad"
                    maxLength={50}
                  />
                  <p className="text-sm text-gray-500 mt-2">{50 - createForm.name.length} characters remaining</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white shadow-sm resize-none"
                    placeholder="Describe what your community is about, what subjects you'll focus on, and what kind of members you're looking for..."
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-2">{500 - createForm.description.length} characters remaining</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white shadow-sm"
                  >
                    <option value="Study Group">📚 Study Group</option>
                    <option value="JEE Preparation">🎯 JEE Preparation</option>
                    <option value="NEET Preparation">🩺 NEET Preparation</option>
                    <option value="Subject Specific">📖 Subject Specific</option>
                    <option value="Doubt Solving">❓ Doubt Solving</option>
                    <option value="Mock Tests">📝 Mock Tests</option>
                    <option value="Motivation">💪 Motivation & Support</option>
                    <option value="Other">🔗 Other</option>
                  </select>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Privacy Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!createForm.isPrivate}
                        onChange={() => setCreateForm({ ...createForm, isPrivate: false })}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <GlobeAltIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Public Community</div>
                        <div className="text-sm text-gray-600">Anyone can discover and join this community</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors">
                      <input
                        type="radio"
                        name="privacy"
                        checked={createForm.isPrivate}
                        onChange={() => setCreateForm({ ...createForm, isPrivate: true })}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <LockClosedIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Private Community</div>
                        <div className="text-sm text-gray-600">Invite-only community (coming soon)</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Create Community</span>
                      </div>
                    )}
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

export default Community;
