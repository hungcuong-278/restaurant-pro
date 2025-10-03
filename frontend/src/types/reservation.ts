/**
 * Reservation Type Definitions
 * 
 * This file contains all TypeScript interfaces and types
 * for the reservation system.
 */

// ============================================
// CORE RESERVATION INTERFACE
// ============================================

export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string; // YYYY-MM-DD format
  reservation_time: string; // HH:MM format (24-hour)
  duration: number; // Duration in minutes (default: 120)
  status: ReservationStatus;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// RESERVATION STATUS
// ============================================

export type ReservationStatus = 
  | 'pending'      // Awaiting confirmation
  | 'confirmed'    // Confirmed by restaurant
  | 'seated'       // Customer has arrived and seated
  | 'completed'    // Reservation finished
  | 'cancelled'    // Cancelled by customer or restaurant
  | 'no-show';     // Customer didn't show up

// ============================================
// CREATE RESERVATION DTO
// ============================================

export interface CreateReservationDto {
  restaurant_id: string;
  table_id?: string; // Optional - system can auto-assign
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM (24-hour format)
  duration?: number; // Optional - defaults to 120 minutes
  special_requests?: string;
}

// ============================================
// UPDATE RESERVATION DTO
// ============================================

export interface UpdateReservationDto {
  table_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  duration?: number;
  status?: ReservationStatus;
  special_requests?: string;
}

// ============================================
// TABLE AVAILABILITY
// ============================================

export interface TableAvailability {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  location?: string;
  available: boolean;
  current_reservation_id?: string;
}

// ============================================
// AVAILABILITY CHECK REQUEST
// ============================================

export interface AvailabilityCheckDto {
  restaurant_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  party_size: number;
}

// ============================================
// BOOKING STEP (for multi-step form)
// ============================================

export type BookingStep = 
  | 'datetime'     // Step 1: Select date and time
  | 'table'        // Step 2: Select table
  | 'details'      // Step 3: Enter customer details
  | 'review';      // Step 4: Review and confirm

// ============================================
// FORM STATE (for ReservationPage)
// ============================================

export interface ReservationFormState {
  currentStep: BookingStep;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedTable: TableAvailability | null;
  partySize: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests: string;
  duration: number; // minutes
}

// ============================================
// TIME SLOT
// ============================================

export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  availableCount: number; // Number of available tables at this time
}

// ============================================
// RESERVATION FILTER
// ============================================

export interface ReservationFilter {
  status?: ReservationStatus | ReservationStatus[];
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  customer_name?: string;
  table_id?: string;
}

// ============================================
// RESERVATION STATS (for analytics)
// ============================================

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  seated: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ReservationResponse {
  success: boolean;
  message?: string;
  data?: Reservation;
}

export interface ReservationsListResponse {
  success: boolean;
  message?: string;
  data?: Reservation[];
}

export interface AvailabilityResponse {
  success: boolean;
  message?: string;
  data?: TableAvailability[];
}

// ============================================
// ERROR TYPES
// ============================================

export interface ReservationError {
  field?: string;
  message: string;
  code?: string;
}

// ============================================
// VALIDATION RULES
// ============================================

export const RESERVATION_CONSTRAINTS = {
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 20,
  MIN_DURATION: 30, // minutes
  MAX_DURATION: 480, // 8 hours
  DEFAULT_DURATION: 120, // 2 hours
  MIN_ADVANCE_HOURS: 2, // Must book at least 2 hours in advance
  MAX_ADVANCE_DAYS: 90, // Can book up to 90 days in advance
  PHONE_PATTERN: /^[\d\s\-+()]+$/, // Allow digits, spaces, dashes, plus, parentheses
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ============================================
// BUSINESS HOURS
// ============================================

export interface BusinessHours {
  open: string; // HH:MM format (e.g., "11:00")
  close: string; // HH:MM format (e.g., "22:00")
  timeSlotInterval: number; // minutes (e.g., 30 for 30-minute slots)
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  open: '11:00',
  close: '22:00',
  timeSlotInterval: 30,
};

// ============================================
// HELPER TYPE GUARDS
// ============================================

export const isReservationStatus = (status: string): status is ReservationStatus => {
  return ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'].includes(status);
};

export const isBookingStep = (step: string): step is BookingStep => {
  return ['datetime', 'table', 'details', 'review'].includes(step);
};

// ============================================
// DISPLAY HELPERS
// ============================================

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'yellow', // Warning color
  confirmed: 'green', // Success color
  seated: 'blue', // Info color
  completed: 'gray', // Neutral color
  cancelled: 'red', // Error color
  'no-show': 'red', // Error color
};

export const BOOKING_STEP_LABELS: Record<BookingStep, string> = {
  datetime: 'Date & Time',
  table: 'Select Table',
  details: 'Your Details',
  review: 'Review & Confirm',
};
