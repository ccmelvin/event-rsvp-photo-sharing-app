# Frontend Guidelines

## Framework & Structure
- Use Next.js 14 with App Router and TypeScript.
- Use Tailwind CSS for all styling — no plain CSS or SCSS unless absolutely necessary.
- Use Framer Motion for page transitions and small animations.
- Pages required: Event List, Event Detail (RSVP + Gallery), Login/Register, Admin Dashboard.
- All pages must be responsive and mobile-friendly.

## Components
- Use Amplify UI React components when appropriate.
- Keep components small, reusable, and organized in a `/components` directory.
- Use semantic HTML for accessibility.
- Optimize images with `next/image` for performance.

## UX
- Event pages must load quickly with clear RSVP and photo upload actions.
- Use skeleton loaders or shimmer effects while data loads.
- Show friendly error messages on failures.
