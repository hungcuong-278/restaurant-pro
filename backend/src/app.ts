import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import menuRoutes from './routes/menuRoutes';
import tableRoutes from './routes/tableRoutes';
import reservationRoutes from './routes/reservationRoutes';
import globalReservationRoutes from './routes/globalReservationRoutes';
import debugRoutes from './routes/debugRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.use('/api/health', healthRoutes);

// Basic API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Pro API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/debug', debugRoutes);

// Global reservation routes (no restaurant context needed)
app.use('/api/reservations', globalReservationRoutes);

// Restaurant-specific routes - mount directly with full path
app.use('/api/restaurants/:restaurantId/tables', tableRoutes);
app.use('/api/restaurants/:restaurantId/reservations', reservationRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;