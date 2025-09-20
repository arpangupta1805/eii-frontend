import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import UsernameGate from './components/UsernameGate';
import Dashboard from './pages/Dashboard';
import UploadContent from './pages/UploadContent';
import Learning from './pages/Learning';
import Quiz from './pages/Quiz';
import QuizById from './pages/QuizById';
import QuizHistory from './pages/QuizHistory';
import CustumQuiz from './pages/CustumQuiz';
import Summary from './pages/Summary';
import PastQuizzes from './pages/PastQuizzes';
import AllAnalytics from './pages/AllAnalytics';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';
import CommunityQuizLeaderboard from './pages/CommunityQuizLeaderboard';
import CommunityQuizDiscussion from './pages/CommunityQuizDiscussion';
import { LearningProvider } from './contexts/LearningContext';
import { DynamicTranslationProvider } from './contexts/DynamicTranslationContext';
import './i18n/i18n'; // Initialize i18n

// Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        <UsernameGate>
          {children}
        </UsernameGate>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

function App() {
  // Check if Clerk is properly configured
  if (!clerkPubKey || clerkPubKey === 'your_clerk_publishable_key_here') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Please set up your Clerk publishable key to continue.
          </p>
          <ol className="text-left text-sm text-gray-600 space-y-2">
            <li>1. Go to <a href="https://dashboard.clerk.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://dashboard.clerk.com</a></li>
            <li>2. Create a new application</li>
            <li>3. Copy the publishable key</li>
            <li>4. Add it to your <code className="bg-gray-100 px-1 rounded">frontend/.env</code> file</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <LearningProvider>
        <DynamicTranslationProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Navbar />
              <main>
              <Routes>
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <UploadContent />
                  </ProtectedRoute>
                } />
                <Route path="/learning/:contentId" element={
                  <ProtectedRoute>
                    <Learning />
                  </ProtectedRoute>
                } />
                <Route path="/quiz" element={
                  <ProtectedRoute>
                    <CustumQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/custom-quiz" element={
                  <ProtectedRoute>
                    <CustumQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/:contentId" element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/take/:quizId" element={
                  <ProtectedRoute>
                    <QuizById />
                  </ProtectedRoute>
                } />
                <Route path="/quiz/history/:quizId" element={
                  <ProtectedRoute>
                    <QuizHistory />
                  </ProtectedRoute>
                } />
                <Route path="/summary/:contentId" element={
                  <ProtectedRoute>
                    <Summary />
                  </ProtectedRoute>
                } />
                <Route path="/quizzes/past" element={
                  <ProtectedRoute>
                    <PastQuizzes />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AllAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-attempt/:attemptId" element={
                  <ProtectedRoute>
                    <QuizHistory />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                } />
                <Route path="/community/:communityId" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />
                <Route path="/community/:communityId/chat" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />
                <Route path="/community/:communityId/quiz/:quizId/leaderboard" element={
                  <ProtectedRoute>
                    <CommunityQuizLeaderboard />
                  </ProtectedRoute>
                } />
                <Route path="/community/:communityId/quiz/:quizId/discussion" element={
                  <ProtectedRoute>
                    <CommunityQuizDiscussion />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4ade80',
                    secondary: '#black',
                  },
                },
              }}
            />
          </div>
        </Router>
        </DynamicTranslationProvider>
      </LearningProvider>
    </ClerkProvider>
  );
}

export default App;
