import { S3Event, S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: S3Handler = async (event: S3Event) => {
  console.log('Image resize function triggered:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Only process images in the event-photos folder
    if (!key.startsWith('event-photos/')) {
      console.log('Skipping non-event-photo:', key);
      continue;
    }

    // Skip if it's already a thumbnail
    if (key.includes('thumbnail')) {
      console.log('Skipping thumbnail:', key);
      continue;
    }

    try {
      // Get the original image
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(getObjectCommand);
      const imageBuffer = await streamToBuffer(response.Body as NodeJS.ReadableStream);

      // Create thumbnail (300x300)
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate thumbnail key
      const thumbnailKey = key.replace('event-photos/', 'event-thumbnails/thumbnail-');

      // Upload thumbnail
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      });

      await s3Client.send(putObjectCommand);

      console.log(`Thumbnail created: ${thumbnailKey}`);
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
};

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
