/**
 * Payment Routes
 * Week 7 - Phase 2 - Task 2.3
 * 
 * API routes for payment management
 */

import { Router } from 'express';
import {
  processPayment,
  getPaymentsByOrder,
  getPaymentSummary,
  getPaymentById,
  processSplitPayment,
  refundPayment,
  getPayments,
  getPaymentStats,
  validatePayment
} from '../controllers/paymentController';

const router = Router({ mergeParams: true });

/**
 * Payment routes for orders
 * Base: /api/restaurants/:restaurantId/orders/:orderId
 */

// Process payment for an order
router.post('/payments', processPayment);

// Get all payments for an order
router.get('/payments', getPaymentsByOrder);

// Get payment summary for an order
router.get('/payment-summary', getPaymentSummary);

// Process split bill payment
router.post('/split-payment', processSplitPayment);

// Validate payment amount
router.post('/validate-payment', validatePayment);

/**
 * General payment routes
 * Base: /api/restaurants/:restaurantId/payments
 */
const paymentRouter = Router({ mergeParams: true });

// Get payments with filters
paymentRouter.get('/', getPayments);

// Get payment statistics
paymentRouter.get('/stats', getPaymentStats);

// Get single payment by ID
paymentRouter.get('/:paymentId', getPaymentById);

// Refund a payment
paymentRouter.post('/:paymentId/refund', refundPayment);

export { router as orderPaymentRoutes, paymentRouter };
