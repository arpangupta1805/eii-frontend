import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  DocumentIcon, 
  AcademicCapIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { communityAPI } from '../utils/api';
import toast from 'react-hot-toast';
import CommunityChat from '../components/community/CommunityChat';
import CommunityContent from '../components/community/CommunityContent';
import CommunityQuizzes from '../components/community/CommunityQuizzes';

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      // Get user's communities to check membership
      const myCommunitiesResponse = await communityAPI.getMyCommunities();
      if (myCommunitiesResponse.success) {
        const userCommunity = myCommunitiesResponse.data.find(c => c._id === communityId);
        if (userCommunity) {
          setCommunity(userCommunity);
          setMembership({
            role: userCommunity.memberRole,
            joinedAt: userCommunity.joinedAt,
            stats: userCommunity.stats
          });
        } else {
          toast.error('You are not a member of this community');
          navigate('/community');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community information');
      navigate('/community');
    } finally {
      setLoading(false);
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

  const tabs = [
    { 
      id: 'chat', 
      name: 'Community Chat', 
      icon: ChatBubbleLeftRightIcon,
      description: 'Join general discussions'
    },
    { 
      id: 'content', 
      name: 'Content Library', 
      icon: DocumentIcon,
      description: 'Browse and share study materials'
    },
    { 
      id: 'quizzes', 
      name: 'Quiz Arena', 
      icon: AcademicCapIcon,
      description: 'Create and participate in quizzes'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community not found</h2>
          <button
            onClick={() => navigate('/community')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${getCommunityColor(community.name)}`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/community')}
                className="group p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                <span className="text-5xl filter drop-shadow-lg">{getCommunityIcon(community.name)}</span>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {community.name} Community
                </h1>
                <p className="text-white/80 text-lg mb-2">{community.description}</p>
                <div className="flex items-center space-x-4 text-white/70">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">{community.memberCount} members</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="font-medium">Role: {membership?.role}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {new Date(membership?.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-white/70 text-sm">Joined</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  } relative flex-1 max-w-xs mx-1 py-4 px-6 rounded-xl font-semibold text-sm flex flex-col items-center space-y-1 transition-all duration-300 backdrop-blur-sm`}
                >
                  <Icon className={`h-6 w-6 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
                  <span>{tab.name}</span>
                  <span className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'} hidden sm:block`}>
                    {tab.description}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="">
        <AnimatePresence mode="max-w-7xl pt-4 sm:px-3 lg:px-4wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <CommunityChat communityId={communityId} community={community} />
            </motion.div>
          )}
          
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <CommunityContent communityId={communityId} community={community} />
            </motion.div>
          )}
          
          {activeTab === 'quizzes' && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            >
              <CommunityQuizzes communityId={communityId} community={community} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityDetail;