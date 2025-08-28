# Hiking Logbook

[![codecov](https://codecov.io/gh/Hikers-for-life/Hiking-Logbook/graph/badge.svg?token=HFZWUVB49J)](https://codecov.io/gh/Hikers-for-life/Hiking-Logbook)

A comprehensive hiking application that allows users to track their hiking adventures, plan trips, and connect with fellow hikers. Built with modern web technologies and a robust authentication system.

## Features

- **User Authentication** - Secure Firebase-based authentication system
- **Hike Logging** - Record and track your hiking adventures
- **Profile Management** - Customize your hiking preferences and profile
- **Achievement System** - Earn badges and track your progress
- **Social Features** - Connect with other hikers and share experiences
- **Responsive Design** - Works seamlessly on desktop and mobile devices

##  Project Structure

```
Hiking-Logbook/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── tests/              # Test files
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main application component
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
├── docs/                   # Project documentation
└── README.md               # This file
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Project** with Authentication and Firestore enabled

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Hiking-Logbook
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your Firebase configuration
# (See backend/README.md for detailed setup)

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your Firebase and API configuration
# (See frontend/README.md for detailed setup)

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database

2. **Get Configuration**
   - Go to Project Settings > General
   - Copy the Firebase config object
   - Go to Project Settings > Service Accounts
   - Generate a new private key for backend

3. **Environment Variables**
   - Backend: Copy values from service account key to `backend/.env`
   - Frontend: Copy values from Firebase config to `frontend/.env`

### Environment Files

#### Backend (`.env`)
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# ... other Firebase config
```

#### Frontend (`.env`)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `DELETE /api/auth/profile` - Delete user account (protected)

### User Management Endpoints

- `GET /api/users/:uid` - Get public user profile
- `GET /api/users/search` - Search users
- `GET /api/users/:uid/achievements` - Get user achievements
- `GET /api/users/:uid/hikes` - Get user hiking history

For detailed API documentation, see [backend/README.md](backend/README.md)

##  Authentication Flow

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

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Tests

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

##  Development

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

### Code Quality

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **TypeScript** - Type safety (can be added)

##  Security Features

- **Firebase Authentication** - Secure user authentication
- **JWT Token Verification** - Protected API endpoints
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Request data validation
- **Error Handling** - Centralized error management
- **Helmet.js** - Security headers

##  Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Configure production Firebase project
3. Set up proper CORS origins
4. Configure environment variables
5. Deploy to your preferred hosting service

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

### Development Guidelines

- Follow the existing code structure
- Add tests for new features
- Update documentation
- Follow ESLint and Prettier rules
- Use conventional commit messages

##  Support

For issues and questions:

1. Check the documentation [here](https://hikers-for-life.github.io/Hiking-Logbook/)
2. Review the backend and frontend README files
3. Check existing issues
4. Create a new issue with detailed description

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Firebase** - Authentication and database services
- **React** - Frontend framework
- **Express.js** - Backend framework
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library

---

**Happy Hiking!**


*Built with ❤️ for the hiking community*

