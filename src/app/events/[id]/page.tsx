'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import { Calendar, MapPin, Users, Camera, Check, X, Clock } from 'lucide-react';
import { PhotoDisplay } from '@/components/PhotoDisplay';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { user } = useAuthenticator((context) => [context.user]);
  const resolvedParams = use(params);
  const [event, setEvent] = useState<any>(null);
  const [rsvp, setRsvp] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user) {
      fetchUserRsvp();
    }
    fetchPhotos();
  }, [resolvedParams.id, user]);

  const fetchEventDetails = async () => {
    try {
      const { data } = await client.models.Event.get({ id: resolvedParams.id });
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchUserRsvp = async () => {
    if (!user) return;
    
    try {
      const { data } = await client.models.RSVP.list({
        filter: {
          eventId: { eq: resolvedParams.id },
          userId: { eq: user.userId },
        },
      });
      if (data.length > 0) {
        setRsvp(data[0]);
      }
    } catch (error) {
      console.error('Error fetching RSVP:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data } = await client.models.Photo.list({
        filter: {
          eventId: { eq: resolvedParams.id },
          isApproved: { eq: true },
        },
      });
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE') => {
    if (!user) return;

    setRsvpLoading(true);
    try {
      if (rsvp) {
        // Update existing RSVP
        const { data } = await client.models.RSVP.update({
          id: rsvp.id,
          status,
        });
        setRsvp(data);
      } else {
        // Create new RSVP
        const { data } = await client.models.RSVP.create({
          eventId: resolvedParams.id,
          userId: user.userId,
          status,
        });
        setRsvp(data);
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRsvpButtonClass = (status: string) => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors ';
    if (rsvp?.status === status) {
      switch (status) {
        case 'ATTENDING':
          return baseClass + 'bg-green-600 text-white';
        case 'NOT_ATTENDING':
          return baseClass + 'bg-red-600 text-white';
        case 'MAYBE':
          return baseClass + 'bg-yellow-600 text-white';
        default:
          return baseClass + 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      }
    }
    return baseClass + 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
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
          {/* Event Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{event.title}</h1>
            
            {event.description && (
              <p className="text-gray-600 mb-6 text-lg">{event.description}</p>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{event.location}</span>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>Max {event.maxAttendees} attendees</span>
                  </div>
                )}
              </div>

              {/* RSVP Section */}
              {user && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your RSVP</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRsvp('ATTENDING')}
                      disabled={rsvpLoading}
                      className={getRsvpButtonClass('ATTENDING')}
                    >
                      <Check className="h-4 w-4 inline mr-2" />
                      Attending
                    </button>
                    <button
                      onClick={() => handleRsvp('MAYBE')}
                      disabled={rsvpLoading}
                      className={getRsvpButtonClass('MAYBE')}
                    >
                      <Clock className="h-4 w-4 inline mr-2" />
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRsvp('NOT_ATTENDING')}
                      disabled={rsvpLoading}
                      className={getRsvpButtonClass('NOT_ATTENDING')}
                    >
                      <X className="h-4 w-4 inline mr-2" />
                      Not Attending
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload Section */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Camera className="h-6 w-6 mr-2" />
                Share Photos
              </h2>
              <StorageManager
                acceptedFileTypes={['image/*']}
                path={`event-photos/${resolvedParams.id}/`}
                maxFileCount={10}
                maxFileSize={10000000} // 10MB
                onUploadSuccess={async (event) => {
                  // Create database record for the uploaded photo
                  try {
                    console.log('Upload success event:', event);
                    
                    // Extract file info from the event
                    const filePath = event.path || event.key;
                    const fileName = filePath ? filePath.split('/').pop() : 'unknown';
                    
                    await client.models.Photo.create({
                      eventId: resolvedParams.id,
                      uploadedBy: user.userId,
                      fileName: fileName,
                      s3Key: filePath,
                      isApproved: false, // Requires admin approval
                    });
                    
                    console.log('Photo record created successfully');
                    
                    // Refresh photos after upload
                    fetchPhotos();
                  } catch (error) {
                    console.error('Error creating photo record:', error);
                  }
                }}
              />
            </motion.div>
          )}

          {/* Photo Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Gallery</h2>
            
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos yet</h3>
                <p className="text-gray-500">Be the first to share a photo from this event!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="aspect-square"
                  >
                    <PhotoDisplay
                      s3Key={photo.s3Key}
                      alt={`Photo from ${event.title}`}
                      caption={photo.caption}
                      className="w-full h-full"
                      showLightbox={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
