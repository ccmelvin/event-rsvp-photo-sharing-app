'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, authStatus } = useAuthenticator((context) => [context.user, context.authStatus]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth status to be determined
    if (authStatus === 'configuring') {
      return;
    }

    setIsLoading(false);

    if (requireAuth && authStatus !== 'authenticated') {
      // Redirect to auth page if authentication is required but user is not authenticated
      router.push('/auth');
    }
  }, [authStatus, requireAuth, router]);

  // Show loading spinner while determining auth status
  if (authStatus === 'configuring' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && authStatus !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}
