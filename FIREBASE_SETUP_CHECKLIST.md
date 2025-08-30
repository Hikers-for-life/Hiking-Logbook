# Firebase Setup Checklist

## ✅ Pre-Deployment Checklist

### 1. Firebase Project Setup
- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication service
- [ ] Enable Firestore Database service
- [ ] Enable Hosting service
- [ ] Enable Functions service
- [ ] Note down your Project ID

### 2. Environment Configuration
- [ ] Copy backend `.env.example` to `.env` and fill in Firebase values
- [ ] Copy frontend `env.example` to `.env` and fill in Firebase values
- [ ] Get service account key from Firebase Console → Project Settings → Service Accounts
- [ ] Get web app config from Firebase Console → Project Settings → General

### 3. Firebase CLI Setup
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Initialize project: `firebase init` (select hosting and functions)
- [ ] Update `.firebaserc` with your actual project ID

### 4. Code Preparation
- [ ] Ensure all dependencies are installed in both frontend and backend
- [ ] Test that the app builds locally: `npm run build` in frontend
- [ ] Test that the backend runs locally: `npm start` in backend

## 🚀 Deployment Steps

### Option 1: Automated Deployment (Recommended)
```bash
# On Windows
deploy.bat

# On Mac/Linux
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Build frontend
cd frontend
npm run build
cd ..

# 2. Deploy everything
firebase deploy
```

## 🔧 Post-Deployment

- [ ] Test your deployed frontend
- [ ] Test your deployed API endpoints
- [ ] Verify authentication works
- [ ] Check Firebase Console for any errors
- [ ] Monitor function logs: `firebase functions:log`

## 📱 Your URLs After Deployment

- **Frontend**: `https://your-project-id.web.app`
- **API**: `https://your-region-your-project-id.cloudfunctions.net/api`
- **Firebase Console**: `https://console.firebase.google.com/project/your-project-id`

## 🆘 Troubleshooting

### Common Issues:
- **Build fails**: Check Node.js version (need 18+)
- **Deploy fails**: Ensure you're logged in and have project access
- **CORS errors**: Check backend CORS configuration
- **Environment variables**: Verify all required variables are set

### Useful Commands:
```bash
firebase projects:list          # List your projects
firebase use your-project-id    # Switch to specific project
firebase emulators:start        # Test locally
firebase functions:log          # View function logs
```
