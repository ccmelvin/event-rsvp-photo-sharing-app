'use client';

import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'event' | 'photo' | 'rsvp';
  title: string;
  message: string;
  timestamp: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: 'event' | 'photo' | 'rsvp',
    title: string,
    message: string
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
  };
}