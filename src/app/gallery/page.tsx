'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { Camera, Calendar, MapPin } from 'lucide-react';
import { PhotoDisplay } from '@/components/PhotoDisplay';
import Link from 'next/link';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function GalleryPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventsWithPhotos();
  }, []);

  const fetchEventsWithPhotos = async () => {
    try {
      // Fetch all public events
      const { data: eventsData } = await client.models.Event.list({
        filter: { isPublic: { eq: true } },
      });

      // For each event, fetch approved photos
      const eventsWithPhotos = await Promise.all(
        eventsData.map(async (event) => {
          const { data: photosData } = await client.models.Photo.list({
            filter: {
              eventId: { eq: event.id },
              isApproved: { eq: true },
            },
          });
          return {
            ...event,
            photos: photosData,
            photoCount: photosData.length,
          };
        })
      );

      // Filter events that have photos and sort by photo count
      const eventsWithPhotosFiltered = eventsWithPhotos
        .filter(event => event.photoCount > 0)
        .sort((a, b) => b.photoCount - a.photoCount);

      setEvents(eventsWithPhotosFiltered);
    } catch (error) {
      console.error('Error fetching events with photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Gallery</h1>
            <p className="text-xl text-gray-600">
              Browse photos from all our amazing events
            </p>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos yet</h3>
              <p className="text-gray-500">Photos from events will appear here once they're uploaded!</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Event Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Camera className="h-4 w-4 mr-1" />
                            <span className="text-sm">{event.photoCount} photos</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <button 
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                          style={{ color: '#ffffff' }}
                        >
                          <span style={{ color: '#ffffff' }}>View Event</span>
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Photo Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {event.photos.slice(0, 12).map((photo: any, photoIndex: number) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: photoIndex * 0.05 }}
                          className="aspect-square"
                          style={{ minHeight: '150px', minWidth: '150px' }}
                        >
                          <PhotoDisplay
                            s3Key={photo.s3Key}
                            alt={`Photo from ${event.title}`}
                            caption={photo.caption}
                            className="w-full h-full rounded-lg"
                            showLightbox={true}
                          />
                        </motion.div>
                      ))}
                      
                      {/* Show more indicator */}
                      {event.photoCount > 12 && (
                        <Link href={`/events/${event.id}`}>
                          <div 
                            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                            style={{ minHeight: '150px', minWidth: '150px' }}
                          >
                            <div className="text-center">
                              <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                              <span className="text-sm text-gray-600">
                                +{event.photoCount - 12} more
                              </span>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
