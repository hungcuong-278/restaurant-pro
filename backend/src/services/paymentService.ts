/**
 * Payment Service Layer
 * Week 7 - Phase 2 - Task 2.1
 * 
 * Handles all payment-related business logic including:
 * - Payment processing
 * - Payment validation
 * - Split bill logic
 * - Refunds
 * - Payment history
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { createLogger } from '../utils/logger';
import {
  NotFoundError,
  ValidationError,
  BusinessLogicError,
  PaymentError,
  PaymentProcessingError,
  InsufficientPaymentError
} from '../utils/errors';
import {
  Payment,
  PaymentWithOrder,
  PaymentCreateData,
  PaymentUpdateData,
  PaymentSummary,
  PaymentValidation,
  SplitPaymentConfig,
  PaymentRefundData,
  PaymentFilters,
  PaymentStats,
  PaymentProcessingResult,
  BulkPaymentResult,
  PaymentDetails
} from '../types/payment.types';

const logger = createLogger('PaymentService');

/**
 * Helper function to round money amounts to 2 decimal places
 * Fixes floating point arithmetic issues
 */
function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

class PaymentService {
  /**
   * Process a payment for an order
   * This is the main payment processing function
   */
  async processPayment(data: PaymentCreateData): Promise<PaymentProcessingResult> {
    logger.info('Processing payment', { orderId: data.order_id, amount: data.amount, method: data.payment_method });

    const trx = await db.transaction();

    try {
      // 1. Validate order exists and get current status
      const order = await trx('orders')
        .where({ id: data.order_id })
        .first();

      if (!order) {
        throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
      }

      // 2. Check if order is already completed or cancelled
      if (order.status === 'cancelled') {
        throw new BusinessLogicError('Cannot process payment for cancelled order', 'ORDER_CANCELLED');
      }

      // Check if order is already fully paid
      if (order.payment_status === 'paid') {
        throw new BusinessLogicError('Order is already fully paid', 'ORDER_ALREADY_PAID');
      }

      // 3. Validate payment amount
      const validation = await this.validatePaymentAmount(data.order_id, data.amount, trx);
      
      if (!validation.is_valid) {
        throw new ValidationError(
          `Payment validation failed: ${validation.errors.join(', ')}`,
          { code: 'PAYMENT_VALIDATION_FAILED', errors: validation.errors }
        );
      }

      // 4. Create payment record
      const payment = await this.createPayment(data, trx);

      // 5. Calculate total paid amount
      const summary = await this.getPaymentSummary(data.order_id, trx);

      // 6. Update order payment status
      let orderUpdated = false;
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (summary.is_fully_paid) {
        updateData.payment_status = 'paid';
        updateData.paid_at = new Date().toISOString();
        
        // Auto-complete order if status is 'served'
        if (order.status === 'served') {
          updateData.status = 'completed';
        }
        
        orderUpdated = true;
      } else if (summary.total_paid > 0) {
        updateData.payment_status = 'partial';
        orderUpdated = true;
      }

      if (orderUpdated) {
        await trx('orders')
          .where({ id: data.order_id })
          .update(updateData);
      }

      await trx.commit();

      logger.info('Payment processed successfully', {
        paymentId: payment.id,
        orderId: data.order_id,
        amount: data.amount,
        orderUpdated,
        isFullyPaid: summary.is_fully_paid
      });

      return {
        success: true,
        payment,
        order_updated: orderUpdated,
        transaction_id: payment.transaction_id || undefined
      };

    } catch (error) {
      await trx.rollback();
      
      if (error instanceof ValidationError || error instanceof BusinessLogicError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Payment processing failed', { error, data });
      throw new PaymentProcessingError(data.payment_method, error);
    }
  }

  /**
   * Create a payment record
   */
  async createPayment(data: PaymentCreateData, trx?: any): Promise<Payment> {
    const query = trx || db;

    const paymentId = uuidv4();
    const now = new Date().toISOString();

    const paymentRecord = {
      id: paymentId,
      order_id: data.order_id,
      payment_method: data.payment_method,
      amount: data.amount,
      status: 'completed', // Default to completed for cash/immediate payments
      processed_by: data.processed_by || null,
      transaction_id: data.transaction_id || null,
      payment_details: data.payment_details ? JSON.stringify(data.payment_details) : null,
      processed_at: now,
      created_at: now,
      updated_at: now
    };

    await query('payments').insert(paymentRecord);

    logger.info('Payment record created', { paymentId, orderId: data.order_id, amount: data.amount });

    return this.getPaymentById(paymentId, query);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, trx?: any): Promise<Payment> {
    const query = trx || db;

    const payment = await query('payments')
      .where({ id: paymentId })
      .first();

    if (!payment) {
      throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
    }

    return payment;
  }

  /**
   * Get all payments for an order
   */
  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    const payments = await db('payments')
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc');

    return payments;
  }

