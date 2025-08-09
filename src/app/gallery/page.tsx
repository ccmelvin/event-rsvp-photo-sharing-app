'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Camera, Calendar, MapPin } from 'lucide-react';
import { PhotoDisplay } from '@/components/PhotoDisplay';
import Link from 'next/link';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function GalleryPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    fetchPhotos();
    fetchEvents();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await client.models.Photo.list({
        filter: { isApproved: { eq: true } },
      });
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await client.models.Event.list({
        filter: { isPublic: { eq: true } },
      });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filteredPhotos = selectedEvent === 'all' 
    ? photos 
    : photos.filter(photo => photo.eventId === selectedEvent);

  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  const getEventDetails = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event;
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Photo Gallery</h1>
            <p className="text-gray-600">Browse photos from all events</p>
          </div>

          {/* Event Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Event</h3>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events ({photos.length} photos)</option>
              {events.map((event) => {
                const eventPhotoCount = photos.filter(p => p.eventId === event.id).length;
                return (
                  <option key={event.id} value={event.id}>
                    {event.title} ({eventPhotoCount} photos)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {selectedEvent === 'all' ? 'No photos yet' : 'No photos for this event'}
              </h3>
              <p className="text-gray-500">
                {selectedEvent === 'all' 
                  ? 'Photos from events will appear here once uploaded and approved.'
                  : 'This event doesn\'t have any photos yet.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPhotos.map((photo, index) => {
                const event = getEventDetails(photo.eventId);
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Photo */}
                    <div className="aspect-square">
                      <PhotoDisplay
                        s3Key={photo.s3Key}
                        alt={`Photo from ${getEventTitle(photo.eventId)}`}
                        caption={photo.caption}
                        className="w-full h-full"
                        showLightbox={true}
                      />
                    </div>

                    {/* Photo Info */}
                    <div className="p-4">
                      {photo.caption && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      
                      {/* Event Info */}
                      <Link href={`/events/${photo.eventId}`}>
                        <div className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                          <div className="flex items-center mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="font-medium">{getEventTitle(photo.eventId)}</span>
                          </div>
                          {event && (
                            <>
                              <div className="flex items-center mb-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{event.location}</span>
                              </div>
                              <div>
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </>
                          )}
                        </div>
                      </Link>

                      <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                        Uploaded {new Date(photo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-8 border-t border-gray-200">
            Showing {filteredPhotos.length} of {photos.length} photos from {events.length} events
          </div>
        </motion.div>
      </div>
    </div>
  );
}