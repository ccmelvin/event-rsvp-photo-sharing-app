# Project Guidelines

## Architecture
- Use Next.js 14 App Router with TypeScript.
- Use Tailwind CSS for styling; no plain CSS or inline styles unless necessary.
- Use Framer Motion for page transitions and simple animations.
- Use AWS Amplify for backend (Auth with Cognito, GraphQL API, S3 Storage, Hosting).
- Prefer Amplify UI React components where suitable.
- Keep pages responsive and mobile-friendly.

## Backend Rules
- All event, RSVP, and photo data must be stored via Amplify GraphQL API models.
- All photo uploads must go to S3 using Amplify Storage.
- Image resizing/compression must happen in a Lambda triggered by S3 uploads.

## Code Style
- Follow TypeScript strict mode.
- Use functional components and React hooks.
- Use Amplify DataStore or GraphQL API hooks for data fetching.
- Keep components small and reusable.
- Use consistent file naming: `PascalCase` for components, `camelCase` for helpers.

## Security
- Restrict event creation/deletion to admin users (Amplify Auth groups).
- Validate all inputs before storing in backend.
- Use S3 signed URLs for photo access.