  /**
   * Get payment with order details
   */
  async getPaymentWithOrder(paymentId: string): Promise<PaymentWithOrder> {
    const payment = await db('payments as p')
      .leftJoin('orders as o', 'p.order_id', 'o.id')
      .leftJoin('tables as t', 'o.table_id', 't.id')
      .where('p.id', paymentId)
      .select(
        'p.*',
        db.raw(`json_object(
          'id', o.id,
          'order_number', o.order_number,
          'total_amount', o.total_amount,
          'status', o.status,
          'table_number', t.number
        ) as order`)
      )
      .first();

    if (!payment) {
      throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
    }

    // Parse order JSON
    if (payment.order && typeof payment.order === 'string') {
      payment.order = JSON.parse(payment.order);
    }

    return payment;
  }

  /**
   * Update payment status
   */
  async updatePayment(paymentId: string, data: PaymentUpdateData): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    const updateData = {
      ...data,
      payment_details: data.payment_details ? JSON.stringify(data.payment_details) : undefined,
      updated_at: new Date().toISOString()
    };

    await db('payments')
      .where({ id: paymentId })
      .update(updateData);

    logger.info('Payment updated', { paymentId, updates: Object.keys(data) });

    return this.getPaymentById(paymentId);
  }

  /**
   * Validate payment amount against order total
   */
  async validatePaymentAmount(
    orderId: string,
    amount: number,
    trx?: any
  ): Promise<PaymentValidation> {
    const query = trx || db;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get order total
    const order = await query('orders')
      .where({ id: orderId })
      .first();

    if (!order) {
      errors.push('Order not found');
      return { is_valid: false, errors, warnings };
    }

    // Check payment amount is positive
    if (amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    // Get existing payments
    const existingPayments = await query('payments')
      .where({ order_id: orderId })
      .whereIn('status', ['completed', 'processing']);

    const totalPaid = roundMoney(existingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0));
    const orderTotal = roundMoney(parseFloat(order.total_amount));
    const remainingAmount = roundMoney(orderTotal - totalPaid);

    // Check if overpaying
    if (amount > remainingAmount + 0.01) { // Allow 1 cent tolerance
      warnings.push(`Payment amount ($${amount}) exceeds remaining balance ($${remainingAmount})`);
    }

    // Check if underpaying when trying to complete
    if (amount < remainingAmount - 0.01 && amount < orderTotal * 0.99) { // Allow 1 cent tolerance
      warnings.push('Partial payment - order will not be marked as fully paid');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      order_total: orderTotal,
      amount_paid: totalPaid,
      remaining_amount: remainingAmount
    };
  }

  /**
   * Get payment summary for an order
   */
  async getPaymentSummary(orderId: string, trx?: any): Promise<PaymentSummary> {
    const query = trx || db;

    // Get order
    const order = await query('orders')
      .where({ id: orderId })
      .first();

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // Get all payments
    const payments = await query('payments')
      .where({ order_id: orderId })
      .orderBy('created_at', 'desc');

    // Calculate totals
    const totalPaid = roundMoney(payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0));

    const totalRefunded = roundMoney(payments
      .filter((p: any) => p.status === 'refunded')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0));

    const orderTotal = roundMoney(parseFloat(order.total_amount));
    const remainingAmount = roundMoney(orderTotal - totalPaid + totalRefunded);

    return {
      order_id: orderId,
      order_total: orderTotal,
      total_paid: totalPaid,
      total_refunded: totalRefunded,
      remaining_amount: Math.max(0, remainingAmount),
      payments,
      is_fully_paid: remainingAmount <= 0.01, // Allow for rounding errors
      is_overpaid: remainingAmount < -0.01
    };
  }

  /**
   * Process split bill payment
   */
  async processSplitPayment(config: SplitPaymentConfig): Promise<BulkPaymentResult> {
    logger.info('Processing split payment', { orderId: config.order_id, splitType: config.split_type });

    const trx = await db.transaction();

    try {
      // Get order total
      const order = await trx('orders')
        .where({ id: config.order_id })
        .first();

      if (!order) {
        throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
      }

      const orderTotal = parseFloat(order.total_amount);
      let splitAmounts: number[] = [];

      // Calculate split amounts based on type
      switch (config.split_type) {
        case 'equal':
          if (!config.number_of_payers || config.number_of_payers < 2) {
            throw new ValidationError('Number of payers must be at least 2 for equal split', 'INVALID_SPLIT_CONFIG');
          }
          const amountPerPayer = orderTotal / config.number_of_payers;
          splitAmounts = Array(config.number_of_payers).fill(amountPerPayer);
          break;

        case 'custom':
          if (!config.split_amounts || config.split_amounts.length < 2) {
            throw new ValidationError('Split amounts must be provided for custom split', 'INVALID_SPLIT_CONFIG');
          }
          splitAmounts = config.split_amounts;
          
          // Validate total matches order total
          const customTotal = splitAmounts.reduce((sum, amt) => sum + amt, 0);
          if (Math.abs(customTotal - orderTotal) > 0.01) {
            throw new ValidationError(
              `Split amounts (${customTotal}) do not match order total (${orderTotal})`,
              'SPLIT_AMOUNT_MISMATCH'
            );
          }
          break;

        case 'by_item':
          // Item-based split would require fetching order items and calculating per item
          throw new BusinessLogicError('Item-based split not yet implemented', 'NOT_IMPLEMENTED');

        default:
          throw new ValidationError('Invalid split type', 'INVALID_SPLIT_TYPE');
      }

      // Create payment records for each split
      const payments: Payment[] = [];
      const failedPayments: { index: number; error: string }[] = [];

      for (let i = 0; i < splitAmounts.length; i++) {
        try {
          const paymentDetails: PaymentDetails = {
            split: {
              type: config.split_type,
              total_payers: splitAmounts.length,
              split_amounts: splitAmounts
            },
            ...(config.payment_details && config.payment_details[i] ? config.payment_details[i] : {})
          };

          const paymentData: PaymentCreateData = {
            order_id: config.order_id,
            payment_method: config.payment_method,
            amount: splitAmounts[i],
            processed_by: config.processed_by,
            transaction_id: `SPLIT-${i + 1}-${uuidv4().substring(0, 8)}`,
            payment_details: paymentDetails
          };

          const payment = await this.createPayment(paymentData, trx);
          payments.push(payment);

        } catch (error: any) {
          failedPayments.push({
            index: i,
            error: error.message
          });
        }
      }

      // If any payment failed, rollback
      if (failedPayments.length > 0) {
        await trx.rollback();
        return {
          success: false,
          payments: [],
          failed_payments: failedPayments,
          order_updated: false
        };
      }

      // Update order status to completed and paid
      await trx('orders')
        .where({ id: config.order_id })
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          status: order.status === 'served' ? 'completed' : order.status,
          updated_at: new Date().toISOString()
        });

      await trx.commit();

      logger.info('Split payment processed successfully', {
        orderId: config.order_id,
        paymentsCreated: payments.length,
        totalAmount: splitAmounts.reduce((sum, amt) => sum + amt, 0)
      });

      return {
        success: true,
        payments,
        order_updated: true
      };

    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Process payment refund
   */
  async refundPayment(data: PaymentRefundData): Promise<Payment> {
    logger.info('Processing refund', { paymentId: data.payment_id, amount: data.refund_amount });

    const trx = await db.transaction();

    try {
      // Get payment
      const payment = await trx('payments')
        .where({ id: data.payment_id })
        .first();

      if (!payment) {
        throw new NotFoundError('Payment not found', 'PAYMENT_NOT_FOUND');
      }

      // Validate payment can be refunded
      if (payment.status === 'refunded') {
        throw new BusinessLogicError('Payment is already refunded', 'PAYMENT_ALREADY_REFUNDED');
      }

      if (payment.status === 'failed' || payment.status === 'cancelled') {
        throw new BusinessLogicError('Cannot refund failed or cancelled payment', 'PAYMENT_NOT_REFUNDABLE');
      }

      // Validate refund amount
      const paymentAmount = parseFloat(payment.amount);
      if (data.refund_amount > paymentAmount) {
        throw new ValidationError('Refund amount cannot exceed payment amount', 'INVALID_REFUND_AMOUNT');
      }

      // Parse existing payment details
      let paymentDetails: PaymentDetails = {};
      if (payment.payment_details) {
        try {
          paymentDetails = JSON.parse(payment.payment_details);
        } catch (e) {
          paymentDetails = {};
        }
      }

      // Update payment details with refund info
      paymentDetails.refund_reason = data.refund_reason;

      // Update payment status
      await trx('payments')
        .where({ id: data.payment_id })
        .update({
          status: 'refunded',
          payment_details: JSON.stringify(paymentDetails),
          processed_by: data.processed_by,
          updated_at: new Date().toISOString()
        });

      // Update order payment status if needed
      const order = await trx('orders')
        .where({ id: payment.order_id })
        .first();

      if (order) {
        const summary = await this.getPaymentSummary(payment.order_id, trx);
        
        const orderUpdate: any = {
          updated_at: new Date().toISOString()
        };

        if (summary.remaining_amount > 0.01) {
          orderUpdate.payment_status = summary.total_paid > 0 ? 'partial' : 'unpaid';
        }

        await trx('orders')
          .where({ id: payment.order_id })
          .update(orderUpdate);
      }

      await trx.commit();

      logger.info('Refund processed successfully', {
        paymentId: data.payment_id,
        refundAmount: data.refund_amount
      });

      return this.getPaymentById(data.payment_id);

    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Get payments with filters
   */
  async getPayments(filters: PaymentFilters): Promise<Payment[]> {
    let query = db('payments')
      .select('payments.*')
      .orderBy('payments.created_at', 'desc');

    if (filters.order_id) {
      query = query.where('payments.order_id', filters.order_id);
    }

    if (filters.payment_method) {
      query = query.where('payments.payment_method', filters.payment_method);
    }

    if (filters.status) {
      query = query.where('payments.status', filters.status);
    }

    if (filters.start_date) {
      query = query.where('payments.created_at', '>=', filters.start_date);
    }

    if (filters.end_date) {
      query = query.where('payments.created_at', '<=', filters.end_date);
    }

    if (filters.min_amount) {
      query = query.where('payments.amount', '>=', filters.min_amount);
    }

    if (filters.max_amount) {
      query = query.where('payments.amount', '<=', filters.max_amount);
    }

    if (filters.processed_by) {
      query = query.where('payments.processed_by', filters.processed_by);
    }

    return query;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(restaurantId: string, startDate: string, endDate: string): Promise<PaymentStats> {
    // Get all payments for orders in this restaurant within date range
    const payments = await db('payments as p')
      .join('orders as o', 'p.order_id', 'o.id')
      .where('o.restaurant_id', restaurantId)
      .whereBetween('p.created_at', [startDate, endDate])
      .whereIn('p.status', ['completed', 'processing'])
      .select('p.*');

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // Group by payment method
    const byMethod = payments.reduce((acc, p) => {
      const existing = acc.find((item: any) => item.method === p.payment_method);
      if (existing) {
        existing.count++;
        existing.total_amount += parseFloat(p.amount);
      } else {
        acc.push({
          method: p.payment_method,
          count: 1,
          total_amount: parseFloat(p.amount)
        });
      }
      return acc;
    }, [] as any[]);

    // Group by status
    const byStatus = payments.reduce((acc, p) => {
      const existing = acc.find((item: any) => item.status === p.status);
      if (existing) {
        existing.count++;
        existing.total_amount += parseFloat(p.amount);
      } else {
        acc.push({
          status: p.status,
          count: 1,
          total_amount: parseFloat(p.amount)
        });
      }
      return acc;
    }, [] as any[]);

    // Calculate refund rate
    const refundedPayments = await db('payments as p')
      .join('orders as o', 'p.order_id', 'o.id')
      .where('o.restaurant_id', restaurantId)
      .whereBetween('p.created_at', [startDate, endDate])
      .where('p.status', 'refunded')
      .count('* as count')
      .first();

    const refundCount = Number(refundedPayments?.count) || 0;
    const refundRate = totalPayments > 0 ? (refundCount / totalPayments) * 100 : 0;

    return {
      total_payments: totalPayments,
      total_amount: totalAmount,
      by_method: byMethod,
      by_status: byStatus,
      average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
      refund_rate: refundRate
    };
  }
}

export default new PaymentService();
