# Backend Guidelines

## AWS Amplify
- Use Amplify Auth with Cognito for user sign-up, sign-in, and forgot password.
- Use Amplify GraphQL API for storing and retrieving events, RSVPs, and photos.
- Use Amplify Storage (S3) for photo uploads.

## Data Models
- Event: title, description, date, location, createdBy
- RSVP: eventID, userID, status
- Photo: eventID, userID, filePath, createdAt

## Functions
- Create a Lambda function triggered by S3 uploads to resize/compress images.
- Store resized images in a separate S3 prefix (e.g., `/thumbnails`).

## Hosting
- Deploy the frontend via Amplify Hosting.
- Enable CI/CD with GitHub or CodeCommit integration.
