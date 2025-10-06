import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import reservationService from '../../services/reservationService';
import { Reservation, CreateReservationData, UpdateReservationData, TableAvailability, BookingStep } from '../../types/reservation';

export interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  availableTables: TableAvailability[];
  
  // Multi-step booking state
  currentStep: BookingStep;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedTable: TableAvailability | null;
  partySize: number;
  
  // Loading states
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  isCheckingAvailability: boolean;
  isCreatingReservation: boolean;
  
  // Error states
  error: string | null;
  availabilityError: string | null;
  
  // Success state
  success: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  availableTables: [],
  
  // Multi-step booking initial state
  currentStep: 'datetime',
  selectedDate: null,
  selectedTime: null,
  selectedTable: null,
  partySize: 2,
  
  // Loading states
  loading: false,
  isLoading: false,
  isCheckingAvailability: false,
  isCreatingReservation: false,
  
  // Error states
  error: null,
  availabilityError: null,
  
  // Success state
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
    // Clear errors and success messages
    clearError: (state) => {
      state.error = null;
      state.availabilityError = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    },
    
    // Multi-step booking actions
    setCurrentStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      const steps: BookingStep[] = ['datetime', 'table', 'details', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },
    previousStep: (state) => {
      const steps: BookingStep[] = ['datetime', 'table', 'details', 'confirmation'];
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string | null>) => {
      state.selectedTime = action.payload;
    },
    setSelectedTable: (state, action: PayloadAction<TableAvailability | null>) => {
      state.selectedTable = action.payload;
    },
    setPartySize: (state, action: PayloadAction<number>) => {
      state.partySize = action.payload;
    },
    clearSelection: (state) => {
      state.currentStep = 'datetime';
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedTable = null;
      state.partySize = 2;
      state.availableTables = [];
      state.availabilityError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.isCreatingReservation = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isCreatingReservation = false;
        state.success = action.payload.message || 'Reservation created successfully';
        if (action.payload.reservation) {
          state.reservations.unshift(action.payload.reservation);
          state.currentReservation = action.payload.reservation;
        }
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.isCreatingReservation = false;
        state.error = action.payload as string;
      })

      // Fetch my reservations
      .addCase(fetchMyReservations.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.reservations = action.payload.reservations || [];
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single reservation
      .addCase(fetchReservation.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.currentReservation = action.payload.reservation || null;
      })
      .addCase(fetchReservation.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.success = action.payload.message || 'Reservation updated successfully';
        if (action.payload.reservation) {
          const index = state.reservations.findIndex(r => r.id === action.payload.reservation!.id);
          if (index !== -1) {
            state.reservations[index] = action.payload.reservation;
          }
          state.currentReservation = action.payload.reservation;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Cancel reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.success = action.payload.message || 'Reservation cancelled successfully';
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
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check availability
      .addCase(checkAvailability.pending, (state) => {
        state.isCheckingAvailability = true;
        state.availabilityError = null;
        state.availableTables = [];
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.isCheckingAvailability = false;
        state.availableTables = action.payload.tables || [];
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.isCheckingAvailability = false;
        state.availabilityError = action.payload as string;
      });
  }
});

// Export all actions
export const {
  clearError,
  clearSuccess,
  clearCurrentReservation,
  setCurrentStep,
  nextStep,
  previousStep,
  setSelectedDate,
  setSelectedTime,
  setSelectedTable,
  setPartySize,
  clearSelection
} = reservationSlice.actions;

export default reservationSlice.reducer;
