'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { User, Calendar, Camera, Save, Upload } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { NotificationModal, useNotification } from '@/components/NotificationModal';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

function ProfileContent() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { profile, avatarUrl, updateProfile, updateAvatarUrl } = useUser();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ events: 0, rsvps: 0, photos: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check storage availability on component mount
    const checkStorage = async () => {
      try {
        const { Amplify } = await import('aws-amplify');
        const config = Amplify.getConfig();
        setStorageAvailable(!!config.Storage?.S3?.bucket);
      } catch (error) {
        setStorageAvailable(false);
      }
    };
    checkStorage();
  }, []);

  // Sync form data with profile
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [eventsData, rsvpsData, photosData] = await Promise.all([
        client.models.Event.list({ filter: { createdBy: { eq: user.userId } } }),
        client.models.RSVP.list({ filter: { userId: { eq: user.userId } } }),
        client.models.Photo.list({ filter: { uploadedBy: { eq: user.userId } } }),
      ]);

      setStats({
        events: eventsData.data.length,
        rsvps: rsvpsData.data.length,
        photos: photosData.data.length,
      });

      // Get recent activity
      const allActivity = [
        ...eventsData.data.map(event => ({ type: 'event', data: event, date: event.createdAt })),
        ...rsvpsData.data.map(rsvp => ({ type: 'rsvp', data: rsvp, date: rsvp.createdAt })),
        ...photosData.data.map(photo => ({ type: 'photo', data: photo, date: photo.createdAt })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      
      setRecentActivity(allActivity);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      });
      
      showSuccess('Profile Updated', 'Your profile has been updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Profile</h1>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center mb-8">
                    <div className="relative mr-6">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center relative">
                        {avatarUrl ? (
                          <>
                            {avatarLoading && (
                              <div className="absolute inset-0 bg-blue-600 animate-pulse flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                            <Image 
                              src={avatarUrl} 
                              alt="Avatar" 
                              fill
                              className={`object-cover transition-opacity duration-300 ${
                                avatarLoading ? 'opacity-0' : 'opacity-100'
                              }`}
                              sizes="80px"
                              onLoad={() => setAvatarLoading(false)}
                              onLoadStart={() => setAvatarLoading(true)}
                              priority
                            />
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {(formData.firstName?.[0] || user.signInDetails?.loginId?.[0] || 'U').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <label className={`absolute -bottom-1 -right-1 p-2 rounded-full cursor-pointer transition-colors ${
                        storageAvailable === false 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gray-800 hover:bg-gray-900'
                      } text-white`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !user) return;
                            
                            // Check if storage is configured
                            try {
                              const { Amplify } = await import('aws-amplify');
                              const config = Amplify.getConfig();
                              
                              if (!config.Storage?.S3?.bucket) {
                                showError('Upload Not Available', 'Photo upload is not available yet. Please try again later.');
                                return;
                              }
                              
                              setUploadingAvatar(true);
                              const avatarKey = `avatars/${user.userId}/${Date.now()}-${file.name}`;
                              await uploadData({ path: avatarKey, data: file });
                              
                              // Update profile with new avatar key
                              await updateProfile({ avatarKey });
                              
                              // Update avatar URL in context
                              const result = await getUrl({ path: avatarKey });
                              updateAvatarUrl(result.url.toString());
                              
                              showSuccess('Avatar Updated', 'Your profile picture has been updated successfully!');
                            } catch (error) {
                              console.error('Error uploading avatar:', error);
                              if (error.message?.includes('NoBucket') || error.message?.includes('bucket')) {
                                showError('Upload Failed', 'Photo upload is not available yet. Please try again later.');
                              } else {
                                showError('Upload Failed', 'Failed to upload avatar. Please try again.');
                              }
                            } finally {
                              setUploadingAvatar(false);
                            }
                          }}
                          className="hidden"
                          disabled={uploadingAvatar || storageAvailable === false}
                        />
                        {uploadingAvatar ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </label>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        {formData.firstName || formData.lastName 
                          ? `${formData.firstName} ${formData.lastName}`.trim()
                          : 'Your Profile'
                        }
                      </h2>
                      <p className="text-gray-600 text-lg">{user.signInDetails?.loginId}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </form>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4">
                            {activity.type === 'event' && <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Calendar className="h-5 w-5 text-blue-600" /></div>}
                            {activity.type === 'rsvp' && <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-green-600" /></div>}
                            {activity.type === 'photo' && <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Camera className="h-5 w-5 text-purple-600" /></div>}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {activity.type === 'event' && `Created event: ${activity.data.title}`}
                              {activity.type === 'rsvp' && `RSVP'd to an event`}
                              {activity.type === 'photo' && `Uploaded a photo`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Events Created</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{stats.events}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Events RSVP'd</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{stats.rsvps}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Photos Shared</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{stats.photos}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/events/create" className="block">
                      <button className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center text-left">
                        <Calendar className="h-4 w-4 mr-3" />
                        Create New Event
                      </button>
                    </Link>
                    <Link href="/events" className="block">
                      <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center text-left">
                        <User className="h-4 w-4 mr-3" />
                        Browse Events
                      </button>
                    </Link>
                    <Link href="/gallery" className="block">
                      <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center text-left">
                        <Camera className="h-4 w-4 mr-3" />
                        View Gallery
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfileContent />
    </ProtectedRoute>
  );
}