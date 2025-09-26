import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { initializeFirebase } from './config/firebase.js';
import * as middleware from './middleware/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hikeRoutes from './routes/hikes.js';

import feedRoutes from './routes/feed.js';
import discoverRoutes from './routes/discover.js';
import goalsRoutes from './routes/goals.js';
import friendRoutes from "./routes/friends.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


// Apply middleware
middleware.applySecurityMiddleware(app);
middleware.applyParsingMiddleware(app);
middleware.applyLoggingMiddleware(app);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.FRONTEND_URL,
  'https://hiking-logbook.web.app',
  'https://hiking-logbook.firebaseapp.com',
  'https://your-custom-domain.com',
  'https://your-app.netlify.app',
  'https://your-app.vercel.app',
  'https://your-app.github.io',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes('localhost') || origin.startsWith('https://')) {
        callback(null, true);
      } else if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hikes', hikeRoutes);
app.use("/api/friends", friendRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/goals', goalsRoutes);


// Global error handler
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});



// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res,next) => {
  console.error('Global error handler:', error);

  let statusCode = 500;
  let message = 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service unavailable';

  }
});

// Start the server
  let serverInstance = null;

//  Wrap server startup in async function
const startServer = async () => {
  try {
   
    await initializeFirebase();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
      console.log(`Hikes API: http://localhost:${PORT}/api/hikes`);
      console.log(`Feed API: http://localhost:${PORT}/api/feed`);
      console.log(`Discover API: http://localhost:${PORT}/api/discover`);
      console.log(`Goals API: http://localhost:${PORT}/api/goals`);
      console.log(`Friends API: http://localhost:${PORT}/api/friends`);
    });
    
   process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};


startServer();




export default app;