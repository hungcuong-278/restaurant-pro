/**
 * Payment Type Definitions
 * Week 7 - Phase 2 - Task 2.1
 */

/**
 * Payment methods supported by the system
 */
export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'split';

/**
 * Payment status lifecycle
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Split payment types
 */
export type SplitType = 'equal' | 'custom' | 'by_item';

/**
 * Payment interface matching database schema
 */
export interface Payment {
  id: string;
  order_id: string;
  processed_by: string | null;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_id: string | null;
  payment_details: string | null; // JSON string
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payment with related order information
 */
export interface PaymentWithOrder extends Payment {
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    table_number?: string;
  };
}

/**
 * Payment details for different methods
 */
export interface PaymentDetails {
  // Card payment details
  card?: {
    last4?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
  };
  
  // Mobile payment details
  mobile?: {
    provider?: string; // 'momo' | 'zalopay' | 'vnpay'
    phone_number?: string;
  };
  
  // Split payment details
  split?: {
    type: SplitType;
    total_payers: number;
    split_amounts?: number[];
    paid_by?: string[]; // Array of payer names/IDs
  };
  
  // Cash payment details
  cash?: {
    amount_received?: number;
    change_given?: number;
  };
  
  // Additional metadata
  notes?: string;
  receipt_url?: string;
  refund_reason?: string;
}

/**
 * Data for creating a new payment
 */
export interface PaymentCreateData {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  processed_by?: string;
  transaction_id?: string;
  payment_details?: PaymentDetails;
}

/**
 * Data for updating a payment
 */
export interface PaymentUpdateData {
  status?: PaymentStatus;
  transaction_id?: string;
  payment_details?: PaymentDetails;
  processed_by?: string;
  processed_at?: string;
}

/**
 * Split payment configuration
 */
export interface SplitPaymentConfig {
  order_id: string;
  split_type: SplitType;
  payment_method: PaymentMethod;
  processed_by?: string;
  
  // For equal split
  number_of_payers?: number;
  
  // For custom split
  split_amounts?: number[];
  
  // For item-based split
  item_allocations?: {
    order_item_id: string;
    payer_index: number;
  }[];
  
  // Additional details for each payment
  payment_details?: PaymentDetails[];
}

/**
 * Payment refund data
 */
export interface PaymentRefundData {
  payment_id: string;
  refund_amount: number;
  refund_reason: string;
  processed_by: string;
}

/**
 * Payment validation result
 */
export interface PaymentValidation {
  is_valid: boolean;
  errors: string[];
  warnings?: string[];
  order_total?: number;
  amount_paid?: number;
  remaining_amount?: number;
}

/**
 * Payment summary for an order
 */
export interface PaymentSummary {
  order_id: string;
  order_total: number;
  total_paid: number;
  total_refunded: number;
  remaining_amount: number;
  payments: Payment[];
  is_fully_paid: boolean;
  is_overpaid: boolean;
}

/**
 * Payment filters for queries
 */
export interface PaymentFilters {
  order_id?: string;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  processed_by?: string;
}

/**
 * Payment statistics
 */
export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  by_method: {
    method: PaymentMethod;
    count: number;
    total_amount: number;
  }[];
  by_status: {
    status: PaymentStatus;
    count: number;
    total_amount: number;
  }[];
  average_payment: number;
  refund_rate: number;
}

/**
 * Stripe payment intent data (for card payments)
 */
export interface StripePaymentIntentData {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Payment processing result
 */
export interface PaymentProcessingResult {
  success: boolean;
  payment?: Payment;
  order_updated?: boolean;
  error?: string;
  transaction_id?: string;
}

/**
 * Bulk payment creation result
 */
export interface BulkPaymentResult {
  success: boolean;
  payments: Payment[];
  failed_payments?: {
    index: number;
    error: string;
  }[];
  order_updated: boolean;
}
