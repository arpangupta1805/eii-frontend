import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  ShareIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { communityAPI, contentAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CommunityContent = ({ communityId, community }) => {
  const [content, setContent] = useState([]);
  const [myContent, setMyContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentSummary, setContentSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    file: null
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'notes', label: 'Study Notes' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'reference', label: 'Reference Material' },
    { value: 'practice', label: 'Practice Questions' },
    { value: 'solution', label: 'Solutions' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchCommunityContent();
    fetchMyContent();
  }, [communityId, searchTerm, selectedCategory]);

  const fetchCommunityContent = async () => {
    try {
      const response = await communityAPI.getCommunityContent(
        communityId, 
        1, 
        20, 
        selectedCategory, 
        searchTerm
      );
      if (response.success) {
        setContent(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching community content:', error);
      toast.error('Failed to load community content');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyContent = async () => {
    try {
      const response = await contentAPI.getAllContent(1, 50);
      if (response.success) {
        setMyContent(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching my content:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.error('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('tags', uploadForm.tags);

      const response = await communityAPI.uploadCommunityContent(
        communityId, 
        formData,
        (progress) => setUploadProgress(progress)
      );

      if (response.success) {
        toast.success('Content uploaded successfully! AI summary is being generated in the background.');
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          category: 'general',
          tags: '',
          file: null
        });
        fetchCommunityContent();
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload content';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleShareContent = async (contentId) => {
    try {
      const response = await communityAPI.shareCommunityContent(
        communityId, 
        contentId, 
        selectedContent?.description || ''
      );
      if (response.success) {
        toast.success('Content shared to community!');
        setShowShareModal(false);
        setSelectedContent(null);
        fetchCommunityContent();
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      toast.error(error.message || 'Failed to share content');
    }
  };

  const generateContentSummary = async (content) => {
    setLoadingSummary(true);
    try {
      const response = await communityAPI.generateCommunityContentSummary(communityId, content._id);
      if (response.success) {
        setContentSummary(response.data);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate content summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'txt':
        return '📝';
      case 'docx':
        return '📘';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const ContentCard = ({ item, isShared = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg hover:shadow-2xl border border-gray-200/50 p-6 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <span className="text-2xl">{getFileIcon(item.fileType)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-2 leading-relaxed">
              {item.description || 'No description provided'}
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                {categories.find(c => c.value === item.category)?.label || 'General'}
              </div>
              {item.tags && (
                <div className="flex items-center space-x-1">
                  {(typeof item.tags === 'string' ? item.tags.split(',') : Array.isArray(item.tags) ? item.tags : []).slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {typeof tag === 'string' ? tag.trim() : tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {isShared && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              Shared
            </div>
          )}
          <div className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-1" />
            {item.views || item.viewCount || 0} views
          </span>
          <span className="flex items-center">
            <HeartIcon className="h-4 w-4 mr-1" />
            {item.likes || item.likeCount || 0} likes
          </span>
        </div>
        <div className="text-xs">
          by {item.uploadedBy?.firstName || item.userId?.firstName} {item.uploadedBy?.lastName || item.userId?.lastName}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => {
            setSelectedContent(item);
            setShowContentModal(true);
            generateContentSummary(item);
          }}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          View Details
        </button>
        
        {!isShared && (
          <button
            onClick={() => {
              setSelectedContent(item);
              setShowShareModal(true);
            }}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </button>
        )}
        
        <a
          href={item.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3">
              <DocumentIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Library</h2>
              <p className="text-gray-600">Discover and share valuable study materials with your community</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Share Existing</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Upload New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for notes, assignments, solutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors font-medium"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-xl h-64 shadow-lg"></div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <FolderOpenIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No content found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {searchTerm || selectedCategory 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Be the first to share valuable content with the community!"
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            Upload Content
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <ContentCard key={item._id} item={item} isShared />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload New Content</h3>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="physics, chemistry, notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.txt,.docx"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, TXT, DOCX (max 10MB)
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadForm.title.trim() || !uploadForm.file}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Existing Content Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Share Your Content</h3>
                <p className="text-gray-600 mt-1">Select content from your library to share with the community</p>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {myContent.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You don't have any content to share yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myContent.map((item) => (
                      <div
                        key={item._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedContent?._id === item._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedContent(item)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{getFileIcon(item.fileType)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.category} • {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShareContent(selectedContent._id)}
                  disabled={!selectedContent}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share Content
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Viewing Modal */}
      <AnimatePresence>
        {showContentModal && selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedContent.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedContent.fileName} • {selectedContent.fileType.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedContent.description && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Description</h4>
                    <p className="text-blue-800 text-sm">{selectedContent.description}</p>
                  </div>
                )}

                {/* Loading State */}
                {loadingSummary && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Generating summary...</span>
                  </div>
                )}

                {/* Summarized Content */}
                {contentSummary && !loadingSummary && (
                  <div className="space-y-6">
                    {/* Main Summary */}
                    <div className="prose max-w-none">
                      <h4 className="font-medium text-gray-900 mb-3">Content Summary</h4>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {contentSummary.summary}
                      </div>
                    </div>

                    {/* Key Topics */}
                    {contentSummary.keyTopics && contentSummary.keyTopics.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {contentSummary.keyTopics.map((topic, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sections */}
                    {contentSummary.sections && contentSummary.sections.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Detailed Breakdown</h4>
                        {contentSummary.sections.map((section, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-2">{section.title}</h5>
                            <p className="text-gray-700 mb-3 leading-relaxed">{section.summary}</p>
                            {section.keyPoints && section.keyPoints.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {section.keyPoints.map((point, pointIndex) => (
                                  <li key={pointIndex}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-blue-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                      {contentSummary.difficulty && (
                        <div>
                          <span className="font-medium text-blue-900">Difficulty:</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {contentSummary.difficulty}
                          </span>
                        </div>
                      )}
                      {contentSummary.estimatedReadTime && (
                        <div>
                          <span className="font-medium text-blue-900">Read Time:</span>
                          <span className="ml-2 text-blue-800">{contentSummary.estimatedReadTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error State */}
                {!loadingSummary && !contentSummary && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Unable to generate summary for this content.</p>
                  </div>
                )}

                {/* Tags */}
                {selectedContent.tags && selectedContent.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Info */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedContent.userId?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedContent.userId?.firstName} {selectedContent.userId?.lastName}
                      </p>
                      <p className="text-xs">
                        Uploaded {formatDate(selectedContent.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {selectedContent.viewCount || 0} views
                    </span>
                    <span className="flex items-center">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      {selectedContent.downloadCount || 0} downloads
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowContentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityContent;