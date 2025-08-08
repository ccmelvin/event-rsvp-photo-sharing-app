import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'eventPhotos',
  access: (allow) => ({
    'event-photos/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'event-thumbnails/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
