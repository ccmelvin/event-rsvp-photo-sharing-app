# Event RSVP & Photo Sharing App

A full-stack web application built with Next.js 14, AWS Amplify Gen 2, TypeScript, Tailwind CSS, and Framer Motion for creating events, managing RSVPs, and sharing photos.

## Features

- **Event Management**: Create, view, and manage events
- **RSVP System**: Users can RSVP to events (Attending, Maybe, Not Attending)
- **Photo Sharing**: Upload and share photos from events
- **User Authentication**: Secure sign-up/sign-in with AWS Cognito
- **Admin Dashboard**: Manage your events and moderate photos
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live updates using AWS AppSync GraphQL
- **Image Processing**: Automatic thumbnail generation with Lambda

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Amplify UI Components** for authentication

### Backend (AWS Amplify Gen 2)
- **AWS Cognito** for authentication
- **AWS AppSync** for GraphQL API
- **Amazon DynamoDB** for data storage
- **Amazon S3** for photo storage
- **AWS Lambda** for image processing
- **Amplify Hosting** for deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account
- AWS CLI configured with appropriate permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-rsvp-photo-sharing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Amplify sandbox**
   ```bash
   npm run amplify:sandbox
   ```
   This will:
   - Deploy your backend to AWS
   - Generate the `amplify_outputs.json` file
   - Set up authentication, API, and storage

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication page
│   ├── events/            # Event pages
│   │   ├── create/        # Create event page
│   │   └── [id]/          # Event detail page
│   ├── gallery/           # Photo gallery
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── Navbar.tsx         # Navigation component
├── lib/                   # Utility functions
│   └── amplify.ts         # Amplify configuration
└── types/                 # TypeScript type definitions
    └── index.ts           # App types

amplify/                   # Amplify Gen 2 backend
├── auth/                  # Authentication configuration
├── data/                  # GraphQL schema and resolvers
├── functions/             # Lambda functions
│   └── image-resize/      # Image processing function
├── storage/               # S3 storage configuration
└── backend.ts             # Backend configuration
```

## Key Features Explained

### Authentication
- Users can sign up with email, first name, and last name
- Secure authentication powered by AWS Cognito
- Protected routes for authenticated users

### Event Management
- Create public/private events with date, location, and description
- Set maximum attendee limits
- View all public events on the events page

### RSVP System
- Three RSVP options: Attending, Maybe, Not Attending
- Real-time RSVP updates
- Track attendance for each event

### Photo Sharing
- Upload multiple photos to event galleries
- Automatic thumbnail generation via Lambda
- Photo moderation system for admins
- Secure storage in Amazon S3

### Admin Features
- Manage your created events
- Moderate uploaded photos (approve/reject)
- View event statistics

## Deployment

### Deploy to AWS Amplify Hosting

1. **Connect your repository to Amplify**
   ```bash
   npm run amplify:deploy
   ```

2. **Configure build settings**
   The app will automatically detect the Next.js framework and configure build settings.

3. **Environment Variables**
   No additional environment variables needed - Amplify handles configuration automatically.

## GraphQL Schema

The app uses the following main data models:

- **Event**: Event information (title, date, location, etc.)
- **RSVP**: User responses to events
- **Photo**: Event photos with metadata
- **UserProfile**: Extended user information

## Security

- **Authentication**: All API calls require valid JWT tokens
- **Authorization**: Row-level security ensures users can only access their own data
- **File Upload**: Secure file uploads to S3 with size and type restrictions
- **Photo Moderation**: Admin approval required for photo visibility

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js and AWS Amplify
