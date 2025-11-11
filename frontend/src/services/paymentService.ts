import api from './api';
import { RESTAURANT_ID } from '../config/restaurant';

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'digital_wallet';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  payments: Payment[];
}

export interface CreatePaymentRequest {
  amount: number;
  payment_method: 'cash' | 'card' | 'digital_wallet';
  transaction_id?: string;
}

export interface SplitPaymentRequest {
  split_type: 'equal' | 'custom';
  number_of_payers?: number;
  amounts?: number[];
  payment_method?: 'cash' | 'card' | 'digital_wallet';
}

export interface PaymentListResponse {
  success: boolean;
  data: Payment[];
  message?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
  message?: string;
}

export interface PaymentStatusResponseWrapper {
  success: boolean;
  data: PaymentStatusResponse;
  message?: string;
}

export interface SplitPaymentResponse {
  success: boolean;
  data: {
    payments: Payment[];
    total_amount: number;
    split_type: string;
  };
  message?: string;
}

export interface PaymentStatistics {
  total_revenue: number;
  total_payments: number;
  payment_methods: {
    cash: number;
    card: number;
    digital_wallet: number;
  };
  period?: {
    from: string;
    to: string;
  };
}

// Payment Service API
export const paymentService = {
  // Get all payments for an order
  getOrderPayments: async (orderId: string): Promise<PaymentListResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`;
    return api.get(url);
  },

  // Get payment by ID
  getPaymentById: async (paymentId: string): Promise<PaymentResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/payments/${paymentId}`;
    return api.get(url);
  },

  // Get payment status for order
  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponseWrapper> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payment-status`;
    return api.get(url);
  },

  // Create payment
  createPayment: async (orderId: string, paymentData: CreatePaymentRequest): Promise<PaymentResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`;
    return api.post(url, paymentData);
  },

  // Validate payment before processing
  validatePayment: async (orderId: string, amount: number): Promise<{ success: boolean; message: string }> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments/validate`;
    return api.post(url, { amount });
  },

  // Create split payment
  createSplitPayment: async (orderId: string, splitData: SplitPaymentRequest): Promise<SplitPaymentResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/split-payment`;
    return api.post(url, splitData);
  },

  // Update payment status
  updatePaymentStatus: async (
    paymentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  ): Promise<PaymentResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/payments/${paymentId}/status`;
    return api.patch(url, { payment_status: status });
  },

  // Cancel payment
  cancelPayment: async (paymentId: string): Promise<{ success: boolean; message: string }> => {
    const url = `/restaurants/${RESTAURANT_ID}/payments/${paymentId}`;
    return api.delete(url);
  },

  // Get payment statistics
  getPaymentStatistics: async (dateFrom?: string, dateTo?: string): Promise<{ success: boolean; data: PaymentStatistics }> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    const url = `/restaurants/${RESTAURANT_ID}/payment-statistics${params.toString() ? `?${params.toString()}` : ''}`;
    return api.get(url);
  },
};

export default paymentService;
