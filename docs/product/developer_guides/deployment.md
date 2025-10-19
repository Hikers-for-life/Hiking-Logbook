# Deployment Guide

This guide shows you how to deploy the Hiking Logbook to production.

## What You Need

- [Database](database_setup.md) set up
- [API](api_setup.md) working locally
- [Frontend](site_setup.md) working locally
- All tests passing: `npm test`

## Deployment Options

- **Backend:** Render (free tier available)
- **Frontend:** Firebase Hosting (free tier available)
- **Database:** Firebase Firestore (already set up)

## Deploy Backend (Render)

### 1. Sign Up for Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### 2. Create Web Service

1. Click "New +" → "Web Service"
2. Select your repository
3. Configure:
   - **Name:** `hiking-logbook-api`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node

### 3. Add Environment Variables

In Render dashboard, add these:

```
PORT=3001
NODE_ENV=production
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_CLIENT_ID=your_client_id
```

### 4. Deploy

Click "Create Web Service" - Render will deploy automatically!

Your API will be at: `https://your-app-name.onrender.com`

## Deploy Frontend (Firebase Hosting)

### 1. Install Firebase Tools

```bash
npm install -g firebase-tools
firebase login
```

### 2. Update Frontend Environment

Create `frontend/.env.production`:

```env
# Same Firebase config as .env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# UPDATE THIS to your Render backend URL
REACT_APP_API_URL=https://your-app-name.onrender.com
```

### 3. Build and Deploy

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

Your app will be at: `https://your-project-id.web.app`

## After Deployment

### 1. Update Backend CORS

In `backend/src/middleware/index.js`, add your production URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',  // Development
    'https://your-project-id.web.app'  // Production - ADD THIS
  ],
  credentials: true,
}));
```

Commit and push - Render will auto-deploy.

### 2. Test Everything

Visit your URLs:
- **Frontend:** `https://your-project-id.web.app`
- **API Health:** `https://your-app-name.onrender.com/health`
- **API Docs:** `https://your-app-name.onrender.com/api-docs`

Try:
1. Create an account
2. Log a hike
3. Test GPS tracking

## Common Issues

**Frontend can't reach backend:**
- Check `REACT_APP_API_URL` in `.env.production`
- Verify CORS settings in backend

**Backend crashes on startup:**
- Check environment variables in Render
- View logs in Render dashboard

**Database errors:**
- Verify Firebase credentials are correct
- Check Firebase Console for errors

## Redeploy

```bash
# Frontend
cd frontend
npm run build
firebase deploy --only hosting

# Backend - just push to GitHub
git push origin main
# Render auto-deploys
```

## Your Live URLs

After deployment, save these:
- **App:** `https://your-project-id.web.app`
- **API:** `https://your-app-name.onrender.com`
- **Docs:** `https://your-app-name.onrender.com/api-docs`



