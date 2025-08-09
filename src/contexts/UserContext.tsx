'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface UserProfile {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarKey?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserContextType {
  profile: UserProfile | null;
  avatarUrl: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAvatarUrl: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setAvatarUrl(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.models.UserProfile.list({
        filter: { userId: { eq: user.userId } },
      });

      if (data.length > 0) {
        const userProfile = data[0];
        setProfile(userProfile);
        
        // Load avatar if exists
        if (userProfile.avatarKey) {
          try {
            const result = await getUrl({ path: userProfile.avatarKey });
            setAvatarUrl(result.url.toString());
          } catch (error) {
            console.error('Error loading avatar:', error);
            setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }
      } else {
        // Create profile if doesn't exist
        const newProfile = await client.models.UserProfile.create({
          userId: user.userId,
          email: user.signInDetails?.loginId || '',
          firstName: user.signInDetails?.loginId?.split('@')[0] || '',
          lastName: '',
        });
        setProfile(newProfile.data);
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const updatedProfile = await client.models.UserProfile.update({
        id: profile.id,
        ...updates,
      });
      
      if (updatedProfile.data) {
        setProfile(updatedProfile.data);
        
        // If avatar was updated, refresh the URL
        if (updates.avatarKey && updates.avatarKey !== profile.avatarKey) {
          try {
            const result = await getUrl({ path: updates.avatarKey });
            setAvatarUrl(result.url.toString());
          } catch (error) {
            console.error('Error loading new avatar:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateAvatarUrl = (url: string) => {
    setAvatarUrl(url);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  const value: UserContextType = {
    profile,
    avatarUrl,
    loading,
    refreshProfile,
    updateProfile,
    updateAvatarUrl,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
