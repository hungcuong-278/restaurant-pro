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
import orderRoutes from './routes/orderRoutes';
import { paymentRouter } from './routes/paymentRoutes';
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

// Rate limiting - Production-ready limits for restaurant operations
// Target: Support 50 concurrent orders with excellent safety margin (64%)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute window
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300'), // 300 requests per minute
  // 300 req/min = 5 req/sec - optimized for 50 orders with 64% safety margin
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/api/health' || req.path.startsWith('/static');
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

// Reservation routes - use main reservationRoutes
app.use('/api/reservations', reservationRoutes);

// Global reservation routes commented out to avoid route conflict
// app.use('/api/reservations', globalReservationRoutes);

// Restaurant-specific routes - mount directly with full path
app.use('/api/restaurants/:restaurantId/tables', tableRoutes);
app.use('/api/restaurants/:restaurantId/reservations', reservationRoutes);
app.use('/api/restaurants/:restaurantId/orders', orderRoutes);
app.use('/api/restaurants/:restaurantId/payments', paymentRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;