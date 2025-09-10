# Development Site Setup Guide

This guide explains how to set up, run, and develop the Hiking Logbook frontend application locally.

## Overview

The frontend is a React.js application built with:

- **React 19** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for navigation
- **Jest & Testing Library** - Testing framework for components

## Prerequisites

Before setting up the development site, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended with React extensions

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── index.html         # Main HTML template
│   ├── favicon.ico        # Site icon
│   └── manifest.json      # PWA manifest
├── src/                   # Source code
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS and styling
│   ├── App.js            # Main App component
│   └── index.js          # Application entry point
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Setup Instructions

### 1. Clone and Navigate

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd Hiking-Logbook/frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
# Frontend environment variables
REACT_APP_API_URL=http://localhost:3000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

**Note:** Replace the Firebase values with your actual Firebase project credentials.

### 3. Verify Installation

```bash
# Check if everything is working
npm run lint
npm run format:check
```

## Running the Development Site

### Start Development Server

```bash
npm start
```

This will:

- Start the development server on `http://localhost:3000`
- Open your browser automatically
- Enable hot reloading for development
- Show compilation errors in the browser

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run build          # Build for production
npm run eject          # Eject from Create React App (irreversible)

# Code Quality
npm run lint           # Check for linting issues
npm run lint:fix       # Fix linting issues automatically
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted correctly

# Testing
npm test               # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## Development Workflow

### 1. Component Development

```bash
# Create a new component
mkdir src/components/NewComponent
touch src/components/NewComponent/NewComponent.js
touch src/components/NewComponent/NewComponent.test.js
```

### 2. Styling with Tailwind

```jsx
// Example component with Tailwind classes
function Button({ children, onClick, variant = "primary" }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 3. Testing Components

```bash
# Run tests for a specific file
npm test -- NewComponent.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (default)
npm test
```

## Configuration Files

### Tailwind CSS Configuration

The `tailwind.config.js` file configures:

- Color palette
- Spacing scale
- Breakpoints
- Custom components
- Plugin configurations

### PostCSS Configuration

The `postcss.config.js` file sets up:

- Tailwind CSS processing
- Autoprefixer for browser compatibility
- CSS optimization

## Development Features

### Hot Reloading

- Changes to source code automatically refresh the browser
- Preserves component state during development
- Fast feedback loop for UI changes

### Error Overlay

- Compilation errors displayed in browser
- Runtime errors with stack traces
- Click to navigate to error location

### Source Maps

- Debug original source code in browser dev tools
- Set breakpoints in TypeScript/JSX files
- Full debugging experience

## Debugging

### Browser Developer Tools

- **React DevTools** extension for component inspection
- **Network tab** for API calls
- **Console** for logging and errors
- **Elements tab** for DOM inspection

### VS Code Integration

- **ESLint** extension for real-time linting
- **Prettier** extension for code formatting
- **React snippets** for faster development
- **Debugger** for breakpoint debugging

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm start
```

### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Check for syntax errors
npm run lint

# Verify environment variables
echo $REACT_APP_API_URL
```

## Responsive Development

### Mobile-First Approach

- Design for mobile devices first
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`)
- Test on various screen sizes

### Browser Testing

- Test on Chrome, Firefox, Safari, Edge
- Use browser dev tools device simulation
- Test on actual mobile devices

## Integration with Backend

### API Calls

- Frontend runs on port 3000
- Backend API runs on port 3000 (different process)
- Use `REACT_APP_API_URL` environment variable
- Handle CORS if needed

### Authentication Flow

- Firebase Authentication integration
- JWT token management
- Protected routes implementation
- User state management

## Next Steps

After setting up the development site:

1. **Read [Development API Setup](Dev_API_Setup.md)** to understand the backend
2. **Read [Development Database Setup](Dev_Database_Setup.md)** for database configuration
3. **Follow [Running Locally](Running_Locally.md)** for complete development workflow
4. **Check [API Specification](API_Specification.md)** for available endpoints

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure backend is running (see [Development API Setup](Development_API_Setup.md))
4. Check the [Running Locally](Running_Locally.md) troubleshooting section
5. Contact the development team

---

_This guide covers Sprint 1 and Sprint 2 frontend setup. For additional features, check the main [README](../README.md)._
