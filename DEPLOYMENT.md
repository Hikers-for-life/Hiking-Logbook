# Firebase Deployment Guide for Hiking Logbook

## Prerequisites

1. **Firebase Account**: You need a Google account and Firebase project
2. **Node.js**: Version 18 or higher
3. **Firebase CLI**: Installed globally

## Step-by-Step Deployment

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - **Authentication** (for user management)
   - **Firestore** (for database)
   - **Hosting** (for frontend)
   - **Functions** (for backend API)

### 2. Configure Environment Variables

#### Backend (.env file in backend/ directory)
```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

#### Frontend (.env file in frontend/ directory)
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=https://your-region-your-project-id.cloudfunctions.net/api
```

### 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Download service account key (JSON file)
3. Copy the values to your backend .env file
4. Copy the web app config to your frontend .env file

### 4. Deploy Backend (Firebase Functions)

```bash
cd backend
npm install
npm run deploy
```

### 5. Deploy Frontend (Firebase Hosting)

```bash
cd frontend
npm install
npm run build
cd ..
firebase deploy --only hosting
```

### 6. Deploy Everything

```bash
firebase deploy
```

## Project Structure After Deployment

```
Hiking-Logbook/
├── firebase.json          # Main Firebase config
├── .firebaserc           # Project configuration
├── frontend/
│   ├── build/            # Built React app (deployed to hosting)
│   └── src/
├── backend/
│   ├── index.js          # Firebase Functions entry point
│   └── src/              # Original backend code
└── DEPLOYMENT.md         # This file
```

## Environment Variables Setup

### Backend Environment Variables
- Copy from your Firebase service account JSON
- Set in Firebase Functions environment:
  ```bash
  firebase functions:config:set firebase.project_id="your-project-id"
  firebase functions:config:set firebase.private_key="your-private-key"
  # ... etc
  ```

### Frontend Environment Variables
- Set in Firebase Hosting environment or build-time
- Use REACT_APP_ prefix for Create React App

## Testing Deployment

1. **Backend**: Test your API endpoints at the Firebase Functions URL
2. **Frontend**: Visit your Firebase Hosting URL
3. **Integration**: Ensure frontend can communicate with backend

## Troubleshooting

### Common Issues:
1. **CORS errors**: Ensure backend CORS is configured for your frontend domain
2. **Environment variables**: Check that all required variables are set
3. **Build errors**: Verify Node.js version compatibility
4. **Deployment failures**: Check Firebase project permissions

### Useful Commands:
```bash
# View Firebase Functions logs
firebase functions:log

# Test locally
firebase emulators:start

# Check deployment status
firebase projects:list
```

## Security Considerations

1. **Environment Variables**: Never commit .env files to version control
2. **Firebase Rules**: Configure Firestore security rules
3. **Authentication**: Set up proper user authentication flows
4. **API Keys**: Restrict API key usage in Google Cloud Console

## Cost Optimization

1. **Functions**: Monitor function execution time and memory usage
2. **Hosting**: Use appropriate hosting plan for your traffic
3. **Database**: Optimize Firestore queries and indexes
4. **Storage**: Implement proper cleanup and lifecycle policies
