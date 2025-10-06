// Reservation Types
export interface Reservation {
  id: string;
  restaurant_id: string;
  table_id?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  notes?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields from tables
  table_number?: string;
  capacity?: number;
  location?: string;
  // Joined fields from restaurants
  restaurant_name?: string;
}

export interface CreateReservationData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  table_id?: string;
  special_requests?: string;
}

export interface UpdateReservationData {
  party_size?: number;
  reservation_date?: string;
  reservation_time?: string;
  table_id?: string;
  status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  notes?: string;
}

export interface ReservationResponse {
  success: boolean;
  message?: string;
  reservation?: Reservation;
  reservations?: Reservation[];
  count?: number;
  id?: string; // For operations that return just an ID
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  tables?: any[];
  count?: number;
  message?: string;
}

// Table availability for reservation
export interface TableAvailability {
  id: string;
  table_number: string;
  capacity: number;
  location?: string;
  is_available: boolean;
  restaurant_id: string;
}

// Reservation status type
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

// Booking steps for multi-step form
export type BookingStep = 'datetime' | 'table' | 'details' | 'confirmation';

// Reservation constraints
export const RESERVATION_CONSTRAINTS = {
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 20,
  MIN_ADVANCE_HOURS: 2,
  MAX_ADVANCE_DAYS: 90,
  BOOKING_DURATION_MINUTES: 120,
  CANCELLATION_DEADLINE_HOURS: 4,
};

// Business hours configuration
export const DEFAULT_BUSINESS_HOURS = {
  OPEN_TIME: '11:00',
  CLOSE_TIME: '21:00',
  TIME_SLOT_MINUTES: 30,
};

// Status colors for UI
export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'yellow',
  confirmed: 'green',
  seated: 'blue',
  completed: 'gray',
  cancelled: 'red',
  no_show: 'purple',
};

// Status labels for display
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};
