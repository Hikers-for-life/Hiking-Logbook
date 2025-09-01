import express from 'express';
import dotenv from 'dotenv';
import { initializeFirebase, admin } from './config/firebase.js';
import * as middleware from './middleware/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Starting Hiking Logbook API Server...');

    // 1. Initialize Firebase
    await initializeFirebase();

    // 2. Apply middleware
    middleware.applySecurityMiddleware(app);
    middleware.applyParsingMiddleware(app);
    middleware.applyLoggingMiddleware(app);

    // 3. Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      });
    });

    // 4. Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);

    // 5. Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // 6. Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`Users API: http://localhost:${PORT}/api/users`);
    });

    // 7. Graceful shutdown
    setupGracefulShutdown(server);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await admin.app().delete();
        console.log('Firebase connection closed');
        process.exit(0);
      } catch (err) {
        console.error('Error closing Firebase:', err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error('Force shutdown after 30s');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

export default app;
