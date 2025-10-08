# API Setup Guide

This guide shows you how to set up the backend API for development.

## What You Need

- Node.js (v18 or higher) installed
- [Database setup](database_setup.md) completed
- Code editor (VS Code recommended)

## What the API Does

The backend API provides:
- User authentication and profiles
- Hike logging with GPS tracking
- Achievement and goal tracking
- Social features (friends, activity feed)
- Public API for external developers
- Interactive API documentation (Swagger)

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `backend/.env` file (if not done in database setup):

```bash
PORT=3001
NODE_ENV=development

# Firebase credentials (from database setup)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

### 3. Start the Server

```bash
npm start
```

You should see:
```
Server running on port 3001
Environment: development
Health check: http://localhost:3001/health
API Docs: http://localhost:3001/api-docs
```

### 4. Test the API

Open your browser and visit:
- **Health Check:** http://localhost:3001/health
- **API Documentation:** http://localhost:3001/api-docs

You should see the API is running!

## Available Scripts

```bash
npm start              # Start the server
npm run dev            # Start with auto-reload (nodemon)
npm test               # Run tests
npm run test:coverage  # Run tests with coverage
npm run lint           # Check code style
npm run lint:fix       # Fix code style issues
```

## Project Structure

```
backend/
├── src/
│   ├── server.js          # Main server file
│   ├── config/            # Configuration files
│   ├── middleware/        # Authentication, error handling
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── models/            # Database schemas
│   └── tests/             # Test files
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## Main API Routes

The API provides these endpoints:

- `/api/auth` - Login, signup, token verification
- `/api/users` - User profiles and preferences
- `/api/hikes` - Hike logging and GPS tracking
- `/api/goals` - Goals and achievements
- `/api/friends` - Friend system
- `/api/feed` - Activity feed
- `/api/gear` - Gear management
- `/api/discover` - Popular locations
- `/api/planned-hikes` - Future hike planning
- `/api/public` - Public API (no auth required)

For detailed documentation:
- **Public API documentation:** http://localhost:3001/api-docs (Swagger)
- **Internal API documentation:** See [API Documentation](../api_documentation.md)

## Development Workflow

### Adding a New Feature

1. **Create route file** in `src/routes/`
2. **Create service file** in `src/services/`
3. **Add route** to `src/server.js`
4. **Write tests** in `src/tests/`
5. **Test locally** with Swagger or Postman

### Example: Testing an Endpoint

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test public stats (no auth)
curl http://localhost:3001/api/public/stats

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/users/profile
```

## Common Issues

**Problem:** Port 3001 already in use
```bash
# Solution: Kill the process
npx kill-port 3001
```

**Problem:** Firebase connection error
- **Solution:** Check `.env` file has correct Firebase credentials
- Verify Firebase project is active in Firebase Console

**Problem:** "Cannot find module" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** CORS errors from frontend
- **Solution:** Check `src/middleware/index.js` allows `http://localhost:3000`

## Testing

Run tests to verify everything works:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## Next Steps

- [Set up the Frontend](site_setup.md) to connect to this API
- [Deploy to production](deployment.md) when ready
- Explore public API documentation at http://localhost:3001/api-docs

---

_The frontend will connect to http://localhost:3001_