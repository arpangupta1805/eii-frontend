import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PastQuizzes = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Past Quizzes</h1>
            <p className="text-gray-600">We’ll add your past quiz details here soon.</p>
          </div>
          <Link to="/" className="btn-secondary flex items-center space-x-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 card-interactive"
      >
        <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600 mb-6">A unified view of your previous quiz attempts and insights.</p>
        <Link to="/" className="btn-primary">Go to Dashboard</Link>
      </motion.div>
    </div>
  );
};

export default PastQuizzes;


