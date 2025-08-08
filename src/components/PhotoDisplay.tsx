'use client';

import { useState, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoDisplayProps {
  s3Key: string;
  alt?: string;
  className?: string;
  showLightbox?: boolean;
  caption?: string;
}

export function PhotoDisplay({ 
  s3Key, 
  alt = "Event photo", 
  className = "", 
  showLightbox = true,
  caption 
}: PhotoDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const result = await getUrl({
          path: s3Key,
          options: {
            expiresIn: 3600, // 1 hour
          },
        });
        
        setImageUrl(result.url.toString());
      } catch (err) {
        console.error('Error fetching image URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (s3Key) {
      fetchImageUrl();
    }
  }, [s3Key]);

  const handleImageClick = () => {
    if (showLightbox && imageUrl) {
      setLightboxOpen(true);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <Camera className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-lg ${showLightbox ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleImageClick}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
            {caption}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              {caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
                  <p className="text-center">{caption}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
