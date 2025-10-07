/**
 * Stripe Payment Controller
 * Handles Stripe payment API endpoints
 */

import { Request, Response } from 'express';
import stripeService from '../services/stripeService';
import { createLogger } from '../utils/logger';
import { asyncHandler } from '../middleware/asyncHandler';
import { ValidationError, PaymentError } from '../utils/errors';

const logger = createLogger('StripeController');

/**
 * Create payment intent
 * POST /api/payments/stripe/create-intent
 */
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { amount, orderId, customerEmail, customerName, description } = req.body;

  // Validate required fields
  if (!amount || !orderId) {
    throw new ValidationError('Amount and orderId are required');
  }

  if (amount <= 0) {
    throw new ValidationError('Amount must be greater than 0');
  }

  try {
    // Convert dollars to cents for Stripe
    const amountInCents = stripeService.dollarsToCents(amount);

    const paymentIntent = await stripeService.createPaymentIntent({
      amount: amountInCents,
      orderId,
      customerEmail,
      customerName,
      description,
    });

    logger.info('Payment intent created', {
      orderId,
      paymentIntentId: paymentIntent.id,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error: any) {
    logger.error('Failed to create payment intent', {
      error: error.message,
      orderId,
    });

    throw new PaymentError('Failed to create payment intent', {
      code: 'CREATE_PAYMENT_INTENT_FAILED',
      originalError: error,
    });
  }
});

/**
 * Get payment intent status
 * GET /api/payments/stripe/intent/:paymentIntentId
 */
export const getPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new ValidationError('Payment intent ID is required');
  }

  try {
    const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        amountInDollars: stripeService.centsToDollars(paymentIntent.amount),
      },
    });
  } catch (error: any) {
    logger.error('Failed to retrieve payment intent', {
      error: error.message,
      paymentIntentId,
    });

    throw new PaymentError('Failed to retrieve payment intent', {
      code: 'GET_PAYMENT_INTENT_FAILED',
      originalError: error,
    });
  }
});

/**
 * Confirm payment intent
 * POST /api/payments/stripe/confirm-intent
 */
export const confirmPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  if (!paymentIntentId || !paymentMethodId) {
    throw new ValidationError('Payment intent ID and payment method ID are required');
  }

  try {
    const paymentIntent = await stripeService.confirmPaymentIntent(
      paymentIntentId,
      paymentMethodId
    );

    logger.info('Payment intent confirmed', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

    res.status(200).json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error: any) {
    logger.error('Failed to confirm payment intent', {
      error: error.message,
      paymentIntentId,
    });

    throw new PaymentError('Failed to confirm payment', {
      code: 'CONFIRM_PAYMENT_INTENT_FAILED',
      originalError: error,
    });
  }
});

/**
 * Cancel payment intent
 * POST /api/payments/stripe/cancel-intent
 */
export const cancelPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    throw new ValidationError('Payment intent ID is required');
  }

  try {
    await stripeService.cancelPaymentIntent(paymentIntentId);

    logger.info('Payment intent cancelled', { paymentIntentId });

    res.status(200).json({
      success: true,
      message: 'Payment intent cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Failed to cancel payment intent', {
      error: error.message,
      paymentIntentId,
    });

    throw new PaymentError('Failed to cancel payment intent', {
      code: 'CANCEL_PAYMENT_INTENT_FAILED',
      originalError: error,
    });
  }
});

/**
 * Create refund
 * POST /api/payments/stripe/refund
 */
export const createRefund = asyncHandler(async (req: Request, res: Response) => {
  const { paymentIntentId, amount, reason } = req.body;

  if (!paymentIntentId) {
    throw new ValidationError('Payment intent ID is required');
  }

  try {
    // Convert dollars to cents if amount provided
    const amountInCents = amount ? stripeService.dollarsToCents(amount) : undefined;

    const refund = await stripeService.createRefund({
      paymentIntentId,
      amount: amountInCents,
      reason,
    });

    logger.info('Refund created', {
      refundId: refund.id,
      paymentIntentId,
      amount: refund.amount,
    });

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        amountInDollars: stripeService.centsToDollars(refund.amount),
        status: refund.status,
        reason: refund.reason,
      },
    });
  } catch (error: any) {
    logger.error('Failed to create refund', {
      error: error.message,
      paymentIntentId,
    });

    throw new PaymentError('Failed to create refund', {
      code: 'CREATE_REFUND_FAILED',
      originalError: error,
    });
  }
});

/**
 * Handle Stripe webhook
 * POST /api/payments/stripe/webhook
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    throw new ValidationError('Missing Stripe signature header');
  }

  try {
    // Verify webhook signature and construct event
    const event = stripeService.verifyWebhookSignature(req.body, signature);

    // Handle the event
    await stripeService.handleWebhookEvent(event);

    logger.info('Webhook processed successfully', {
      eventType: event.type,
      eventId: event.id,
    });

    // Return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error: any) {
    logger.error('Webhook processing failed', {
      error: error.message,
    });

    // Return 400 for signature verification failures
    res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
    });
  }
});

export default {
  createPaymentIntent,
  getPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  createRefund,
  handleWebhook,
};
