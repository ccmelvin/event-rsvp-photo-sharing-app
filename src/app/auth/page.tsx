'use client';

import { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function AuthContent() {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (authStatus === 'authenticated' && user && !isRedirecting) {
      setIsRedirecting(true);
      // Small delay to ensure state is properly set
      setTimeout(() => {
        router.push('/events');
      }, 500);
    }
  }, [user, authStatus, router, isRedirecting]);

  if (authStatus === 'authenticated' && user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-900">Welcome! Redirecting to events...</p>
      </motion.div>
    );
  }

  return null;
}

export default function AuthPage() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  // If already authenticated, don't show the auth form
  if (authStatus === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <AuthContent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to EventShare
          </h1>
          <p className="text-gray-600">
            Sign in to your account or create a new one
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <Authenticator 
            signUpAttributes={['given_name', 'family_name']}
            socialProviders={[]}
            variation="modal"
            hideSignUp={false}
          >
            <AuthContent />
          </Authenticator>
        </motion.div>
      </div>
    </div>
  );
}
