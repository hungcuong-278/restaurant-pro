/**
 * Stripe Payment Routes
 * API routes for Stripe payment integration
 */

import express from 'express';
import stripeController from '../controllers/stripeController';

const router = express.Router();

/**
 * POST /api/payments/stripe/create-intent
 * Create a payment intent
 * Body: { amount: number, orderId: string, customerEmail?: string, customerName?: string }
 */
router.post('/create-intent', stripeController.createPaymentIntent);

/**
 * GET /api/payments/stripe/intent/:paymentIntentId
 * Get payment intent status
 */
router.get('/intent/:paymentIntentId', stripeController.getPaymentIntent);

/**
 * POST /api/payments/stripe/confirm-intent
 * Confirm a payment intent
 * Body: { paymentIntentId: string, paymentMethodId: string }
 */
router.post('/confirm-intent', stripeController.confirmPaymentIntent);

/**
 * POST /api/payments/stripe/cancel-intent
 * Cancel a payment intent
 * Body: { paymentIntentId: string }
 */
router.post('/cancel-intent', stripeController.cancelPaymentIntent);

/**
 * POST /api/payments/stripe/refund
 * Create a refund
 * Body: { paymentIntentId: string, amount?: number, reason?: string }
 */
router.post('/refund', stripeController.createRefund);

/**
 * POST /api/payments/stripe/webhook
 * Handle Stripe webhook events
 * Raw body required for signature verification
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

export default router;
