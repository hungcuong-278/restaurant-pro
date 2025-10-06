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
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  tables?: any[];
  count?: number;
  message?: string;
}
