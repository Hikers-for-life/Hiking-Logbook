# Development API Setup Guide

This guide explains how to set up, run, and develop the Hiking Logbook backend API locally.

## Overview

The backend is an Express.js application that provides:

- **Authentication API** - User login, signup, and token verification
- **User Management API** - Profile data CRUD operations
- **Firebase Integration** - Secure authentication and database operations
- **RESTful Endpoints** - Standard HTTP API for frontend integration

## Prerequisites

Before setting up the development API, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Firebase Project** - [Create here](https://console.firebase.google.com/)
- **Firebase Service Account Key** - Downloaded from Firebase Console
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended with Node.js extensions

## Project Structure

```
backend/
├── auth.js                 # Authentication routes and middleware
├── users.js                # User management routes
├── firebaseAdmin.js        # Firebase Admin SDK configuration
├── verifyAuth.js           # JWT token verification middleware
├── createUser.js           # User creation utilities
├── server.js               # Main Express server
├── package.json            # Dependencies and scripts
├── serviceAccountKey.json  # Firebase service account credentials
├── jest.config.js          # Jest testing configuration
└── eslint.config.js        # ESLint configuration
```

## Setup Instructions

### 1. Clone and Navigate

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd Hiking-Logbook/backend

# Install dependencies
npm install
```

### 2. Firebase Configuration

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "hiking-logbook-dev")
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

#### Step 3: Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

#### Step 4: Generate Service Account Key

1. Go to Project Settings (gear icon)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Place it in the `backend/` directory

** Security Note:** Never commit `serviceAccountKey.json` to version control!

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Backend environment variables
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
```

**Note:** The Firebase values come from your `serviceAccountKey.json` file.

### 4. Verify Installation

```bash
# Check if everything is working
npm run lint
npm run format:check
npm test
```

## Running the Development API

### Start Development Server

```bash
npm start
```

This will:

- Start the Express server on `http://localhost:3000`
- Load Firebase Admin SDK
- Initialize authentication middleware
- Start listening for HTTP requests

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run dev            # Start with nodemon (if configured)

# Code Quality
npm run lint           # Check for linting issues
npm run lint:fix       # Fix linting issues automatically
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted correctly

# Testing
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## API Endpoints

### Authentication Routes (`/auth`)

```javascript
// POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}

// POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// POST /auth/verify
{
  "token": "jwt_token_here"
}
```

### User Management Routes (`/users`)

```javascript
// GET /users/profile
// Headers: Authorization: Bearer <token>

// PUT /users/profile
// Headers: Authorization: Bearer <token>
{
  "displayName": "Updated Name",
  "bio": "Hiking enthusiast",
  "preferences": {
    "difficulty": "intermediate",
    "terrain": "mountain"
  }
}

// DELETE /users/profile
// Headers: Authorization: Bearer <token>
```

## Development Workflow

### 1. Adding New Routes

```javascript
// Create a new route file (e.g., trails.js)
import express from "express";
import { verifyAuth } from "./verifyAuth.js";

const router = express.Router();

// Protected route example
router.get("/trails", verifyAuth, async (req, res) => {
  try {
    // Your route logic here
    res.json({ trails: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Add to server.js
import trailRoutes from "./trails.js";
app.use("/trails", trailRoutes);
```

### 2. Testing API Endpoints

```bash
# Test authentication endpoint
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Test protected endpoint
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Database Operations

```javascript
// Example: Creating a user document
import { db } from "./firebaseAdmin.js";

async function createUserProfile(uid, userData) {
  try {
    await db.collection("users").doc(uid).set({
      email: userData.email,
      displayName: userData.displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
}
```

## Configuration Files

### Firebase Admin Configuration

The `firebaseAdmin.js` file configures:

- Firebase Admin SDK initialization
- Firestore database connection
- Authentication service
- Custom claims and user management

### Express Server Configuration

The `server.js` file sets up:

- Express application
- Middleware (body-parser, CORS)
- Route registration
- Error handling
- Server startup

## Development Features

### Hot Reloading

- Use `nodemon` for automatic server restart
- Watch for file changes
- Preserve server state during development

### Error Handling

- Centralized error handling middleware
- Detailed error messages in development
- Proper HTTP status codes

### Logging

- Console logging for development
- Request/response logging
- Error logging with stack traces

## Debugging

### Console Logging

```javascript
// Add logging to your routes
console.log("Request body:", req.body);
console.log("User ID:", req.user.uid);
console.log("Database result:", result);
```

### VS Code Debugging

1. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### API Testing Tools

- **Postman** - GUI for API testing
- **Insomnia** - Alternative to Postman
- **curl** - Command-line testing
- **Thunder Client** - VS Code extension

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm start
```

### Firebase Connection Issues

```bash
# Verify service account key
cat serviceAccountKey.json

# Check environment variables
echo $FIREBASE_PROJECT_ID

# Verify Firebase project exists
# Check Firebase Console
```

### CORS Issues

```javascript
// Add CORS middleware to server.js
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true,
  })
);
```

### Authentication Errors

```bash
# Check JWT token format
# Verify token expiration
# Check Firebase project configuration
# Verify service account permissions
```

## Integration with Frontend

### CORS Configuration

- Frontend runs on port 3000
- Backend runs on port 3000 (different process)
- Configure CORS for cross-origin requests
- Handle preflight requests

### Authentication Flow

1. Frontend sends credentials to `/auth/login`
2. Backend verifies with Firebase
3. Backend returns JWT token
4. Frontend includes token in subsequent requests
5. Backend verifies token with `verifyAuth` middleware

## Next Steps

After setting up the development API:

1. **Read [Development Site Setup](Development_Site_Setup.md)** to understand the frontend
2. **Read [Development Database Setup](Development_Database_Setup.md)** for database configuration
3. **Follow [Running Locally](Running_Locally.md)** for complete development workflow
4. **Check [API Specification](API_Specification.md)** for detailed endpoint documentation

## Getting Help

If you encounter issues:

1. Check the server console for errors
2. Verify Firebase configuration
3. Test API endpoints with curl or Postman
4. Check the [Running Locally](Running_Locally.md) troubleshooting section
5. Contact the development team

---

_This guide covers Sprint 1 and sprint 2 backend API setup. For additional features, check the main [README](../README.md)._
