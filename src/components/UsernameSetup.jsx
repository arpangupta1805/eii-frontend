import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../utils/api';

const UsernameSetup = ({ onUsernameSet, onSkip = null }) => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounced username validation
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setError('');
      return;
    }

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      await checkUsernameAvailability(username);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [username]);

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) return;

    // Validate format first
    if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
      setError('Username can only contain letters, numbers, and underscores');
      setIsAvailable(false);
      return;
    }

    try {
      setIsChecking(true);
      setError('');
      
      const response = await authAPI.checkUsername(usernameToCheck);
      
      if (response.success) {
        setIsAvailable(response.data.available);
        if (!response.data.available) {
          setError('Username is already taken');
        }
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setError('Error checking username availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!isAvailable) {
      setError('Please choose an available username');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await authAPI.setUsername(username);

      if (response.success) {
        onUsernameSet(response.data.user);
      } else {
        setError(response.message || 'Failed to set username');
      }
    } catch (error) {
      console.error('Error setting username:', error);
      setError(error.response?.data?.message || 'Failed to set username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setIsAvailable(null);
    setError('');
  };

  const getInputStatus = () => {
    if (username.length < 3) return '';
    if (isChecking) return 'checking';
    if (isAvailable === true) return 'available';
    if (isAvailable === false) return 'unavailable';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Username
          </h1>
          <p className="text-gray-600">
            You'll need a username to join communities and interact with other learners
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  getInputStatus() === 'available' ? 'border-green-500 bg-green-50' :
                  getInputStatus() === 'unavailable' ? 'border-red-500 bg-red-50' :
                  'border-gray-300'
                }`}
                maxLength={20}
                disabled={isSubmitting}
              />
              
              {/* Status indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isChecking && username.length >= 3 && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                )}
                {isAvailable === true && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {isAvailable === false && (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Validation hints */}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                • 3-20 characters • Letters, numbers, and underscores only
              </p>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              {isAvailable === true && (
                <p className="text-sm text-green-600">✓ Username is available!</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!isAvailable || isSubmitting || isChecking}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting Username...
                </div>
              ) : (
                'Set Username'
              )}
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full btn-secondary py-3"
                disabled={isSubmitting}
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          You can change your username later in your profile settings
        </div>
      </motion.div>
    </div>
  );
};

export default UsernameSetup;