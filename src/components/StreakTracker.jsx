import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FireIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../utils/api';

const StreakTracker = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.success && response.data.profile) {
          setStreakData(response.data.profile.streak);
        }
      } catch (error) {
        console.error('Error fetching streak data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const currentStreak = streakData?.current || 0;
  const longestStreak = streakData?.longest || 0;
  const lastActivity = streakData?.lastActivity;

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '🚀';
    if (streak < 3) return '🔥';
    if (streak < 7) return '💪';
    if (streak < 14) return '🌟';
    if (streak < 30) return '🏆';
    return '👑';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return 'Start your learning streak today!';
    if (streak === 1) return 'Great start! Keep it going!';
    if (streak < 7) return 'Building momentum!';
    if (streak < 14) return 'You\'re on fire!';
    if (streak < 30) return 'Amazing dedication!';
    return 'Legendary streaker!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FireIcon className="h-6 w-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Learning Streak</h3>
        </div>
        <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {currentStreak}
          </div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {longestStreak}
          </div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-800 mb-2">
          {getStreakMessage(currentStreak)}
        </p>
        {lastActivity && (
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Last activity: {new Date(lastActivity).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 bg-white rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Days this week</span>
            <div className="flex space-x-1">
              {Array.from({ length: 7 }, (_, i) => {
                const today = new Date();
                const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const dayOfWeek = i; // 0 = Sunday, 1 = Monday, etc.
                const isToday = dayOfWeek === currentDayOfWeek;
                
                // Calculate if this day had activity based on streak data
                // For demonstration, we'll mark recent days as active based on current streak
                const daysAgo = currentDayOfWeek - dayOfWeek;
                const adjustedDaysAgo = daysAgo < 0 ? daysAgo + 7 : daysAgo;
                const hasActivity = adjustedDaysAgo < currentStreak && adjustedDaysAgo <= currentDayOfWeek;
                
                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      hasActivity
                        ? 'bg-orange-500 text-white'
                        : isToday
                        ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-300'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek]}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakTracker;