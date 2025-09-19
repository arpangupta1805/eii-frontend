import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useLearning } from '../contexts/LearningContext';
import { quizAPI } from '../utils/api';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

const Quiz = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { contents, updateProgress } = useLearning();
  
  // Quiz states
  const [content, setContent] = useState(null);
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

  // Find content
  useEffect(() => {
    if (contentId && !content) {
      const foundContent = contents.find(c => c.id === contentId);
      if (foundContent) {
        setContent(foundContent);
        console.log('=== CONTENT FOUND ===');
        console.log('Content:', foundContent);
        console.log('Is Custom Quiz:', foundContent.isCustomQuiz);
        console.log('====================');
      } else if (contents.length > 0) {
        toast.error('Content not found');
        navigate('/');
        return;
      }
    } else {
      // No contentId provided
      if (!contentId) {
        toast.error('No content identifier provided');
        navigate('/');
        return;
      }
    }
  }, [contentId, contents, navigate, content]);

  // Load or generate quiz
  useEffect(() => {
    if (content && !quiz) {
      loadQuiz();
    }
  }, [content, quiz]);

  // Start timer when quiz starts
  useEffect(() => {
    if ((quiz && attempt && !showResults) && questions.length > 0) {
      startTimer();
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [quiz, attempt, showResults, questions.length]);

  // Track time when question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestion]) {
      const questionId = questions[currentQuestion]._id;
      
      // Save time spent on previous question
      if (questionStartTime && currentQuestion > 0) {
        const prevQuestionId = questions[currentQuestion - 1]._id;
        const timeSpentOnPrevious = Math.floor((Date.now() - questionStartTime) / 1000);
        
        setTimeSpent(prev => ({
          ...prev,
          [prevQuestionId]: {
            ...prev[prevQuestionId],
            duration: (prev[prevQuestionId]?.duration || 0) + timeSpentOnPrevious
          }
        }));
      }
      
      // Set start time for current question
      setQuestionStartTime(Date.now());
      
      // Initialize time tracking for current question if not exists
      if (!timeSpent[questionId]) {
        setTimeSpent(prev => ({
          ...prev,
          [questionId]: {
            startTime: Date.now(),
            duration: 0
          }
        }));
      }
    }
  }, [currentQuestion, questions.length]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Check if this is a custom quiz (content has isCustomQuiz flag)
      if (content && content.isCustomQuiz && content.customQuizData) {
        console.log('Loading custom quiz from virtual content:', content.customQuizData);
        
        // Use the pre-generated custom quiz data
        setQuiz(content.customQuizData);
        
        // Start attempt for the custom quiz
        const attemptResponse = await quizAPI.startAttempt(content.customQuizData._id);
        if (attemptResponse.success && attemptResponse.data) {
          // Create attempt object with correct structure
          setAttempt({
            _id: attemptResponse.data.attemptId,
            attemptId: attemptResponse.data.attemptId,
            ...attemptResponse.data
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Regular content-based quiz flow
      // First try to get existing quiz
      try {
        const existingQuiz = await quizAPI.getByContentId(contentId);
        if (existingQuiz.success && existingQuiz.data) {
          setQuiz(existingQuiz.data);
          
          // Start attempt
          const attemptResponse = await quizAPI.startAttempt(existingQuiz.data._id);
          if (attemptResponse.success && attemptResponse.data) {
            setAttempt({
              _id: attemptResponse.data.attemptId,
              attemptId: attemptResponse.data.attemptId,
              ...attemptResponse.data
            });
          }
          
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // Quiz doesn't exist, generate new one
        console.log('No existing quiz found, generating new one...');
      }

      // Generate new quiz
      const generateResponse = await quizAPI.generate(contentId, 3);
      
      if (generateResponse.success && generateResponse.data) {
        setQuiz(generateResponse.data);

        // Start attempt
        const attemptResponse = await quizAPI.startAttempt(generateResponse.data._id);
        if (attemptResponse.success && attemptResponse.data) {
          setAttempt({
            _id: attemptResponse.data.attemptId,
            attemptId: attemptResponse.data.attemptId,
            ...attemptResponse.data
          });
        }

        setIsLoading(false);
        
        toast.success('Quiz generated successfully!');
      } else {
        throw new Error('Failed to generate quiz');
      }
    } catch (error) {
      console.error('Failed to load/generate quiz:', error);
      toast.error(error.message || 'Failed to load quiz. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (quiz?.questions) {
      // For content-based quiz
      const questionId = quiz.questions[currentQuestion]._id;
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }

    // Track time spent on question
    const now = Date.now();
    const questionTime = timeSpent[currentQuestion];
    if (questionTime?.startTime) {
      setTimeSpent(prev => ({
        ...prev,
        [currentQuestion]: {
          ...questionTime,
          duration: now - questionTime.startTime
        }
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Check if all questions are answered
      const unansweredQuestions = quiz.questions.filter(question => 
        !selectedAnswers[question._id] || selectedAnswers[question._id].trim() === ''
      );

      if (unansweredQuestions.length > 0) {
        toast.error(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
        return;
      }

      // Prepare answers for submission
      const answers = quiz.questions.map(question => ({
        questionId: question._id,
        userAnswer: selectedAnswers[question._id] || '',
        timeSpent: timeSpent[question._id]?.duration || 0
      }));

      console.log('Submitting quiz with answers:', answers);
      console.log('Attempt ID:', attempt._id);

      const result = await quizAPI.submitAttempt(attempt._id, answers);
      
      console.log('Quiz submission result:', result);
      
      if (result.success && result.data) {
        setResults(result.data);
        setShowResults(true);

        // Update progress to 100% when quiz is completed (for both custom and content-based quizzes)
        if (contentId && content && !content.isCustomQuiz) {
          await updateProgress(contentId, 100);
        }
        
        toast.success('Quiz submitted successfully!');
      } else {
        throw new Error('Failed to submit quiz - invalid response');
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.message || 'Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        {results && results.score >= 70 && <Confetti />}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Results Header */}
            <div className={`px-8 py-6 ${results?.passed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {results?.passed ? (
                    <TrophyIcon className="w-8 h-8 text-white mr-3" />
                  ) : (
                    <XMarkIcon className="w-8 h-8 text-white mr-3" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {results?.passed ? 'Congratulations!' : 'Keep Trying!'}
                    </h1>
                    <p className="text-white/90">
                      {results?.passed ? 'You passed the quiz!' : 'You can retake this quiz'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{results?.score || 0}%</div>
                  <div className="text-white/90">Final Score</div>
                </div>
              </div>
            </div>

            {/* Results Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <CheckIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{results?.correctAnswers || 0}</div>
                  <div className="text-gray-600">Correct</div>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <XMarkIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{(quiz?.questions?.length || 0) - (results?.correctAnswers || 0)}</div>
                  <div className="text-gray-600">Incorrect</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-800">{formatTime(timer)}</div>
                  <div className="text-gray-600">Time Taken</div>
                </div>
              </div>

              {/* AI-Powered Performance Summary */}
              {results?.aiSummary && (
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div className="flex items-center">
                      <LightBulbIcon className="w-6 h-6 text-white mr-3" />
                      <h3 className="text-xl font-semibold text-white">AI Performance Summary</h3>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Overall Performance */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center mb-3">
                        <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                          results.aiSummary.overallPerformance === 'excellent' ? 'bg-green-500' :
                          results.aiSummary.overallPerformance === 'good' ? 'bg-blue-500' :
                          results.aiSummary.overallPerformance === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <h4 className="font-semibold text-gray-800 text-lg capitalize">
                          {results.aiSummary.overallPerformance} Performance
                        </h4>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-7">{results.aiSummary.summary}</p>
                    </div>

                    {/* Strengths */}
                    {results.aiSummary.strengths?.length > 0 && (
                      <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-4 flex items-center text-lg">
                          <CheckIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          Strengths
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.aiSummary.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-green-700 text-sm leading-relaxed">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Areas for Improvement - Full Width */}
                    {results.aiSummary.weaknesses?.length > 0 && (
                      <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-4 flex items-center text-lg">
                          <XMarkIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          Areas for Improvement
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.aiSummary.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start">
                              <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-amber-700 text-sm leading-relaxed">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations & Next Steps Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Recommendations */}
                      {results.aiSummary.recommendations?.length > 0 && (
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-4 flex items-center text-lg">
                            <LightBulbIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {results.aiSummary.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-purple-700 text-sm leading-relaxed">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      {results.aiSummary.nextSteps && (
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-4 flex items-center text-lg">
                            <ArrowRightIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            Next Steps
                          </h4>
                          <p className="text-blue-700 text-sm leading-relaxed">{results.aiSummary.nextSteps}</p>
                        </div>
                      )}
                    </div>

                    {/* Motivational Message */}
                    {results.aiSummary.motivationalMessage && (
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-3">
                            <FireIcon className="w-6 h-6 text-pink-600" />
                          </div>
                          <p className="text-pink-800 font-medium text-lg italic leading-relaxed">
                            "{results.aiSummary.motivationalMessage}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
                
                {results?.canRetake !== false && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    Retake Quiz
                  </button>
                )}
                
                {content?.isCustomQuiz && (
                  <button
                    onClick={() => navigate('/quiz')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    Create New Quiz
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">No quiz questions available</div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Quiz Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-primary-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {quiz.title || 'Quiz'}
                </h1>
                <p className="text-primary-100">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Quit Quiz Button */}
                <button
                  onClick={() => navigate(`/learning/${contentId}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Quit Quiz</span>
                </button>
                
                {/* Timer */}
                <div className="flex items-center text-white">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="font-mono">{formatTime(timer)}</span>
                </div>
                
                {/* Progress Circle */}
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={progress}
                    text={`${Math.round(progress)}%`}
                    styles={buildStyles({
                      textSize: '24px',
                      pathColor: '#fff',
                      textColor: '#fff',
                      trailColor: 'rgba(255, 255, 255, 0.3)'
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {currentQ.question}
                  </h2>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.type === 'true-false' ? (
                      // True/False Questions
                      ['True', 'False'].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                            selectedAnswers[currentQ._id] === option
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              selectedAnswers[currentQ._id] === option
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedAnswers[currentQ._id] === option && (
                                <CheckIcon className="w-2 h-2 text-white" />
                              )}
                            </div>
                            <span className="text-lg font-medium">{option}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      // Multiple Choice Questions
                      currentQ.options?.map((option, index) => {
                        const optionText = typeof option === 'string' ? option : option.text;
                        return (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(optionText)}
                            className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                              selectedAnswers[currentQ._id] === optionText
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                selectedAnswers[currentQ._id] === optionText
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAnswers[currentQ._id] === optionText && (
                                  <CheckIcon className="w-2 h-2 text-white" />
                                )}
                              </div>
                              <span>{optionText}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestion === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Previous
                  </button>

                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                    >
                      Next
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
