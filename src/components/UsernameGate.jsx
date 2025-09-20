import React from 'react';
import { useLearning } from '../contexts/LearningContext';
import UsernameSetup from './UsernameSetup';

const UsernameGate = ({ children }) => {
  const { user, requiresUsername, updateUserProfile } = useLearning();

  const handleUsernameSet = (updatedUser) => {
    updateUserProfile(updatedUser);
  };

  const handleSkip = () => {
    // For now, allow users to skip username setup
    // They'll be prompted again when trying to access community features
    updateUserProfile({ ...user, username: null });
  };

  // Show username setup if required
  if (requiresUsername) {
    return (
      <UsernameSetup 
        onUsernameSet={handleUsernameSet}
        onSkip={handleSkip}
      />
    );
  }

  // Otherwise, render the children
  return children;
};

export default UsernameGate;