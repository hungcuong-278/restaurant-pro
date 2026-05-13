import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import stripeRoutes from './stripeRoutes';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Stripe payment routes
router.use('/stripe', stripeRoutes);

export const paymentRouter = router;
