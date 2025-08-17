# Development Database Setup Guide

This guide explains how to set up, configure, and manage the Hiking Logbook development database using Firebase Firestore for Sprint 1.

## Overview

The Hiking Logbook uses **Firebase Firestore** as its primary database, providing:

- **NoSQL Document Database** - Flexible schema for user data
- **Real-time Updates** - Live data synchronization across clients
- **Scalable Infrastructure** - Handles growth without manual scaling
- **Security Rules** - Fine-grained access control for data protection
- **Offline Support** - Data persistence when network is unavailable

## Prerequisites

Before setting up the development database, ensure you have:

- **Firebase Project** - [Create here](https://console.firebase.google.com/)
- **Firebase CLI** - [Install here](https://firebase.google.com/docs/cli)
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended with Firebase extensions

## Database Structure (Sprint 1)

### Collections Overview

```
hiking-logbook/
├── users/                    # User profiles and authentication data (Sprint 1)
│   └── {userId}/            # Individual user documents
│       ├── uid              # Firebase Auth UID (document ID)
│       ├── displayName      # User's display name
│       ├── email            # User's email address
│       ├── photoURL         # Profile picture URL
│       ├── bio              # User biography
│       ├── location         # User's location (GeoPoint)
│       └── createdAt        # Account creation timestamp
```

**Note:** This is the Sprint 1 scope. Additional collections (hikes, trails, photos, etc.) will be added in future sprints.

## Setup Instructions

### 1. Firebase Project Setup

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `hiking-logbook-dev`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

#### Step 3: Configure Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### 2. Firebase CLI Setup

#### Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

#### Login to Firebase

```bash
# Login with your Google account
firebase login

# Verify you're logged in
firebase projects:list
```

#### Initialize Firebase in Project

```bash
# Navigate to project root
cd Hiking-Logbook

# Initialize Firebase
firebase init

# Select options:
# - Firestore: Configure security rules and indexes
# - Hosting: Configure files for Firebase Hosting
# - Use existing project: Select your hiking-logbook-dev project
```

### 3. Database Configuration Files

#### Firestore Security Rules

Create `firestore.rules` in the project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile (Sprint 1)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "email",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 4. Backend Integration

#### Service Account Setup

1. In Firebase Console, go to Project Settings (gear icon)
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Place it in the `backend/` directory

#### Environment Variables

Create `.env` in the backend directory:

```bash
# Firebase configuration
FIREBASE_PROJECT_ID=hiking-logbook-dev
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hiking-logbook-dev.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40hiking-logbook-dev.iam.gserviceaccount.com
```

## Database Operations (Sprint 1)

### 1. User Management

#### Create User Profile

```javascript
// In backend/createUser.js
import admin from "firebase-admin";
import db from "./firebaseAdmin.js";

export async function createUserProfile(uid, userData) {
  try {
    const userRef = db.collection("users").doc(uid);

    await userRef.set({
      uid: uid,
      displayName: userData.displayName,
      email: userData.email,
      photoURL: userData.photoURL || "",
      bio: userData.bio || "",
      location: new admin.firestore.GeoPoint(
        userData.latitude || 0,
        userData.longitude || 0
      ),
      createdAt: new Date(),
    });

    return { success: true, userId: uid };
  } catch (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }
}
```

#### Update User Profile

```javascript
// In backend/users.js
export async function updateUserProfile(uid, updates) {
  try {
    const userRef = db.collection("users").doc(uid);

    // Only allow updating specific fields
    const allowedUpdates = {};
    if (updates.displayName) allowedUpdates.displayName = updates.displayName;
    if (updates.bio) allowedUpdates.bio = updates.bio;
    if (updates.photoURL) allowedUpdates.photoURL = updates.photoURL;
    if (updates.location) {
      allowedUpdates.location = new admin.firestore.GeoPoint(
        updates.location.latitude,
        updates.location.longitude
      );
    }

    await userRef.update(allowedUpdates);

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}
```

#### Get User Profile

```javascript
// Get user profile by UID
export async function getUserProfile(uid) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    return userDoc.data();
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
}
```

## Database Configuration

### Firestore Rules Deployment

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Local Development

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# This will start Firestore on localhost:8080
# Update your backend configuration to use the emulator
```

### Production Deployment

```bash
# Deploy to production
firebase deploy --only firestore

# This will deploy rules and indexes to your production project
```

## Development Features

### Real-time Listeners

```javascript
// Frontend: Listen for real-time user profile updates
import { db } from "./firebase.js";

const unsubscribe = db
  .collection("users")
  .doc(currentUser.uid)
  .onSnapshot((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      console.log("User profile updated:", userData);
      // Update your app state here
    }
  });
```

### Offline Persistence

```javascript
// Enable offline persistence
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log("Persistence failed");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support persistence
    console.log("Persistence not supported");
  }
});
```

## Database Management

### Firebase Console

- **Data Viewer** - Browse and edit user documents
- **Rules Editor** - Modify security rules
- **Indexes** - Manage database indexes
- **Usage** - Monitor database usage and costs

### Firebase CLI Commands

```bash
# View database rules
firebase firestore:rules:get

# Export data
firebase firestore:export ./backup

# Import data
firebase firestore:import ./backup

# View indexes
firebase firestore:indexes
```

### Data Validation

```javascript
// Example: Validate user data before saving
function validateUserData(userData) {
  const errors = [];

  if (!userData.displayName || userData.displayName.trim() === "") {
    errors.push("Display name is required");
  }

  if (!userData.email || !userData.email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (userData.bio && userData.bio.length > 500) {
    errors.push("Bio must be 500 characters or less");
  }

  return errors;
}
```

## Common Issues & Solutions

### Permission Denied Errors

```javascript
// Check if user is authenticated
if (!request.auth) {
  return false;
}

// Check if user owns the document
return request.auth.uid == resource.data.uid;
```

### Index Errors

```bash
# Create missing indexes
firebase deploy --only firestore:indexes

# Check index status in Firebase Console
# Wait for indexes to build (may take several minutes)
```

### Quota Exceeded

- Check Firebase Console for usage limits
- Implement pagination for large queries
- Use offline persistence to reduce API calls
- Consider upgrading Firebase plan

### Data Type Issues

```javascript
// Ensure consistent data types
const userData = {
  uid: String(userData.uid), // Ensure string
  displayName: String(userData.displayName), // Ensure string
  bio: String(userData.bio || ""), // Ensure string with default
  location: new admin.firestore.GeoPoint(
    Number(userData.latitude) || 0, // Ensure number
    Number(userData.longitude) || 0 // Ensure number
  ),
};
```

## Integration with Backend

### Firebase Admin SDK

```javascript
// In backend/firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
```

### Environment Variables

```bash
# Backend .env file
FIREBASE_PROJECT_ID=hiking-logbook-dev
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hiking-logbook-dev.iam.gserviceaccount.com
```

## Next Steps

After setting up the development database:

1. **Read [Development Site Setup](Dev_Site_Setup.md)** to understand the frontend
2. **Read [Development API Setup](Dev_API_Setup.md)** for backend configuration
3. **Follow [Running Locally](Running_Locally.md)** for complete development workflow
4. **Check [Database Schema](../Architecture%20Design/Database_Schema.md)** for detailed data structure documentation

## Getting Help

If you encounter database issues:

1. Check Firebase Console for errors
2. Verify security rules and indexes
3. Test queries with Firebase Console
4. Check the [Running Locally](Running_Locally.md) troubleshooting section
5. Contact the development team

---

_This guide covers Sprint 1 database setup (users collection only). For additional features, check the main [README](../README.md)._
