export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  maxAttendees?: number;
  isPublic: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  rsvps?: RSVP[];
  photos?: Photo[];
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
  createdAt?: string;
  updatedAt?: string;
  event?: Event;
}

export interface Photo {
  id: string;
  eventId: string;
  uploadedBy: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  s3Key: string;
  thumbnailS3Key?: string;
  caption?: string;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
  event?: Event;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RSVPStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE';
