'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';

export function AuthHandler() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user signs out and is on a protected route, redirect to home
    if (!user && pathname !== '/' && pathname !== '/auth') {
      // Check if current route requires authentication
      const protectedRoutes = ['/events/create', '/admin', '/gallery'];
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtectedRoute) {
        router.push('/');
      }
    }
  }, [user, pathname, router]);

  return null; // This component doesn't render anything
}
