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
        // Add more allowed origins here
    ];
    app.use(helmet());
    app.use(
        cors({
            origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
