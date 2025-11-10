import axios from 'axios';
import {
  Reservation,
  CreateReservationData,
  UpdateReservationData,
  ReservationResponse,
  AvailabilityResponse
} from '../types/reservation';
import { AUTH_STORAGE_KEYS } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token interceptor
const reservationApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
reservationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class ReservationService {
  /**
   * Create new reservation
   */
  async createReservation(data: CreateReservationData): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.post('/reservations', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to create reservation');
    }
  }

  /**
   * Get user's reservations
   */
  async getMyReservations(): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.get('/reservations/my');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to fetch reservations');
    }
  }

  /**
   * Get all reservations (Admin only)
   */
  async getReservations(): Promise<Reservation[]> {
    try {
      const response = await reservationApi.get('/reservations');
      return response.data.reservations || response.data.data || [];
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to fetch reservations');
    }
  }

  /**
   * Get single reservation by ID
   */
  async getReservationById(id: string): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.get(`/reservations/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to fetch reservation');
    }
  }

  /**
   * Update reservation
   */
  async updateReservation(id: string, data: UpdateReservationData): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.put(`/reservations/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to update reservation');
    }
  }

  /**
   * Update reservation status (Admin only)
   */
  async updateReservationStatus(id: string, status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.put(`/reservations/${id}`, { status });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to update reservation status');
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(id: string): Promise<ReservationResponse> {
    try {
      const response = await reservationApi.delete(`/reservations/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to cancel reservation');
    }
  }

  /**
   * Check table availability
   */
  async checkAvailability(params: {
    date: string;
    time: string;
    party_size: number;
  }): Promise<AvailabilityResponse> {
    try {
      const response = await reservationApi.get('/reservations/available-tables', { params });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error;
      }
      throw new Error('Failed to check availability');
    }
  }
}

const reservationService = new ReservationService();
export default reservationService;

// Export types for convenience
export type { Reservation } from '../types/reservation';

// ===== UTILITY FUNCTIONS =====

/**
 * Generate time slots for booking
 */
export const generateTimeSlots = (
  openTime: string = '11:00',
  closeTime: string = '21:00',
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  
  let currentMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;
  
  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }
  
  return slots;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: string): boolean => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate < today;
};

/**
 * Check if booking is too soon (less than 2 hours)
 */
export const isTooSoon = (date: string, time: string): boolean => {
  const bookingDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return bookingDateTime < twoHoursFromNow;
};

/**
 * Check if booking is too far ahead (more than 90 days)
 */
export const isTooFarAhead = (date: string): boolean => {
  const selectedDate = new Date(date);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return selectedDate > maxDate;
};

/**
 * Format date for display (e.g., "Monday, October 15, 2025")
 */
export const formatDateForDisplay = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display (e.g., "7:00 PM")
 */
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};
