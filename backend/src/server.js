import express from 'express';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import * as middleware from './middleware/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { swaggerUi, specs } from './config/swagger.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import hikeRoutes from './routes/hikes.js';
import plannedHikeRoutes from './routes/plannedHikes.js';
import gearRoutes from './routes/gear.js';
import goalsRoutes from './routes/goals.js';
import publicRoutes from './routes/public.js';
import feedRoutes from './routes/feed.js';
import discoverRoutes from './routes/discover.js';
import friendRoutes from './routes/friends.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

middleware.applySecurityMiddleware(app);
middleware.applyParsingMiddleware(app);
middleware.applyLoggingMiddleware(app);

// Swagger API documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Hiking Logbook API Documentation',
  })
);

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
app.use('/api/goals', goalsRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/discover', discoverRoutes);

// Public API routes (no authentication required)
app.use('/api/public', publicRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Initialize Firebase and start server
async function startServer() {
  try {
    await initializeFirebase();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`Public API: http://localhost:${PORT}/api/public`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
      console.log(`Hikes API: http://localhost:${PORT}/api/hikes`);
      console.log(
        `Planned Hikes API: http://localhost:${PORT}/api/planned-hikes`
      );
      console.log(`Gear API: http://localhost:${PORT}/api/gear`);
      console.log(`Feed API: http://localhost:${PORT}/api/feed`);
      console.log(`Discover API: http://localhost:${PORT}/api/discover`);
      console.log(`Goals API: http://localhost:${PORT}/api/goals`);
      console.log(`Friends API: http://localhost:${PORT}/api/friends`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

let serverInstance = null;

startServer()
  .then((server) => {
    serverInstance = server;
  })
  .catch((error) => {
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
