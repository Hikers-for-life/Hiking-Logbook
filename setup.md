# 🚀 Quick Setup Guide

This guide will help you get the Hiking Logbook application running in under 10 minutes!

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Firebase Account** - [Sign up here](https://firebase.google.com/)

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Hiking-Logbook
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Firebase Setup (5 minutes)

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create a project"**
3. **Enter project name**: `hiking-logbook-dev`
4. **Enable Google Analytics**: No (for simplicity)
5. **Click "Create project"**

#### Enable Authentication
1. **Click "Authentication" in left sidebar**
2. **Click "Get started"**
3. **Click "Email/Password"**
4. **Enable it and click "Save"**

#### Enable Firestore
1. **Click "Firestore Database" in left sidebar**
2. **Click "Create database"**
3. **Choose "Start in test mode"**
4. **Select location close to you**
5. **Click "Done"**

#### Get Configuration
1. **Click the gear icon (Project Settings)**
2. **Click "Project settings"**
3. **Scroll down to "Your apps"**
4. **Click the web icon (</>)**
5. **Enter app nickname**: `hiking-logbook-web`
6. **Click "Register app"**
7. **Copy the config object**

#### Get Service Account Key
1. **In Project Settings, click "Service accounts" tab**
2. **Click "Generate new private key"**
3. **Download the JSON file**
4. **Keep this file safe!**

### 3. Environment Configuration

#### Backend Setup
```bash
cd backend

# Copy environment template
cp env.example .env

# Edit .env with your Firebase values
# (Use the service account key JSON values)
```

**Example backend `.env`:**
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=hiking-logbook-dev
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@hiking-logbook-dev.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abc123%40hiking-logbook-dev.iam.gserviceaccount.com
```

#### Frontend Setup
```bash
cd frontend

# Copy environment template
cp env.example .env

# Edit .env with your Firebase values
# (Use the web app config values)
```

**Example frontend `.env`:**
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=AIzaSyABC123...
REACT_APP_FIREBASE_AUTH_DOMAIN=hiking-logbook-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hiking-logbook-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=hiking-logbook-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3001
📱 Environment: development
🔗 Health check: http://localhost:3001/health
🔐 Auth API: http://localhost:3001/api/auth
👥 Users API: http://localhost:3001/api/users
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view hiking-logbook in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000
```

### 5. Test the Application

1. **Open [http://localhost:3000](http://localhost:3000)**
2. **Click "Get Started"**
3. **Create a new account**
4. **Sign in**
5. **Explore the dashboard!**

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
- **Check Firebase configuration** in `.env`
- **Verify service account key** is correct
- **Check port 3001** is not in use

#### Frontend won't start
- **Check Firebase configuration** in `.env`
- **Verify API URL** points to backend
- **Check port 3000** is not in use

#### Authentication errors
- **Verify Firebase project** has Authentication enabled
- **Check Email/Password** sign-in method is enabled
- **Verify environment variables** are correct

#### Database errors
- **Verify Firestore** is enabled in Firebase
- **Check service account** has proper permissions
- **Verify collection rules** allow read/write

### Port Conflicts

If ports are in use:

```bash
# Kill processes on specific ports
npx kill-port 3000 3001

# Or use different ports
# Backend: PORT=3002 npm run dev
# Frontend: PORT=3003 npm start
```

### Firebase Issues

- **Check project ID** matches in both configs
- **Verify service account** has proper roles
- **Check Firestore rules** allow access
- **Verify Authentication** is properly configured

## 📚 Next Steps

After successful setup:

1. **Read the [main README](README.md)** for detailed documentation
2. **Check [backend README](backend/README.md)** for API details
3. **Explore the codebase** to understand the structure
4. **Add your first hike** to test the system
5. **Customize the application** for your needs

## 🆘 Need Help?

- **Check the logs** in both terminal windows
- **Verify environment variables** are set correctly
- **Check Firebase Console** for any errors
- **Review the documentation** in the `docs/` folder
- **Create an issue** with detailed error description

---

**🎉 Congratulations! You're ready to start hiking! 🏔️**

*The application is now running with full authentication and database functionality.*
