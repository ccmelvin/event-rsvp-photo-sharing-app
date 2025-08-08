import { defineFunction } from '@aws-amplify/backend';

export const imageResize = defineFunction({
  name: 'image-resize',
  entry: './handler.ts',
});
