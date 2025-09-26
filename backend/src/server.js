import express from 'express';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import * as middleware from './middleware/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hikeRoutes from './routes/hikes.js';
import plannedHikeRoutes from './routes/plannedHikes.js';
import gearRoutes from './routes/gear.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
middleware.applySecurityMiddleware(app);
middleware.applyParsingMiddleware(app);
middleware.applyLoggingMiddleware(app);


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
app.use('/api/planned-hikes', plannedHikeRoutes); 
app.use('/api/gear', gearRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize Firebase and start server
async function startServer() {
  try {
    // Initialize Firebase
    await initializeFirebase();
    console.log('Firebase initialized successfully');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
      console.log(`Hikes API: http://localhost:${PORT}/api/hikes`);
      console.log(`Planned Hikes API: http://localhost:${PORT}/api/planned-hikes`); 
      console.log(`Gear API: http://localhost:${PORT}/api/gear`);
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
let serverInstance = null;

startServer().then((server) => {
  serverInstance = server;
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

export default app;
