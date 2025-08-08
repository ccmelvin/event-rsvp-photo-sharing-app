'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { motion } from 'framer-motion';
import { Calendar, Camera, User, LogOut, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      router.replace('/');
    }
  };

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
            {user && (
              <>
                <Link href="/gallery" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Gallery
                </Link>
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">{user.signInDetails?.loginId}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  <LogOut className="h-4 w-4" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Sign Out</span>
                </motion.button>
              </div>
            ) : (
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  <span style={{ color: '#ffffff' }}>Sign In</span>
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
              {user && (
                <>
                  <Link
                    href="/gallery"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gallery
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
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{user.signInDetails?.loginId}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors w-full justify-center"
                    style={{ color: '#ffffff' }}
                  >
                    <LogOut className="h-4 w-4" style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }}>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <button 
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors w-full"
                    style={{ color: '#ffffff' }}
                  >
                    <span style={{ color: '#ffffff' }}>Sign In</span>
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
