import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  LightBulbIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { quizAPI, communityAPI } from '../utils/api';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

const QuizById = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a community quiz from navigation state
  const communityQuizData = location.state;
  const isCommunityQuiz = communityQuizData?.isCommunityQuiz;
  const communityId = communityQuizData?.communityId;
  
  // Quiz states
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeSpent, setTimeSpent] = useState({});
  const [startTime, setStartTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const intervalRef = useRef();

  const questions = quiz?.questions || [];

  // Helper function for navigation back
  const navigateBack = () => {
    if (isCommunityQuiz && communityId) {
      navigate(`/community/${communityId}`);
    } else if (communityQuizData?.returnPath) {
      navigate(communityQuizData.returnPath);
    } else {
      navigate('/quizzes/past');
    }
  };

  // Load quiz by ID
  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      console.log('Loading quiz with ID:', quizId, 'isCommunityQuiz:', isCommunityQuiz);
      
      let response;
      
      // If we have community quiz data from navigation state, use it
      if (isCommunityQuiz && communityQuizData?.quiz) {
        console.log('Using community quiz data from state:', communityQuizData.quiz);
        setQuiz(communityQuizData.quiz);
        // Initialize timer
        setTimer(communityQuizData.quiz.settings?.timeLimit * 60 || 1800); // default 30 minutes
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from API
      if (isCommunityQuiz && communityId) {
        response = await communityAPI.getCommunityQuizById(communityId, quizId);
        if (response.success) {
          setQuiz(response.data.quiz);
        }
      } else {
        response = await quizAPI.getQuizById(quizId);
        if (response.success) {
          setQuiz(response.data);
        }
      }
      
      if (response?.success) {
        // Initialize timer
        setTimer((response.data.quiz || response.data).settings?.timeLimit * 60 || 1800); // default 30 minutes
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
        console.log('Quiz loaded successfully:', response.data);
      } else {
        throw new Error(response?.message || 'Failed to load quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
      if (isCommunityQuiz && communityId) {
        navigate(`/community/${communityId}`);
      } else {
      if (isCommunityQuiz && communityId) {
        navigate(`/community/${communityId}`);
      } else {
        navigate('/quizzes/past');
      }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start quiz attempt
  const startQuizAttempt = async () => {
    try {
      let response;
      
      if (isCommunityQuiz && communityId) {
        response = await communityAPI.startCommunityQuizAttempt(communityId, quizId);
      } else {
        response = await quizAPI.startAttempt(quizId);
      }
      
      if (response.success) {
        setAttempt(response.data);
        toast.success('Quiz started!');
        startTimer();
      }
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      toast.error('Failed to start quiz');
    }
  };

  // Timer management
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.error('Time is up! Submitting your answers...');
    submitQuiz();
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answer) => {
    const currentTime = Date.now();
    const timeSpentOnQuestion = Math.floor((currentTime - questionStartTime) / 1000);
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));

    setTimeSpent(prev => ({
      ...prev,
      [questionIndex]: (prev[questionIndex] || 0) + timeSpentOnQuestion
    }));

    setQuestionStartTime(currentTime);
  };

  // Navigation
  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!attempt) {
      toast.error('No active quiz attempt found');
      return;
    }

    try {
      if (intervalRef.current) clearInterval(intervalRef.current);

      console.log('Submitting quiz with attempt:', attempt);
      console.log('Questions:', questions);

      // Format answers for submission
      const answers = questions.map((question, index) => {
        console.log(`Question ${index}:`, question);
        return {
          questionId: question._id || `q_${index}`, // Fallback if _id doesn't exist
          selectedAnswer: selectedAnswers[index] || '',
          timeSpent: timeSpent[index] || 0
        };
      });

      console.log('Formatted answers:', answers);
      console.log('Attempt ID:', attempt.attemptId || attempt._id);

      const attemptId = attempt.attemptId || attempt._id;
      if (!attemptId) {
        throw new Error('No attempt ID found');
      }

      const totalTimeSpent = Object.values(timeSpent).reduce((total, time) => total + time, 0);
      let response;

      if (isCommunityQuiz && communityId) {
        response = await communityAPI.submitCommunityQuizAttempt(communityId, quizId, attemptId, answers, totalTimeSpent);
      } else {
        // For regular quizzes, maintain backward compatibility
        const formattedAnswers = questions.map((question, index) => ({
          questionId: question._id || `q_${index}`,
          sectionTitle: question.sectionTitle,
          userAnswer: selectedAnswers[index] || '',
          timeSpent: timeSpent[index] || 0
        }));
        response = await quizAPI.submitAttempt(attemptId, formattedAnswers);
      }
      
      if (response.success) {
        setResults(response.data);
        setShowResults(true);
        toast.success('Quiz submitted successfully!');
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error details:', {
        attemptId: attempt?.attemptId || attempt?._id,
        questionsCount: questions.length,
        selectedAnswersCount: Object.keys(selectedAnswers).length
      });
      toast.error('Failed to submit quiz: ' + (error.message || 'Unknown error'));
    }
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    return (answeredQuestions / questions.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
          <button
            onClick={navigateBack}
            className="btn-primary"
          >
            {isCommunityQuiz ? 'Back to Community' : 'Back to Past Quizzes'}
          </button>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {results.score >= (quiz.settings?.passingScore || 70) && <Confetti />}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-interactive text-center p-10"
        >
          <div className="mb-8">
            {results.score >= (quiz.settings?.passingScore || 70) ? (
              <TrophyIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            ) : (
              <ChartBarIcon className="h-20 w-20 text-blue-500 mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600 mb-6">{quiz.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {results.score}%
              </div>
              <div className="text-gray-600">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {results.correctAnswers || 0}/{questions.length}
              </div>
              <div className="text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.floor((Date.now() - startTime) / 60000)}m
              </div>
              <div className="text-gray-600">Time Taken</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={navigateBack}
              className="btn-secondary"
            >
              {isCommunityQuiz ? 'Back to Community' : 'Back to Past Quizzes'}
            </button>
            {!isCommunityQuiz ? (
              <button
                onClick={() => navigate(`/quiz/history/${quizId}`)}
                className="btn-primary"
              >
                View Detailed Results
              </button>
            ) : (
              <button
                onClick={() => navigate(`/community/${communityId}/quiz/${quizId}/leaderboard`)}
                className="btn-primary"
              >
                View Leaderboard
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-interactive text-center p-5"
        >
          <h1 className="text-3xl font-bold gradient-text mb-4">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <ClockIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
              <div className="font-semibold">Time Limit</div>
              <div className="text-gray-600">{quiz.settings?.timeLimit || 30} minutes</div>
            </div>
            <div className="text-center">
              <FireIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="font-semibold">Questions</div>
              <div className="text-gray-600">{questions.length} questions</div>
            </div>
            <div className="text-center">
              <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold">Passing Score</div>
              <div className="text-gray-600">{quiz.settings?.passingScore || 70}%</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={navigateBack}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={startQuizAttempt}
              className="btn-primary"
            >
              Start Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = getProgressPercentage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{quiz.title}</h1>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-gray-500" />
            <span className={`font-mono ${timer < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timer)}
            </span>
          </div>
          
          <div className="w-16 h-16">
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              styles={buildStyles({
                textSize: '20px',
                pathColor: progress === 100 ? '#10B981' : '#6366F1',
                textColor: '#374151',
                trailColor: '#E5E7EB'
              })}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-indigo-600 text-white'
                  : selectedAnswers[index]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card-interactive mb-6 p-5"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQ.question}
            </h2>
            
            {/* Multiple Choice Questions - handles both regular quizzes (with type) and community quizzes (with options) */}
            {(currentQ.type === 'multiple-choice' || (currentQ.options && Array.isArray(currentQ.options) && currentQ.options.length > 0)) && (
              <div className="space-y-3">
                {currentQ.options.map((option, optionIndex) => {
                  // Handle both string options (community quizzes) and object options (regular quizzes)
                  const optionText = typeof option === 'string' ? option : option.text;
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(currentQuestion, isCommunityQuiz ? optionIndex : optionText)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                        (isCommunityQuiz 
                          ? selectedAnswers[currentQuestion] === optionIndex
                          : selectedAnswers[currentQuestion] === optionText)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          (isCommunityQuiz 
                            ? selectedAnswers[currentQuestion] === optionIndex
                            : selectedAnswers[currentQuestion] === optionText)
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {(isCommunityQuiz 
                            ? selectedAnswers[currentQuestion] === optionIndex
                            : selectedAnswers[currentQuestion] === optionText) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True/False Questions */}
            {currentQ.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(currentQuestion, option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      selectedAnswers[currentQuestion] === option
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedAnswers[currentQuestion] === option
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion] === option && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Short Answer Questions */}
            {currentQ.type === 'short-answer' && (
              <div>
                <textarea
                  value={selectedAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  rows="4"
                />
              </div>
            )}

            {/* Essay Questions */}
            {currentQ.type === 'essay' && (
              <div>
                <textarea
                  value={selectedAnswers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                  placeholder="Write your essay answer here..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  rows="8"
                />
              </div>
            )}

            {/* Fallback for unknown question types - but exclude community quiz questions that have options */}
            {currentQ.type && !['multiple-choice', 'true-false', 'short-answer', 'essay'].includes(currentQ.type) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Unsupported question type: {currentQ.type}
                </p>
                {currentQ.options && currentQ.options.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {currentQ.options.map((option, optionIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text;
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(currentQuestion, optionText)}
                          className={`w-full p-3 text-left rounded border transition-colors ${
                            selectedAnswers[currentQuestion] === optionText
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {optionText}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-3">
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              className="btn-primary flex items-center space-x-2"
            >
              <TrophyIcon className="h-4 w-4" />
              <span>Submit Quiz</span>
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizById;
