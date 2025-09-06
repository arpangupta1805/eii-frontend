import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { contentAPI, quizAPI } from '../utils/api';
import { setTokenGetter } from '../utils/api';
import toast from 'react-hot-toast';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

const learningReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONTENTS':
      return { ...state, contents: action.payload };
    case 'ADD_CONTENT':
      return { ...state, contents: [...state.contents, action.payload] };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        contents: state.contents.map(content =>
          content.id === action.payload.contentId
            ? { ...content, progress: action.payload.progress }
            : content
        )
      };
    case 'SET_CURRENT_QUIZ':
      return { ...state, currentQuiz: action.payload };
    case 'UPDATE_QUIZ_SCORE':
      return { ...state, quizScore: action.payload };
    case 'SET_PERFORMANCE_LEVEL':
      return { ...state, performanceLevel: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  contents: [],
  currentQuiz: null,
  quizScore: null,
  performanceLevel: null,
  loading: false
};

export const LearningProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  
  // Initialize API token getter
  useEffect(() => {
    if (isSignedIn && getToken) {
      setTokenGetter(getToken);
    }
  }, [isSignedIn, getToken]);

  const [state, dispatch] = useReducer(learningReducer, initialState);

  // Load user content when authenticated
  useEffect(() => {
    if (isSignedIn) {
      loadUserContent();
    }
  }, [isSignedIn]);

  // Periodically refresh content that's being processed
  useEffect(() => {
    let interval;
    
    if (isSignedIn && state.contents.some(content => content.processingStatus === 'pending' || content.processingStatus === 'processing')) {
      console.log('Setting up polling for processing content...');
      interval = setInterval(() => {
        console.log('Polling for content updates...');
        loadUserContent();
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSignedIn, state.contents]);

  const loadUserContent = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await contentAPI.getAllContent();
      
      console.log('=== LOADING USER CONTENT ===');
      console.log('Response:', response);
      console.log('Response.data:', response.data);
      console.log('============================');
      
      // Handle the response structure correctly
      const contentList = response.data?.content || response.content || response.data || [];
      
      // Transform backend content to match frontend format
      const transformedContent = contentList.map(content => ({
        id: content.id,
        title: content.title,
        progress: content.progress || 0,
        uploadedAt: content.createdAt,
        summary: content.aiSummary?.summary || (content.processingStatus === 'completed' ? 'No summary available' : 'Processing...'),
        difficulty: content.aiSummary?.difficulty || 'medium',
        estimatedTime: content.metadata?.readingTime ? `${content.metadata.readingTime} minutes` : 'Unknown',
        thumbnail: getContentThumbnail(content.category),
        status: getContentStatus(content.progress, content.processingStatus),
        category: content.category,
        originalText: content.originalText,
        aiSummary: content.aiSummary,
        metadata: content.metadata,
        processingStatus: content.processingStatus,
        quizHistory: content.quizHistory || {
          hasQuiz: false,
          totalAttempts: 0,
          bestScore: 0,
          isPassed: false,
          attempts: []
        }
      }));

      dispatch({ type: 'SET_CONTENTS', payload: transformedContent });
    } catch (error) {
      console.error('Failed to load user content:', error);
      toast.error('Failed to load your content');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addContent = async (contentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('=== UPLOADING CONTENT TO BACKEND ===');
      console.log('Content data being sent:', contentData);
      console.log('====================================');
      
      const response = await contentAPI.uploadText(contentData);
      
      console.log('=== BACKEND RESPONSE ===');
      console.log('Response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.content:', response.data?.content);
      console.log('========================');
      
      // Handle the response structure correctly
      const content = response.data?.content || response.content || response;
      
      const transformedContent = {
        id: content.id,
        title: content.title,
        progress: 0,
        uploadedAt: content.createdAt,
        summary: content.aiSummary?.summary || 'Processing...',
        difficulty: content.aiSummary?.difficulty || 'medium',
        estimatedTime: content.metadata?.readingTime ? `${content.metadata.readingTime} minutes` : 'Unknown',
        thumbnail: getContentThumbnail(content.category),
        status: 'new',
        category: content.category,
        originalText: content.originalText,
        aiSummary: content.aiSummary,
        metadata: content.metadata
      };

      dispatch({ type: 'ADD_CONTENT', payload: transformedContent });
      toast.success('Content uploaded successfully!');
      return transformedContent;
    } catch (error) {
      console.error('Failed to upload content:', error);
      console.error('Full error object:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error(`Failed to upload content: ${error.message || 'Unknown error'}`);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProgress = async (contentId, progress) => {
    try {
      await contentAPI.updateProgress(contentId, progress);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { contentId, progress } });
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const deleteContent = async (contentId) => {
    try {
      await contentAPI.deleteContent(contentId);
      dispatch({ 
        type: 'SET_CONTENTS', 
        payload: state.contents.filter(c => c.id !== contentId) 
      });
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
      throw error;
    }
  };

  const generateQuiz = async (contentId, difficulty = 'medium', questionsCount = 5) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await quizAPI.generateQuiz(contentId, difficulty, questionsCount);
      
      const quiz = {
        id: response.quiz.id,
        contentId,
        title: response.quiz.title,
        questions: response.quiz.questions,
        difficulty,
        metadata: response.quiz.metadata
      };

      dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
      return quiz;
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error('Failed to generate quiz');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setCurrentQuiz = (quiz) => {
    dispatch({ type: 'SET_CURRENT_QUIZ', payload: quiz });
  };

  const updateQuizScore = (score) => {
    dispatch({ type: 'UPDATE_QUIZ_SCORE', payload: score });
  };

  const setPerformanceLevel = (level) => {
    dispatch({ type: 'SET_PERFORMANCE_LEVEL', payload: level });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const addVirtualContent = (virtualContent) => {
    dispatch({ type: 'ADD_CONTENT', payload: virtualContent });
  };

  // Helper functions
  const getContentThumbnail = (category) => {
    const thumbnails = {
      'technology': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      'science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      'business': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      'education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
      'general': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
    };
    return thumbnails[category] || thumbnails.general;
  };

  const getContentStatus = (progress, processingStatus) => {
    // If content is still being processed by AI, show processing status
    if (processingStatus === 'pending' || processingStatus === 'processing') {
      return 'processing';
    }
    if (processingStatus === 'failed') {
      return 'error';
    }
    
    // Default status based on progress
    if (progress === 0) return 'new';
    if (progress === 100) return 'completed';
    return 'in-progress';
  };

  const value = {
    ...state,
    addContent,
    addVirtualContent,
    updateProgress,
    deleteContent,
    generateQuiz,
    setCurrentQuiz,
    updateQuizScore,
    setPerformanceLevel,
    setLoading,
    loadUserContent
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};
