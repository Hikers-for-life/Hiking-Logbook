import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import rateLimit from 'express-rate-limit';

export function applySecurityMiddleware(app) {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per window
        message: 'Too many requests, please try again later.',
    });

    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000', // Development
        'https://localhost:3000', // Development HTTPS
        'https://hiking-logbook.web.app',
        'https://hiking-logbook.firebaseapp.com',
        
    ];
    
    app.use(helmet());
    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                
                // For development - allow localhost
                if (origin.includes('localhost')) {
                    return callback(null, true);
                }
                
                // For production - check against allowed origins
                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                
                // For deployed apps - allow common deployment platforms
                if (origin.includes('.web.app') || 
                    origin.includes('.firebaseapp.com') ||
                    origin.includes('.netlify.app') ||
                    origin.includes('.vercel.app') ||
                    origin.includes('.github.io')) {
                    return callback(null, true);
                }
                
                console.log('CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );
    app.use(limiter);
}

export function applyParsingMiddleware(app) {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

export function applyLoggingMiddleware(app) {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
}
