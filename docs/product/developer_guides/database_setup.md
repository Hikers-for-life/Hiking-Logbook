# Database Setup Guide

This guide shows you how to set up Firebase Firestore for development.

## What You Need

- A Google account
- Node.js installed


## Why Firebase Firestore?

The project uses Firebase Firestore because it:
- Handles user authentication
- Stores data in real-time
- Works offline
- Requires no server setup

## Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `hiking-logbook-dev`
4. Click "Create project"

### 2. Set Up Database

1. Click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Pick a location close to you
5. Click "Done"

### 3. Enable Login

1. Click "Authentication"
2. Click "Get started"
3. Click "Email/Password"
4. Turn it on
5. Click "Save"

### 4. Get Service Account Key

1. In Firebase Console, click the gear icon → "Project settings"
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Save it in `backend/` folder (keep it secret!)

### 5. Configure Backend Environment

Create `backend/.env` file:

```bash
PORT=3001
NODE_ENV=development

# Copy these from your downloaded JSON file
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

### 6. Configure Frontend Environment

Create `frontend/.env` file:

```bash
# Get these from Firebase Console → Project Settings → General
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Verify Setup

Test the connection:

```bash
# Start backend
cd backend
npm start

# You should see: "Firebase initialized successfully"
```

## Common Issues

**Problem:** "Permission denied" errors
- **Solution:** Check your service account key is correct

**Problem:** "Project not found"
- **Solution:** Verify FIREBASE_PROJECT_ID matches your Firebase project

**Problem:** Frontend can't authenticate
- **Solution:** Check frontend .env has correct Firebase config


For detailed database schema and structure, see database documentation

---

_The app will create collections automatically when you start using it._
