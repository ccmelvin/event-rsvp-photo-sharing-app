# Frontend Guidelines

## Framework & Structure
- Use Next.js 14 with App Router and TypeScript.
- Use Tailwind CSS for all styling — no plain CSS or SCSS unless absolutely necessary.
- Use Framer Motion for page transitions and small animations.
- Pages implemented: Home, Event List, Event Detail (RSVP + Gallery), Create Event, Login/Register, Admin Dashboard, Gallery.
- All pages are responsive and mobile-friendly.

## Components
- Use Amplify UI React components when appropriate.
- Keep components small, reusable, and organized in a `/components` directory.
- Custom components: Modal, PhotoDisplay, PhotoGallery, AmplifyProvider, Navbar.
- Use semantic HTML for accessibility.
- Optimize images with `next/image` for performance.

## Button Styling
- Primary buttons: `bg-gray-800 hover:bg-gray-900 text-white`
- Secondary buttons: `bg-gray-200 hover:bg-gray-300 text-gray-700`
- Danger buttons: `bg-red-600 hover:bg-red-700 text-white`
- All buttons use consistent dark theme with white text for primary actions.

## Authentication
- Uses AWS Amplify Authenticator with custom styling.
- Sign out redirects to home page using `window.location.href`.
- Protected routes check for user authentication.

## Photo Management
- Photos auto-approved (`isApproved: true`) for immediate display.
- S3 file deletion integrated with database record deletion.
- Custom modal dialogs replace browser confirm dialogs.

## UX
- Event pages load quickly with clear RSVP and photo upload actions.
- Custom loading spinners and empty states.
- Custom modal components for confirmations.
- Friendly error messages on failures.
- No external API dependencies to maintain free tier.
