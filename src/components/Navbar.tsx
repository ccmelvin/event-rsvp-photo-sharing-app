'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useUser } from '@/contexts/UserContext';
import { signOut } from 'aws-amplify/auth';
import { motion } from 'framer-motion';
import { Calendar, Camera, User, LogOut, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const { profile, avatarUrl } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple sign out attempts
    
    try {
      setIsSigningOut(true);
      await signOut({ global: true });
      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      // Redirect to home page
      router.push('/');
      // Force a page reload to clear all state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if sign out fails
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAuthenticated = authStatus === 'authenticated' && user;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">EventShare</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-gray-600 hover:text-blue-600 transition-colors">
              Events
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/gallery" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Gallery
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Profile
                </Link>
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center relative">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700">
                    {profile?.firstName && profile?.lastName 
                      ? `${profile.firstName} ${profile.lastName}`.trim()
                      : user.signInDetails?.loginId || user.username || 'User'
                    }
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                </motion.button>
              </div>
            ) : (
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <span>Sign In</span>
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/events"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/gallery"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gallery
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center relative">
                      {avatarUrl ? (
                        <Image 
                          src={avatarUrl} 
                          alt="Avatar" 
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-700">
                      {profile?.firstName && profile?.lastName 
                        ? `${profile.firstName} ${profile.lastName}`.trim()
                        : user.signInDetails?.loginId || user.username || 'User'
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={isSigningOut}
                    className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors w-full justify-center disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <button 
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors w-full"
                  >
                    <span>Sign In</span>
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
