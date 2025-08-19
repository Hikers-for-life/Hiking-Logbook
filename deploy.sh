#!/bin/bash

echo "🚀 Starting Firebase deployment for Hiking Logbook..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📱 Your app is now live at:"
    firebase hosting:channel:list 2>/dev/null | grep "Live" | awk '{print $2}' || echo "Check Firebase Console for your hosting URL"
    echo ""
    echo "🔧 Your API is available at:"
    echo "https://your-region-your-project-id.cloudfunctions.net/api"
    echo ""
    echo "📚 Next steps:"
    echo "1. Update your .firebaserc file with your actual project ID"
    echo "2. Configure environment variables in Firebase Console"
    echo "3. Test your deployed application"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
