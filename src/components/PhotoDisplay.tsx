'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      if (!s3Key) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        // Check if storage is configured
        const { Amplify } = await import('aws-amplify');
        const config = Amplify.getConfig();
        
        if (!config.Storage?.S3?.bucket) {
          console.warn('S3 storage not configured. Photos will not display until storage is set up.');
          setError(true);
          setLoading(false);
          return;
        }
        
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
    } else {
      setError(true);
      setLoading(false);
    }
  }, [s3Key]);

  const handleImageClick = () => {
    if (showLightbox && imageUrl) {
      setLightboxOpen(true);
    }
  };

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setError(true);
  };

  if (loading) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '150px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-200 rounded-lg flex flex-col items-center justify-center ${className}`} style={{ minHeight: '150px' }}>
        <Camera className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500 text-center px-2">
          {!s3Key ? 'No image' : 'Image loading...'}
        </span>
        <button 
          onClick={() => {
            setError(false);
            setLoading(true);
            // Retry fetching the image
            const fetchImageUrl = async () => {
              if (!s3Key) {
                setError(true);
                setLoading(false);
                return;
              }

              try {
                const { Amplify } = await import('aws-amplify');
                const config = Amplify.getConfig();
                
                if (!config.Storage?.S3?.bucket) {
                  console.warn('S3 storage not configured. Images cannot load until storage is deployed.');
                  setError(true);
                  setLoading(false);
                  return;
                }
                
                const result = await getUrl({
                  path: s3Key,
                  options: {
                    expiresIn: 3600,
                  },
                });
                setImageUrl(result.url.toString());
                setLoading(false);
              } catch (error) {
                console.error('Error fetching image URL:', error);
                setError(true);
                setLoading(false);
              }
            };
            fetchImageUrl();
          }}
          className="text-xs text-blue-600 hover:text-blue-800 mt-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-lg ${showLightbox ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleImageClick}
        style={{ minWidth: '150px', minHeight: '150px' }}
      >
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt || 'Photo'}
          fill
          className={`object-cover transition-all duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          } hover:scale-105`}
          style={{ 
            backgroundColor: '#f3f4f6' // Light gray background
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        {caption && !imageLoading && (
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
              <div className="relative max-w-full max-h-full">
                <Image
                  src={imageUrl}
                  alt={alt || 'Photo'}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                  sizes="90vw"
                />
              </div>
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
