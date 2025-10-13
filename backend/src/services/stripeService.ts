/**
 * Stripe Payment Integration Service
 * Handles Stripe payment processing for Restaurant Pro
 */

import Stripe from 'stripe';
import { createLogger } from '../utils/logger';
import { PaymentError, ValidationError } from '../utils/errors';

const logger = createLogger('StripeService');

// Initialize Stripe with API key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export interface StripePaymentIntentData {
  amount: number; // in cents
  currency?: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
}

export interface StripeRefundData {
  paymentIntentId: string;
  amount?: number; // in cents, omit for full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface StripeRefund {
  id: string;
  amount: number;
  status: string;
  reason?: string;
}

class StripeService {
  /**
   * Create a payment intent for order payment
   */
  async createPaymentIntent(data: StripePaymentIntentData): Promise<StripePaymentIntent> {
    try {
      logger.info('Creating Stripe payment intent', {
        amount: data.amount,
        orderId: data.orderId,
      });

      // Validate amount
      if (data.amount < 50) {
        throw new ValidationError('Amount must be at least $0.50', {
          code: 'AMOUNT_TOO_SMALL',
          minimum: 50,
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount), // Ensure integer
        currency: data.currency || 'usd',
        description: data.description || `Payment for Order #${data.orderId}`,
        receipt_email: data.customerEmail,
        metadata: {
          orderId: data.orderId,
          customerName: data.customerName || 'Unknown',
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        orderId: data.orderId,
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      logger.error('Failed to create payment intent', {
        error: error.message,
        orderId: data.orderId,
      });

      throw new PaymentError(
        `Failed to create payment intent: ${error.message}`,
        {
          code: 'STRIPE_CREATE_INTENT_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Retrieve payment intent status
   */
  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method as string | undefined,
      };
    } catch (error: any) {
      logger.error('Failed to retrieve payment intent', {
        error: error.message,
        paymentIntentId,
      });

      throw new PaymentError(
        `Failed to retrieve payment intent: ${error.message}`,
        {
          code: 'STRIPE_RETRIEVE_INTENT_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Confirm a payment intent (complete payment)
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<StripePaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method as string | undefined,
      };
    } catch (error: any) {
      logger.error('Failed to confirm payment intent', {
        error: error.message,
        paymentIntentId,
      });

      throw new PaymentError(
        `Failed to confirm payment: ${error.message}`,
        {
          code: 'STRIPE_CONFIRM_INTENT_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId);

      logger.info('Payment intent cancelled', { paymentIntentId });
    } catch (error: any) {
      logger.error('Failed to cancel payment intent', {
        error: error.message,
        paymentIntentId,
      });

      throw new PaymentError(
        `Failed to cancel payment intent: ${error.message}`,
        {
          code: 'STRIPE_CANCEL_INTENT_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Create a refund
   */
  async createRefund(data: StripeRefundData): Promise<StripeRefund> {
    try {
      logger.info('Creating Stripe refund', {
        paymentIntentId: data.paymentIntentId,
        amount: data.amount,
      });

      const refund = await stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount, // undefined = full refund
        reason: data.reason,
      });

      logger.info('Refund created successfully', {
        refundId: refund.id,
        paymentIntentId: data.paymentIntentId,
      });

      return {
        id: refund.id,
        amount: refund.amount,
        status: refund.status || 'pending',
        reason: refund.reason || '',
      };
    } catch (error: any) {
      logger.error('Failed to create refund', {
        error: error.message,
        paymentIntentId: data.paymentIntentId,
      });

      throw new PaymentError(
        `Failed to create refund: ${error.message}`,
        {
          code: 'STRIPE_CREATE_REFUND_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      logger.error('Webhook signature verification failed', {
        error: error.message,
      });

      throw new PaymentError(
        `Webhook signature verification failed: ${error.message}`,
        {
          code: 'STRIPE_WEBHOOK_VERIFICATION_FAILED',
          originalError: error,
        }
      );
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    logger.info('Processing Stripe webhook event', {
      type: event.type,
      id: event.id,
    });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata.orderId,
    });

    // TODO: Update order payment status in database
    // This should be handled by the main payment service
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.error('Payment intent failed', {
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata.orderId,
    });

    // TODO: Update order with payment failure
  }

  /**
   * Handle refund
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    logger.info('Charge refunded', {
      chargeId: charge.id,
      amount: charge.amount_refunded,
    });

    // TODO: Update payment record with refund
  }

  /**
   * Convert dollars to cents
   */
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  /**
   * Convert cents to dollars
   */
  centsToDollars(cents: number): number {
    return cents / 100;
  }
}

export default new StripeService();
