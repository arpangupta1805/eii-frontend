import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  CogIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { quizAPI } from '../utils/api';
import { useLearning } from '../contexts/LearningContext';
import toast from 'react-hot-toast';

const CustumQuiz = () => {
  const navigate = useNavigate();
  const { contents, addVirtualContent } = useLearning();
  
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    difficulty: 'medium'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateQuiz = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for your quiz');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate quiz from topic
      const response = await quizAPI.generateFromTopic({
        topic: formData.topic,
        description: formData.description,
        difficulty: formData.difficulty,
        numQuestions: 5
      });
      
      console.log('Quiz generation response:', response);
      
      // Check if the response has the expected structure
      if (response.success && response.data && response.data._id) {
        toast.success('Quiz generated successfully!');
        
        // Create virtual content for the custom quiz to use existing robust quiz UI
        const virtualContent = {
          id: response.data._id,
          title: `Custom Quiz: ${formData.topic}`,
          description: formData.description || `A ${formData.difficulty} level quiz on ${formData.topic}`,
          difficulty: formData.difficulty,
          isCustomQuiz: true,
          customQuizData: response.data,
          progress: 0,
          category: 'Custom Quiz',
          status: 'new',
          estimatedTime: '5 minutes',
          thumbnail: '🧠',
          aiSummary: {
            title: formData.topic,
            difficulty: formData.difficulty,
            questionsCount: response.data.questions?.length || 5,
            topics: [formData.topic],
            summary: `A ${formData.difficulty} level quiz on ${formData.topic}`
          }
        };

        // Add virtual content to the learning context temporarily
        if (addVirtualContent) {
          addVirtualContent(virtualContent);
        }
        
        console.log('Added virtual content for custom quiz:', virtualContent);
        
        // Navigate to the robust content-based quiz UI
        navigate(`/quiz/${response.data._id}`);
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6">
           
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Custom Quiz</h2>
          <p className="text-gray-600 mb-4">Our AI is analyzing your topic and creating personalized questions...</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Analyzing topic: {formData.topic}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <ClockIcon className="w-4 h-4 text-yellow-500" />
              <span>Creating {formData.difficulty} difficulty questions</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-primary-600 to-purple-600">
            <div className="flex items-center">
              <AcademicCapIcon className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Create Custom Quiz</h1>
                <p className="text-primary-100">Generate a personalized quiz on any topic using AI</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SparklesIcon className="w-4 h-4 inline mr-2" />
                  Quiz Topic *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="e.g., Torque, Integration, Electricity, Ionic Equilibrium..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Additional Details (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide additional context, specific areas to focus on, or learning objectives..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <CogIcon className="w-4 h-4 inline mr-2" />
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { 
                      level: 'easy', 
                      label: 'Easy', 
                      color: 'green'
                    },
                    { 
                      level: 'medium', 
                      label: 'Medium',
                      color: 'orange'
                    },
                    { 
                      level: 'hard', 
                      label: 'Hard',  
                      color: 'red'
                    }
                  ].map(({ level, label, emoji, description, color }) => (
                    <button
                      key={level}
                      onClick={() => handleInputChange('difficulty', level)}
                      className={`p-4 border-2 rounded-lg text-center transition-all transform hover:scale-105 ${
                        formData.difficulty === level
                          ? `border-${color}-500 bg-${color}-50 text-${color}-700 shadow-md`
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:shadow-sm'
                      }`}
                    >
                      <div className={`text-lg font-semibold mb-1 ${
                        level === 'easy' ? 'text-green-600' :
                        level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {emoji}
                      </div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-gray-500 mt-1">{description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateQuiz}
                disabled={!formData.topic.trim() || isGenerating}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  !formData.topic.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                <LightBulbIcon className="w-5 h-5 inline mr-2" />
                Generate Quiz
              </button>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustumQuiz;
