# Hiking Logbook Frontend Setup Guide

This guide explains how to set up and develop the Hiking Logbook React frontend application.

## Overview

The frontend is a React.js application with these key features:

- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router** - Client-side routing for navigation
- **Leaflet Maps** - Interactive maps for GPS route visualization
- **Firebase Auth** - User authentication and profile management
- **Jest & Testing Library** - Testing framework for components

## Before You Start

You need:
- Node.js installed on your computer
- [Database](database_setup.md) set up first
- [API](api_setup.md) running

## What's Inside

The frontend has:
- **Components** - Reusable pieces like buttons and forms
- **Pages** - Main screens like Dashboard and Logbook
- **Services** - Code that talks to the backend API
- **Tests** - Code that checks everything works

## Setup Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment

Create `frontend/.env` file:

```env
# Get these from Firebase Console > Project Settings
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Backend API URL
REACT_APP_API_URL=http://localhost:3001
```

### 3. Start the App

```bash
npm start
```

The app will open at **http://localhost:3000**

## What You Can Do

- **Log hikes** with GPS tracking
- **View interactive maps** of your routes
- **Track achievements** and goals
- **Connect with friends** and see their activities
- **Plan future hikes** and manage gear

## Test It Works

```bash
# Run tests to make sure everything works
npm test
```

## If Something Goes Wrong

1. **Port busy:** Run `npx kill-port 3000`
2. **Can't connect to backend:** Check backend is running on port 3001
3. **Firebase errors:** Check your `.env` file has correct values


