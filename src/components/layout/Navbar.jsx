import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1 rounded-lg">
                <img 
                  src="/YATI_ Master Your Mind.png" 
                  alt="YATI Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">YATI-Discipline</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <SignedIn>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link 
                  to="/upload" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors"
                >
                  {t('nav.upload')}
                </Link>
                <Link 
                  to="/custom-quiz" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors"
                >
                  {t('nav.custom_quiz')}
                </Link>
                <Link 
                  to="/community" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium transition-colors"
                >
                  Community
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Authentication and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-md transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <SignedIn>
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-blue-600 block px-4 py-3 rounded-md text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.dashboard')}
              </Link>
              <Link 
                to="/upload" 
                className="text-gray-600 hover:text-blue-600 block px-4 py-3 rounded-md text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.upload')}
              </Link>
              <Link 
                to="/custom-quiz" 
                className="text-gray-600 hover:text-blue-600 block px-4 py-3 rounded-md text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.custom_quiz')}
              </Link>
              <Link 
                to="/community" 
                className="text-gray-600 hover:text-blue-600 block px-4 py-3 rounded-md text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Community
              </Link>
            </div>
          </div>
        )}
      </SignedIn>
    </nav>
  );
};

export default Navbar;
