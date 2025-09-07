import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  CpuChipIcon,
  ArrowPathIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { chatbotAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Chatbot = ({ 
  contentId = null, 
  quizId = null, 
  isVisible = true,
  context = 'general', // 'content', 'quiz', or 'general'
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: getWelcomeMessage(context),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 480, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  function getWelcomeMessage(context) {
    switch (context) {
      case 'content':
        return "Hi! I'm here to help you understand this content better. Ask me anything about the topic you're studying!";
      case 'quiz':
        return "Hi! I can help you understand your quiz performance and explain concepts from the questions. What would you like to know?";
      default:
        return "Hi! I'm your learning assistant. How can I help you today?";
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (context === 'content' && contentId) {
        response = await chatbotAPI.chatWithContent(contentId, inputMessage);
      } else if (context === 'quiz' && quizId) {
        response = await chatbotAPI.chatWithQuiz(quizId, inputMessage);
      } else {
        response = await chatbotAPI.chatGeneral(inputMessage);
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "I'm sorry, I couldn't process your message right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get response from chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: getWelcomeMessage(context),
        timestamp: new Date()
      }
    ]);
  };

  // Handle window resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(320, Math.min(800, startWidth + (startX - e.clientX)));
      const newHeight = Math.max(400, Math.min(800, startHeight + (startY - e.clientY)));
      
      setWindowSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Preset window sizes
  const presetSizes = [
    { name: 'Small', width: 320, height: 400 },
    { name: 'Medium', width: 480, height: 600 },
    { name: 'Large', width: 600, height: 700 },
    { name: 'Extra Large', width: 700, height: 800 }
  ];

  const setPresetSize = (preset) => {
    setWindowSize({ width: preset.width, height: preset.height });
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 relative"
            style={{ 
              width: windowSize.width, 
              height: windowSize.height,
              minWidth: '320px',
              minHeight: '400px',
              maxWidth: '800px',
              maxHeight: '800px',
              cursor: isResizing ? 'nw-resize' : 'default'
            }}
          >
            {/* Resize Handle */}
            <div
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10 hover:bg-blue-100 transition-colors"
              onMouseDown={handleMouseDown}
              title="Drag to resize"
            >
              <div className="absolute top-1 left-1 w-2 h-2">
                <div className="w-full h-full opacity-50">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-400">
                    <path d="M13,21V19H15V17H17V15H19V13H21V11H19V13H17V15H15V17H13V19H11V21H13M4,3H16L14,5H4V15L2,17V3A2,2 0 0,1 4,1H18A2,2 0 0,1 20,3V9L18,11V7H16V9L14,11V5H16V3H18V5H20V7H18V9H16V7H14V9H12V11H10V9H12V7H14V5H16V3Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between relative">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-5 h-5" />
                <span className="font-medium">Learning Assistant</span>
                {context !== 'general' && (
                  <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                    {context === 'content' ? 'Content Mode' : 'Quiz Mode'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Size Selector Dropdown */}
                <div className="relative group">
                  <button
                    className="p-1 hover:bg-blue-700 rounded transition-colors text-xs"
                    title="Window size"
                  >
                    <CogIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-8 bg-white text-gray-800 rounded-lg shadow-lg border py-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                    {presetSizes.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setPresetSize(preset)}
                        className={`w-full text-left px-3 py-1 hover:bg-gray-100 text-xs ${
                          windowSize.width === preset.width && windowSize.height === preset.height
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : ''
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                  title="Clear chat"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '200px' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <CpuChipIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CpuChipIcon className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  disabled={isLoading}
                  rows={Math.min(4, Math.max(1, inputMessage.split('\n').length))}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 self-end"
                  style={{ minHeight: '40px', minWidth: '40px' }}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
                <span className="text-xs text-gray-400">
                  {windowSize.width}×{windowSize.height}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
