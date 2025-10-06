import axios from 'axios';
import {
  CreateReservationData,
  UpdateReservationData,
  ReservationResponse,
  AvailabilityResponse
} from '../types/reservation';

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
    const token = localStorage.getItem('token');
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

export default new ReservationService();
