# Hiking Logbook Backend API

A well-structured Express.js backend API for the Hiking Logbook application with Firebase integration and proper authentication.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── firebase.js   # Firebase Admin SDK setup
│   │   └── database.js   # Database utilities and collections
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # Authentication middleware
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication routes
│   │   └── users.js      # User management routes
│   ├── services/         # Business logic
│   │   └── authService.js # Authentication service
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── package.json          # Dependencies and scripts
├── env.example           # Environment variables template
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and fill in your Firebase configuration:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS
- Firebase configuration from your service account key

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Go to Project Settings > Service Accounts
6. Generate new private key
7. Copy values to your `.env` file

## 📚 API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - User registration
- `GET /profile` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `DELETE /profile` - Delete user account (protected)
- `POST /verify-email` - Verify email (protected)
- `GET /health` - Health check

### Users (`/api/users`)

- `GET /:uid` - Get public user profile
- `GET /search` - Search users
- `GET /:uid/achievements` - Get user achievements
- `GET /:uid/hikes` - Get user hiking history
- `POST /:uid/follow` - Follow user (protected)
- `DELETE /:uid/follow` - Unfollow user (protected)

## 🛡️ Authentication

The API uses Firebase Admin SDK for authentication:

1. **Frontend** handles user login/signup with Firebase Client SDK
2. **Frontend** sends Firebase ID token in Authorization header
3. **Backend** verifies token with Firebase Admin SDK
4. **Protected routes** use `verifyAuth` middleware

### Example Protected Request

```javascript
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and use in `src/server.js`
3. Add tests in `tests/` directory

### Adding New Services

1. Create service file in `src/services/`
2. Export class with static methods
3. Import in route files

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input validation** - Request data validation
- **Error handling** - Centralized error handling
- **Authentication** - JWT token verification
- **Rate limiting** - (Can be added with express-rate-limit)

## 📊 Database Schema

### Users Collection

```javascript
{
  uid: "string",           // Firebase Auth UID
  email: "string",         // User email
  displayName: "string",   // Display name
  bio: "string",          // User bio
  location: "string",     // User location
  photoURL: "string",     // Profile photo URL
  preferences: {           // User preferences
    difficulty: "string",  // beginner/intermediate/advanced
    terrain: "string",     // mountain/forest/desert/mixed
    distance: "string"     // short/medium/long
  },
  stats: {                 // User statistics
    totalHikes: "number",
    totalDistance: "number",
    totalElevation: "number",
    achievements: ["array"]
  },
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate resources)
- **500** - Internal Server Error

## 🔄 API Versioning

Currently using v1 (implicit). For future versions, consider:

- URL versioning: `/api/v1/auth`
- Header versioning: `Accept: application/vnd.api+json;version=1`
- Query parameter: `/api/auth?v=1`

## 📈 Performance

- **Connection pooling** - Firebase Admin SDK handles connections
- **Caching** - Can be added with Redis
- **Compression** - Can be added with compression middleware
- **Rate limiting** - Can be added for production

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production Firebase project
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS
- [ ] Set up CI/CD pipeline

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
# Firebase production config
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow ESLint and Prettier rules
5. Use conventional commit messages

## 📞 Support

For issues and questions:

1. Check the [main project README](../../README.md)
2. Review [API documentation](../../docs/product/architecture/api_specifications.md)
3. Check existing issues
4. Create new issue with detailed description

## 📄 License

MIT License - see [main project LICENSE](../../LICENSE) for details.
