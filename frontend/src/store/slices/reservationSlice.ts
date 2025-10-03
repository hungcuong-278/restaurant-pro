/**
 * Reservation Redux Slice
 * 
 * Manages reservation state including:
 * - Available tables
 * - User reservations
 * - Current booking flow
 * - Selected date/time/table
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Reservation,
  CreateReservationDto,
  UpdateReservationDto,
  TableAvailability,
  ReservationStatus,
  BookingStep,
} from '../../types/reservation';
import * as reservationService from '../../services/reservationService';

// ============================================
// STATE INTERFACE
// ============================================

interface ReservationState {
  // List of user's reservations
  reservations: Reservation[];
  
  // Currently viewing/editing reservation
  currentReservation: Reservation | null;
  
  // Available tables for selected date/time
  availableTables: TableAvailability[];
  
  // Booking flow state
  currentStep: BookingStep;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedTable: TableAvailability | null;
  partySize: number;
  
  // Loading states
  isLoading: boolean;
  isCheckingAvailability: boolean;
  isCreatingReservation: boolean;
  
  // Error handling
  error: string | null;
  availabilityError: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  availableTables: [],
  currentStep: 'datetime',
  selectedDate: null,
  selectedTime: null,
  selectedTable: null,
  partySize: 2, // Default party size
  isLoading: false,
  isCheckingAvailability: false,
  isCreatingReservation: false,
  error: null,
  availabilityError: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Fetch available tables for given date, time, and party size
 */
export const fetchAvailableTables = createAsyncThunk(
  'reservation/fetchAvailableTables',
  async (
    params: {
      restaurantId: string;
      date: string;
      time: string;
      partySize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await reservationService.getAvailableTables(
        params.restaurantId,
        params.date,
        params.time,
        params.partySize
      );
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch available tables');
    }
  }
);

/**
 * Create a new reservation
 */
export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (reservationData: CreateReservationDto, { rejectWithValue }) => {
    try {
      const response = await reservationService.createReservation(reservationData);
      return response.data as Reservation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create reservation');
    }
  }
);

/**
 * Fetch all reservations for a user
 */
export const fetchUserReservations = createAsyncThunk(
  'reservation/fetchUserReservations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.getUserReservations(userId);
      return response.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  }
);

/**
 * Fetch a single reservation by ID
 */
export const fetchReservationById = createAsyncThunk(
  'reservation/fetchReservationById',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.getReservationById(reservationId);
      return response.data as Reservation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservation');
    }
  }
);

/**
 * Update an existing reservation
 */
export const updateReservation = createAsyncThunk(
  'reservation/updateReservation',
  async (
    params: { reservationId: string; updates: UpdateReservationDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await reservationService.updateReservation(
        params.reservationId,
        params.updates
      );
      return response.data as Reservation;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update reservation');
    }
  }
);

/**
 * Cancel a reservation
 */
export const cancelReservation = createAsyncThunk(
  'reservation/cancelReservation',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      await reservationService.cancelReservation(reservationId);
      return reservationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel reservation');
    }
  }
);

// ============================================
// SLICE
// ============================================

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    // Booking flow navigation
    setCurrentStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },

    nextStep: (state) => {
      const steps: BookingStep[] = ['datetime', 'table', 'details', 'review'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },

    previousStep: (state) => {
      const steps: BookingStep[] = ['datetime', 'table', 'details', 'review'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },

    // Date/Time selection
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
      // Reset time and table when date changes
      state.selectedTime = null;
      state.selectedTable = null;
      state.availableTables = [];
    },

    setSelectedTime: (state, action: PayloadAction<string | null>) => {
      state.selectedTime = action.payload;
      // Reset table when time changes
      state.selectedTable = null;
      state.availableTables = [];
    },

    // Table selection
    setSelectedTable: (state, action: PayloadAction<TableAvailability | null>) => {
      state.selectedTable = action.payload;
    },

    // Party size
    setPartySize: (state, action: PayloadAction<number>) => {
      state.partySize = action.payload;
      // Reset available tables when party size changes
      state.availableTables = [];
      state.selectedTable = null;
    },

    // Clear all selections (start new booking)
    clearSelection: (state) => {
      state.currentStep = 'datetime';
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedTable = null;
      state.availableTables = [];
      state.partySize = 2;
      state.error = null;
      state.availabilityError = null;
    },

    // Set current reservation for viewing/editing
    setCurrentReservation: (state, action: PayloadAction<Reservation | null>) => {
      state.currentReservation = action.payload;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.availabilityError = null;
    },
  },

  extraReducers: (builder) => {
    // ========================================
    // Fetch Available Tables
    // ========================================
    builder
      .addCase(fetchAvailableTables.pending, (state) => {
        state.isCheckingAvailability = true;
        state.availabilityError = null;
      })
      .addCase(fetchAvailableTables.fulfilled, (state, action) => {
        state.isCheckingAvailability = false;
        state.availableTables = action.payload;
        state.availabilityError = null;
      })
      .addCase(fetchAvailableTables.rejected, (state, action) => {
        state.isCheckingAvailability = false;
        state.availabilityError = action.payload as string;
        state.availableTables = [];
      });

    // ========================================
    // Create Reservation
    // ========================================
    builder
      .addCase(createReservation.pending, (state) => {
        state.isCreatingReservation = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isCreatingReservation = false;
        state.currentReservation = action.payload;
        state.reservations.unshift(action.payload); // Add to start of list
        state.error = null;
        // Clear booking flow after successful creation
        state.currentStep = 'datetime';
        state.selectedDate = null;
        state.selectedTime = null;
        state.selectedTable = null;
        state.availableTables = [];
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isCreatingReservation = false;
        state.error = action.payload as string;
      });

    // ========================================
    // Fetch User Reservations
    // ========================================
    builder
      .addCase(fetchUserReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload;
        state.error = null;
      })
      .addCase(fetchUserReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ========================================
    // Fetch Reservation By ID
    // ========================================
    builder
      .addCase(fetchReservationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload;
        state.error = null;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ========================================
    // Update Reservation
    // ========================================
    builder
      .addCase(updateReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReservation = action.payload;
        // Update in reservations list
        const index = state.reservations.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ========================================
    // Cancel Reservation
    // ========================================
    builder
      .addCase(cancelReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const reservationId = action.payload;
        // Update status to cancelled in list
        const reservation = state.reservations.find((r) => r.id === reservationId);
        if (reservation) {
          reservation.status = 'cancelled';
        }
        // Update current reservation if it's the cancelled one
        if (state.currentReservation?.id === reservationId) {
          state.currentReservation.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  setSelectedDate,
  setSelectedTime,
  setSelectedTable,
  setPartySize,
  clearSelection,
  setCurrentReservation,
  clearError,
} = reservationSlice.actions;

export default reservationSlice.reducer;
