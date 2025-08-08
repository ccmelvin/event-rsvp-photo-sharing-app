# Security Guidelines

## Authentication & Authorization
- Use Cognito groups to separate "admin" and "user" roles.
- Restrict event creation, editing, and deletion to admin users.
- Restrict photo deletion to admin users.

## Data Protection
- Validate all form inputs before storing in the backend.
- Use S3 signed URLs for photo access.
- Ensure all API calls are authorized.

## Compliance
- Never hardcode credentials or secrets.
- Ensure HTTPS is enforced in production.
