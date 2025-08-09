'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export function AmplifyProvider({ children }: AmplifyProviderProps) {
  return (
    <Authenticator.Provider>
      <div className="min-h-screen">
        {children}
      </div>
    </Authenticator.Provider>
  );
}
