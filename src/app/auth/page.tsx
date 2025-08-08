'use client';

import { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';

function AuthContent() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/events');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="text-center">
        <p className="text-gray-900">Redirecting...</p>
      </div>
    );
  }
  return null;
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to EventShare
          </h1>
          <p className="text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
        
        <div className="bg-white">
          <Authenticator signUpAttributes={['given_name', 'family_name']}>
            <AuthContent />
          </Authenticator>
        </div>
      </div>
    </div>
  );
}
