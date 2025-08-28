#  Deployment Guide

## Local Firebase Deployment (Quick Start)

### Prerequisites
1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Update `.firebaserc` with your actual Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### Deploy Frontend Only
```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Deploy Backend Only (Cloud Functions)
```bash
# Deploy Cloud Functions
firebase deploy --only functions
```

### Deploy Everything
```bash
# Build frontend first
cd frontend
npm run build
cd ..

# Deploy both hosting and functions
firebase deploy
```

## Automated GitHub Actions Deployment

### Setup (One-time)

1. **Get Firebase Service Account Key:**
```bash
# Generate service account key
firebase projects:list
firebase use your-project-id
```

2. **Add GitHub Secrets:**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON
     - `FIREBASE_PROJECT_ID`: Your Firebase project ID

3. **The GitHub Actions workflow will automatically:**
   - Run tests and linting
   - Build the frontend
   - Deploy to Firebase on successful main branch pushes

## Environment Setup

### Frontend Environment Variables
Create `frontend/.env.production`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Backend Environment Variables
Firebase Functions automatically use your project configuration.

##  Deployment Status

- **Frontend URL:** `https://your-project-id.web.app`
- **Functions URL:** `https://us-central1-your-project-id.cloudfunctions.net`

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check that all tests pass: `npm test`
   - Verify linting: `npm run lint`

2. **Firebase Deploy Fails:**
   - Verify project ID in `.firebaserc`
   - Check Firebase CLI login: `firebase whoami`

3. **Environment Variables:**
   - Ensure all required env vars are set
   - Check Firebase project settings

### Quick Commands:
```bash
# Check Firebase status
firebase projects:list
firebase use --add

# View deployment history
firebase hosting:channel:list

# Rollback if needed
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:TARGET_CHANNEL_ID
```
