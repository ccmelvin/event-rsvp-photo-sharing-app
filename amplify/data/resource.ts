import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Event: a
    .model({
      id: a.id(),
      title: a.string().required(),
      description: a.string(),
      date: a.datetime().required(),
      location: a.string().required(),
      maxAttendees: a.integer(),
      isPublic: a.boolean().default(true),
      createdBy: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      rsvps: a.hasMany('RSVP', 'eventId'),
      photos: a.hasMany('Photo', 'eventId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
      allow.groups(['admin']).to(['create', 'read', 'update', 'delete']),
    ]),

  RSVP: a
    .model({
      id: a.id(),
      eventId: a.id().required(),
      userId: a.string().required(),
      status: a.enum(['ATTENDING', 'NOT_ATTENDING', 'MAYBE']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      event: a.belongsTo('Event', 'eventId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
      allow.groups(['admin']).to(['create', 'read', 'update', 'delete']),
    ]),

  Photo: a
    .model({
      id: a.id(),
      eventId: a.id().required(),
      uploadedBy: a.string().required(),
      fileName: a.string().required(),
      fileSize: a.integer(),
      mimeType: a.string(),
      s3Key: a.string().required(),
      thumbnailS3Key: a.string(),
      caption: a.string(),
      isApproved: a.boolean().default(true),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      event: a.belongsTo('Event', 'eventId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
      allow.groups(['admin']).to(['create', 'read', 'update', 'delete']),
    ]),

  UserProfile: a
    .model({
      id: a.id(),
      userId: a.string().required(),
      email: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      isAdmin: a.boolean().default(false),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.groups(['admin']).to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
