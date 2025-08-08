'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { remove } from 'aws-amplify/storage';
import { Camera, Edit3, Trash2, Plus, X, Save } from 'lucide-react';
import { PhotoDisplay } from './PhotoDisplay';
import { Modal } from './Modal';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface PhotoGalleryProps {
  photos: any[];
  eventTitle: string;
  eventId: string;
  currentUserId?: string;
  isEventCreator: boolean;
  onPhotosUpdate: () => void;
}

export function PhotoGallery({ 
  photos, 
  eventTitle, 
  eventId, 
  currentUserId, 
  isEventCreator,
  onPhotosUpdate 
}: PhotoGalleryProps) {
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditPhoto = (photo: any) => {
    setEditingPhoto(photo.id);
    setEditCaption(photo.caption || '');
  };

  const handleSaveCaption = async (photoId: string) => {
    try {
      await client.models.Photo.update({
        id: photoId,
        caption: editCaption,
      });
      setEditingPhoto(null);
      setEditCaption('');
      onPhotosUpdate();
    } catch (error) {
      console.error('Error updating photo caption:', error);
      alert('Failed to update caption. Please try again.');
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletingPhoto) return;

    try {
      const photoToDelete = photos.find(p => p.id === deletingPhoto);
      if (photoToDelete?.s3Key) {
        await remove({ path: photoToDelete.s3Key });
      }
      await client.models.Photo.delete({ id: deletingPhoto });
      setDeletingPhoto(null);
      setShowDeleteModal(false);
      onPhotosUpdate();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const openDeleteModal = (photoId: string) => {
    setDeletingPhoto(photoId);
    setShowDeleteModal(true);
  };

  const canManagePhoto = (photo: any) => {
    return isEventCreator || photo.uploadedBy === currentUserId;
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos yet</h3>
        <p className="text-gray-500">Be the first to share a photo from this event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
          >
            {/* Photo Container */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <PhotoDisplay
                s3Key={photo.s3Key}
                alt={`Photo from ${eventTitle}`}
                caption={photo.caption}
                className="w-full h-full"
                showLightbox={true}
              />
              
              {/* Management Overlay */}
              {canManagePhoto(photo) && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditPhoto(photo)}
                      className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      title="Edit caption"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(photo.id)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Info */}
            <div className="mt-2 space-y-1">
              {/* Caption */}
              {editingPhoto === photo.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSaveCaption(photo.id)}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-3 w-3" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingPhoto(null);
                        setEditCaption('');
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {photo.caption && (
                    <p className="text-sm text-gray-700 line-clamp-2">{photo.caption}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Photo Stats */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in this event
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPhoto(null);
        }}
        title="Delete Photo"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this photo? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingPhoto(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePhoto}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
