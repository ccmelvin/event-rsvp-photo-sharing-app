'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { NotificationToast } from '../../components/NotificationToast';
import { useNotifications } from '../../hooks/useNotifications';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function EventsPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [lastEventCount, setLastEventCount] = useState(0);
  const { notifications, addNotification, dismissNotification } = useNotifications();

  useEffect(() => {
    fetchEvents();
    
    // Subscribe to event changes
    const eventSub = client.models.Event.observeQuery({
      filter: { isPublic: { eq: true } }
    }).subscribe({
      next: ({ items }) => {
        if (lastEventCount > 0 && items.length > lastEventCount) {
          const newEventsCount = items.length - lastEventCount;
          addNotification(
            'event',
            'New Event Available!',
            `${newEventsCount} new event${newEventsCount > 1 ? 's' : ''} added`
          );
        }
        setEvents(items);
        setLastEventCount(items.length);
      }
    });

    return () => eventSub.unsubscribe();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await client.models.Event.list({
        filter: { isPublic: { eq: true } },
      });
      setEvents(data);
      setLastEventCount(data.length);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
                           event.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const matchesDate = dateFilter === 'all' ||
                       (dateFilter === 'upcoming' && eventDate >= now) ||
                       (dateFilter === 'past' && eventDate < now);
    
    return matchesSearch && matchesLocation && matchesDate;
  });

  const uniqueLocations = [...new Set(events.map(event => 
    event.location.split(',')[0].trim()
  ))].sort();

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
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-gray-800">Upcoming Events</h1>
            <p className="text-gray-600 mt-2">Discover and join amazing events</p>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/events/create">
                <button 
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Event</span>
                </button>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Events
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
            <span>
              Showing {filteredEvents.length} of {events.length} events
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <span className="text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live updates
            </span>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16"
          >
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {events.length === 0 ? 'No events yet' : 'No events found'}
            </h3>
            <p className="text-gray-500">
              {events.length === 0 
                ? 'Be the first to create an event!' 
                : 'Try adjusting your search or filters.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    {event.maxAttendees && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">Max {event.maxAttendees} attendees</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <button className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <NotificationToast 
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </div>
    </div>
  );
}
