/**
 * Reservation Service
 * 
 * API service layer for reservation-related operations.
 * Handles all HTTP requests to the backend reservation endpoints.
 */

import api from './api';
import {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
  TableAvailability,
  ReservationResponse,
  ReservationsListResponse,
  AvailabilityResponse,
} from '../types/reservation';

// ============================================
// API ENDPOINTS
// ============================================

const ENDPOINTS = {
  // Reservation CRUD
  CREATE_RESERVATION: (restaurantId: string) =>
    `/restaurants/${restaurantId}/reservations`,
  GET_RESERVATIONS: (restaurantId: string) =>
    `/restaurants/${restaurantId}/reservations`,
  GET_RESERVATION: (reservationId: string) =>
    `/reservations/${reservationId}`,
  UPDATE_RESERVATION: (reservationId: string) =>
    `/reservations/${reservationId}`,
  DELETE_RESERVATION: (reservationId: string) =>
    `/reservations/${reservationId}`,
  
  // User reservations
  GET_USER_RESERVATIONS: (userId: string) =>
    `/reservations/user/${userId}`,
  
  // Table availability
  GET_AVAILABLE_TABLES: (restaurantId: string) =>
    `/restaurants/${restaurantId}/tables/availability/check`,
};

// ============================================
// TABLE AVAILABILITY
// ============================================

/**
 * Get available tables for a specific date, time, and party size
 */
export const getAvailableTables = async (
  restaurantId: string,
  date: string,
  time: string,
  partySize?: number
): Promise<AvailabilityResponse> => {
  try {
    const params: any = { date, time };
    if (partySize) {
      params.party_size = partySize;
    }

    const response = await api.get<AvailabilityResponse>(
      ENDPOINTS.GET_AVAILABLE_TABLES(restaurantId),
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching available tables:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch available tables'
    );
  }
};

/**
 * Check if tables are available for given criteria
 */
export const checkAvailability = async (
  restaurantId: string,
  date: string,
  time: string,
  partySize?: number
): Promise<boolean> => {
  try {
    const response = await getAvailableTables(restaurantId, date, time, partySize);
    return (response.data || []).length > 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
};

// ============================================
// RESERVATION CRUD
// ============================================

/**
 * Create a new reservation
 */
export const createReservation = async (
  reservationData: CreateReservationDto
): Promise<ReservationResponse> => {
  try {
    const response = await api.post<ReservationResponse>(
      ENDPOINTS.CREATE_RESERVATION(reservationData.restaurant_id),
      reservationData
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to create reservation'
    );
  }
};

/**
 * Get all reservations for a restaurant
 */
export const getRestaurantReservations = async (
  restaurantId: string,
  filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
  }
): Promise<ReservationsListResponse> => {
  try {
    const response = await api.get<ReservationsListResponse>(
      ENDPOINTS.GET_RESERVATIONS(restaurantId),
      { params: filters }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch reservations'
    );
  }
};

/**
 * Get all reservations for a specific user
 */
export const getUserReservations = async (
  userId: string
): Promise<ReservationsListResponse> => {
  try {
    const response = await api.get<ReservationsListResponse>(
      ENDPOINTS.GET_USER_RESERVATIONS(userId)
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching user reservations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user reservations'
    );
  }
};

/**
 * Get a single reservation by ID
 */
export const getReservationById = async (
  reservationId: string
): Promise<ReservationResponse> => {
  try {
    const response = await api.get<ReservationResponse>(
      ENDPOINTS.GET_RESERVATION(reservationId)
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching reservation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch reservation'
    );
  }
};

/**
 * Update an existing reservation
 */
export const updateReservation = async (
  reservationId: string,
  updates: UpdateReservationDto
): Promise<ReservationResponse> => {
  try {
    const response = await api.patch<ReservationResponse>(
      ENDPOINTS.UPDATE_RESERVATION(reservationId),
      updates
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to update reservation'
    );
  }
};

/**
 * Cancel a reservation (sets status to 'cancelled')
 */
export const cancelReservation = async (
  reservationId: string
): Promise<ReservationResponse> => {
  try {
    const response = await api.patch<ReservationResponse>(
      ENDPOINTS.UPDATE_RESERVATION(reservationId),
      { status: 'cancelled' }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to cancel reservation'
    );
  }
};

/**
 * Delete a reservation permanently
 */
export const deleteReservation = async (
  reservationId: string
): Promise<void> => {
  try {
    await api.delete(ENDPOINTS.DELETE_RESERVATION(reservationId));
  } catch (error: any) {
    console.error('Error deleting reservation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to delete reservation'
    );
  }
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate reservation data before submission
 */
export const validateReservationData = (
  data: CreateReservationDto
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Customer name
  if (!data.customer_name || data.customer_name.trim().length === 0) {
    errors.push('Customer name is required');
  }

  // Customer email
  if (!data.customer_email || data.customer_email.trim().length === 0) {
    errors.push('Customer email is required');
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.customer_email)) {
      errors.push('Invalid email format');
    }
  }

  // Customer phone
  if (!data.customer_phone || data.customer_phone.trim().length === 0) {
    errors.push('Customer phone is required');
  } else {
    const phonePattern = /^[\d\s\-+()]+$/;
    if (!phonePattern.test(data.customer_phone)) {
      errors.push('Invalid phone format');
    }
  }

  // Party size
  if (!data.party_size || data.party_size < 1) {
    errors.push('Party size must be at least 1');
  } else if (data.party_size > 20) {
    errors.push('Party size cannot exceed 20');
  }

  // Date
  if (!data.reservation_date) {
    errors.push('Reservation date is required');
  } else {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(data.reservation_date)) {
      errors.push('Invalid date format (YYYY-MM-DD)');
    }
  }

  // Time
  if (!data.reservation_time) {
    errors.push('Reservation time is required');
  } else {
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(data.reservation_time)) {
      errors.push('Invalid time format (HH:MM)');
    }
  }

  // Duration (if provided)
  if (data.duration !== undefined) {
    if (data.duration < 30) {
      errors.push('Duration must be at least 30 minutes');
    } else if (data.duration > 480) {
      errors.push('Duration cannot exceed 8 hours');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================
// DATE/TIME HELPERS
// ============================================

/**
 * Generate time slots for a given date
 */
export const generateTimeSlots = (
  openTime: string = '11:00',
  closeTime: string = '22:00',
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute
      .toString()
      .padStart(2, '0')}`;
    slots.push(timeString);

    // Add interval
    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  return checkDate < today;
};

/**
 * Check if a date/time is too soon (within minimum advance hours)
 */
export const isTooSoon = (
  date: string,
  time: string,
  minAdvanceHours: number = 2
): boolean => {
  const reservationDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const diffMs = reservationDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < minAdvanceHours;
};

/**
 * Check if a date is too far in the future
 */
export const isTooFarAhead = (date: string, maxAdvanceDays: number = 90): boolean => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  const checkDate = new Date(date);
  return checkDate > maxDate;
};

/**
 * Format date for display (YYYY-MM-DD to readable format)
 */
export const formatDateForDisplay = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display (HH:MM to 12-hour format)
 */
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};
