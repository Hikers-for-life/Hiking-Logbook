import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import hikeRoutes from './routes/hike.js';//ANNAH
import feedRoutes from './routes/feed.js';//ANNAH

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hikes', hikeRoutes);//ANNA
app.use('/api/feed', feedRoutes);//ANNAH

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Hiking Logbook API is running' });
});

// Export the Express app as a Firebase Function
export const api = onRequest(app);
