import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState(null);
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
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-3 mr-4">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Discover Communities</h2>
                <p className="text-gray-600 mt-1">Join new study groups and expand your network</p>
              </div>
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
                      <div className="absolute top-4 right-4">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-white text-xs font-semibold">{community.category}</span>
                        </div>
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
    </div>
  );
};

export default Community;
