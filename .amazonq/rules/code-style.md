# Code Style Guidelines

## General
- TypeScript strict mode enabled.
- Use functional components and React hooks.
- Consistent file naming: PascalCase for components, camelCase for helpers.
- Avoid inline styles — use Tailwind utilities.

## State & Data
- Use Amplify GraphQL hooks or DataStore for data fetching.
- Keep state local unless it must be shared — then use React context or Zustand.

## Testing
- Include unit tests for reusable components.
- Test GraphQL queries/mutations where possible.

## Performance
- Optimize queries to fetch only needed fields.
- Use `next/image` for all images.
