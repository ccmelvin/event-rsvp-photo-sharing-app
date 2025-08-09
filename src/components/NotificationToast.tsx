'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Camera, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'event' | 'photo' | 'rsvp';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'photo': return <Camera className="h-5 w-5 text-purple-600" />;
      case 'rsvp': return <Users className="h-5 w-5 text-green-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
          >
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}