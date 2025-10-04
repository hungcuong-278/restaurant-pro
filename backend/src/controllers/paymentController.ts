/**
 * Payment Controller
 * Week 7 - Phase 2 - Task 2.3
 * 
 * HTTP request handlers for Payment API endpoints
 */

import { Request, Response } from 'express';
import paymentService from '../services/paymentService';
import { createLogger } from '../utils/logger';
import { AppError } from '../utils/errors';
import {
  PaymentCreateData,
  SplitPaymentConfig,
  PaymentRefundData,
  PaymentFilters
} from '../types/payment.types';

const logger = createLogger('PaymentController');

/**
 * Process a payment for an order
 * POST /api/restaurants/:restaurantId/orders/:orderId/payments
 */
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, orderId } = req.params;
    const { payment_method, amount, transaction_id, payment_details, processed_by } = req.body;

    // Validation
    if (!payment_method) {
      res.status(400).json({
        success: false,
        message: 'Payment method is required',
        code: 'PAYMENT_METHOD_REQUIRED'
      });
      return;
    }

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
        code: 'INVALID_AMOUNT'
      });
      return;
    }

    const validMethods = ['cash', 'card', 'mobile', 'split'];
    if (!validMethods.includes(payment_method)) {
      res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`,
        code: 'INVALID_PAYMENT_METHOD'
      });
      return;
    }

    const paymentData: PaymentCreateData = {
      order_id: orderId,
      payment_method,
      amount: parseFloat(amount),
      transaction_id,
      payment_details,
      processed_by
    };

    const result = await paymentService.processPayment(paymentData);

    logger.info('Payment processed via API', {
      orderId,
      paymentId: result.payment?.id,
      amount,
      method: payment_method
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });

  } catch (error: any) {
    logger.error('Payment processing failed', { error, body: req.body });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      code: 'INTERNAL_ERROR',
      error: error.message
    });
  }
};

/**
 * Get all payments for an order
 * GET /api/restaurants/:restaurantId/orders/:orderId/payments
 */
export const getPaymentsByOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const payments = await paymentService.getPaymentsByOrder(orderId);

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });

  } catch (error: any) {
    logger.error('Failed to get payments', { error, params: req.params });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

/**
 * Get payment summary for an order
 * GET /api/restaurants/:restaurantId/orders/:orderId/payment-summary
 */
export const getPaymentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const summary = await paymentService.getPaymentSummary(orderId);

    res.json({
      success: true,
      data: summary
    });

  } catch (error: any) {
    logger.error('Failed to get payment summary', { error, params: req.params });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment summary',
      error: error.message
    });
  }
};

/**
 * Get a single payment by ID
 * GET /api/restaurants/:restaurantId/payments/:paymentId
 */
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentWithOrder(paymentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error: any) {
    logger.error('Failed to get payment', { error, params: req.params });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

/**
 * Process split bill payment
 * POST /api/restaurants/:restaurantId/orders/:orderId/split-payment
 */
export const processSplitPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { split_type, number_of_payers, split_amounts, payment_method, processed_by, payment_details } = req.body;

    // Validation
    if (!split_type) {
      res.status(400).json({
        success: false,
        message: 'Split type is required',
        code: 'SPLIT_TYPE_REQUIRED'
      });
      return;
    }

    const validSplitTypes = ['equal', 'custom', 'by_item'];
    if (!validSplitTypes.includes(split_type)) {
      res.status(400).json({
        success: false,
        message: `Invalid split type. Must be one of: ${validSplitTypes.join(', ')}`,
        code: 'INVALID_SPLIT_TYPE'
      });
      return;
    }

    if (!payment_method) {
      res.status(400).json({
        success: false,
        message: 'Payment method is required',
        code: 'PAYMENT_METHOD_REQUIRED'
      });
      return;
    }

    const config: SplitPaymentConfig = {
      order_id: orderId,
      split_type,
      payment_method,
      number_of_payers,
      split_amounts,
      processed_by,
      payment_details
    };

    const result = await paymentService.processSplitPayment(config);

    logger.info('Split payment processed', {
      orderId,
      splitType: split_type,
      paymentsCreated: result.payments.length
    });

    res.status(201).json({
      success: true,
      message: 'Split payment processed successfully',
      data: result
    });

  } catch (error: any) {
    logger.error('Split payment failed', { error, body: req.body });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process split payment',
      code: 'INTERNAL_ERROR',
      error: error.message
    });
  }
};

/**
 * Process payment refund
 * POST /api/restaurants/:restaurantId/payments/:paymentId/refund
 */
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { refund_amount, refund_reason, processed_by } = req.body;

    // Validation
    if (!refund_amount || refund_amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid refund amount is required',
        code: 'INVALID_REFUND_AMOUNT'
      });
      return;
    }

    if (!refund_reason) {
      res.status(400).json({
        success: false,
        message: 'Refund reason is required',
        code: 'REFUND_REASON_REQUIRED'
      });
      return;
    }

    if (!processed_by) {
      res.status(400).json({
        success: false,
        message: 'Processor ID is required',
        code: 'PROCESSED_BY_REQUIRED'
      });
      return;
    }

    const refundData: PaymentRefundData = {
      payment_id: paymentId,
      refund_amount: parseFloat(refund_amount),
      refund_reason,
      processed_by
    };

    const payment = await paymentService.refundPayment(refundData);

    logger.info('Payment refunded', {
      paymentId,
      refundAmount: refund_amount,
      reason: refund_reason
    });

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });

  } catch (error: any) {
    logger.error('Refund failed', { error, body: req.body });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      code: 'INTERNAL_ERROR',
      error: error.message
    });
  }
};

/**
 * Get payments with filters
 * GET /api/restaurants/:restaurantId/payments
 */
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const {
      order_id,
      payment_method,
      status,
      start_date,
      end_date,
      min_amount,
      max_amount,
      processed_by
    } = req.query;

    const filters: PaymentFilters = {
      order_id: order_id as string,
      payment_method: payment_method as any,
      status: status as any,
      start_date: start_date as string,
      end_date: end_date as string,
      min_amount: min_amount ? parseFloat(min_amount as string) : undefined,
      max_amount: max_amount ? parseFloat(max_amount as string) : undefined,
      processed_by: processed_by as string
    };

    const payments = await paymentService.getPayments(filters);

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });

  } catch (error: any) {
    logger.error('Failed to get payments', { error, query: req.query });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

/**
 * Get payment statistics for a restaurant
 * GET /api/restaurants/:restaurantId/payments/stats
 */
export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
        code: 'DATE_RANGE_REQUIRED'
      });
      return;
    }

    const stats = await paymentService.getPaymentStats(
      restaurantId,
      start_date as string,
      end_date as string
    );

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    logger.error('Failed to get payment stats', { error, params: req.params });

    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

/**
 * Validate payment amount for an order
 * POST /api/restaurants/:restaurantId/orders/:orderId/validate-payment
 */
export const validatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid amount is required',
        code: 'INVALID_AMOUNT'
      });
      return;
    }

    const validation = await paymentService.validatePaymentAmount(orderId, parseFloat(amount));

    res.json({
      success: true,
      data: validation
    });

  } catch (error: any) {
    logger.error('Payment validation failed', { error, body: req.body });

    res.status(500).json({
      success: false,
      message: 'Failed to validate payment',
      error: error.message
    });
  }
};
