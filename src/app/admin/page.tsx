'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { remove } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Calendar, Users, Camera, Trash2, Edit, Eye } from 'lucide-react';
import { PhotoDisplay } from '@/components/PhotoDisplay';
import { Modal } from '@/components/Modal';
import Link from 'next/link';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function AdminPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [events, setEvents] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'photos'>('events');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserEvents();
      fetchPendingPhotos();
    }
  }, [user]);

  const fetchUserEvents = async () => {
    if (!user) return;
    
    try {
      const { data } = await client.models.Event.list({
        filter: { createdBy: { eq: user.userId } },
      });
      setEvents(data);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPhotos = async () => {
    try {
      const { data } = await client.models.Photo.list({
        filter: { isApproved: { eq: false } },
      });
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching pending photos:', error);
    }
  };

  const deleteEvent = async () => {
    if (!selectedEventId) return;

    try {
      await client.models.Event.delete({ id: selectedEventId });
      setEvents(events.filter(event => event.id !== selectedEventId));
      setShowDeleteModal(false);
      setSelectedEventId(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const openDeleteModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  const approvePhoto = async (photoId: string) => {
    try {
      await client.models.Photo.update({
        id: photoId,
        isApproved: true,
      });
      setPhotos(photos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error approving photo:', error);
      alert('Failed to approve photo. Please try again.');
    }
  };

  const rejectPhoto = async () => {
    if (!selectedPhotoId) return;

    try {
      const photoToReject = photos.find(p => p.id === selectedPhotoId);
      if (photoToReject?.s3Key) {
        await remove({ path: photoToReject.s3Key });
      }
      await client.models.Photo.delete({ id: selectedPhotoId });
      setPhotos(photos.filter(photo => photo.id !== selectedPhotoId));
      setShowRejectModal(false);
      setSelectedPhotoId(null);
    } catch (error) {
      console.error('Error rejecting photo:', error);
      alert('Failed to reject photo. Please try again.');
    }
  };

  const openRejectModal = (photoId: string) => {
    setSelectedPhotoId(photoId);
    setShowRejectModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'events'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="h-5 w-5 inline mr-2" />
                  My Events ({events.length})
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'photos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Camera className="h-5 w-5 inline mr-2" />
                  Pending Photos ({photos.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'events' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Events</h2>
                    <Link href="/events/create">
                      <button 
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        <span>Create New Event</span>
                      </button>
                    </Link>
                  </div>

                  {events.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No events created</h3>
                      <p className="text-gray-500">Create your first event to get started!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {events.map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-gray-50 rounded-lg p-6 flex justify-between items-center"
                        >
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                            <p className="text-gray-600">{formatDate(event.date)} • {event.location}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {event.isPublic ? 'Public' : 'Private'} Event
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link href={`/events/${event.id}`}>
                              <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Eye className="h-5 w-5" />
                              </button>
                            </Link>
                            <Link href={`/events/${event.id}/edit`}>
                              <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                <Edit className="h-5 w-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => openDeleteModal(event.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Photo Approvals</h2>

                  {photos.length === 0 ? (
                    <div className="text-center py-12">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending photos</h3>
                      <p className="text-gray-500">All photos have been reviewed!</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {photos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="aspect-square mb-4">
                            <PhotoDisplay
                              s3Key={photo.s3Key}
                              alt={`Photo: ${photo.fileName}`}
                              caption={photo.caption}
                              className="w-full h-full"
                              showLightbox={true}
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <strong>File:</strong> {photo.fileName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Uploaded:</strong> {formatDate(photo.createdAt)}
                            </p>
                            {photo.caption && (
                              <p className="text-sm text-gray-600">
                                <strong>Caption:</strong> {photo.caption}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => approvePhoto(photo.id)}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(photo.id)}
                              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Delete Event Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEventId(null);
          }}
          title="Delete Event"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this event? This will also delete all associated RSVPs and photos. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEventId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteEvent}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Event
              </button>
            </div>
          </div>
        </Modal>

        {/* Reject Photo Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedPhotoId(null);
          }}
          title="Reject Photo"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to reject this photo? The photo will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPhotoId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={rejectPhoto}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Photo
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
