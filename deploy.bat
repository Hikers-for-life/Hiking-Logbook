@echo off
echo 🚀 Starting Firebase deployment for Hiking Logbook...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please run:
    echo firebase login
    pause
    exit /b 1
)

echo ✅ Firebase CLI is ready

REM Build frontend
echo 🏗️  Building frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend built successfully
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    pause
    exit /b 1
)
cd ..

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
firebase deploy

if %errorlevel% equ 0 (
    echo 🎉 Deployment completed successfully!
    echo.
    echo 📱 Your app is now live at:
    echo Check Firebase Console for your hosting URL
    echo.
    echo 🔧 Your API is available at:
    echo https://your-region-your-project-id.cloudfunctions.net/api
    echo.
    echo 📚 Next steps:
    echo 1. Update your .firebaserc file with your actual project ID
    echo 2. Configure environment variables in Firebase Console
    echo 3. Test your deployed application
) else (
    echo ❌ Deployment failed. Please check the error messages above.
)

pause
