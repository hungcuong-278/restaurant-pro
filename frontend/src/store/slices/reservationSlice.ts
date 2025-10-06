import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import reservationService from '../../services/reservationService';
import { Reservation, CreateReservationData, UpdateReservationData } from '../../types/reservation';

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  availableTables: any[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  availableTables: [],
  loading: false,
  error: null,
  success: null
};

/**
 * Create new reservation
 */
export const createReservation = createAsyncThunk(
  'reservation/create',
  async (data: CreateReservationData, { rejectWithValue }) => {
    try {
      const response = await reservationService.createReservation(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reservation');
    }
  }
);

/**
 * Get user's reservations
 */
export const fetchMyReservations = createAsyncThunk(
  'reservation/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationService.getMyReservations();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations');
    }
  }
);

/**
 * Get single reservation
 */
export const fetchReservation = createAsyncThunk(
  'reservation/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.getReservationById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservation');
    }
  }
);

/**
 * Update reservation
 */
export const updateReservation = createAsyncThunk(
  'reservation/update',
  async ({ id, data }: { id: string; data: UpdateReservationData }, { rejectWithValue }) => {
    try {
      const response = await reservationService.updateReservation(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reservation');
    }
  }
);

/**
 * Cancel reservation
 */
export const cancelReservation = createAsyncThunk(
  'reservation/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reservationService.cancelReservation(id);
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reservation');
    }
  }
);

/**
 * Check table availability
 */
export const checkAvailability = createAsyncThunk(
  'reservation/checkAvailability',
  async (params: { date: string; time: string; party_size: number }, { rejectWithValue }) => {
    try {
      const response = await reservationService.checkAvailability(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.reservation) {
          state.reservations.unshift(action.payload.reservation);
          state.currentReservation = action.payload.reservation;
        }
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch my reservations
      .addCase(fetchMyReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload.reservations || [];
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch single reservation
      .addCase(fetchReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReservation = action.payload.reservation;
      })
      .addCase(fetchReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.reservation) {
          const index = state.reservations.findIndex(r => r.id === action.payload.reservation.id);
          if (index !== -1) {
            state.reservations[index] = action.payload.reservation;
          }
          state.currentReservation = action.payload.reservation;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update reservation status in list
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index].status = 'cancelled';
        }
        // Update current reservation if it's the one being cancelled
        if (state.currentReservation?.id === action.payload.id) {
          state.currentReservation.status = 'cancelled';
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Check availability
      .addCase(checkAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availableTables = action.payload.tables || [];
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearSuccess, clearCurrentReservation } = reservationSlice.actions;
export default reservationSlice.reducer;
