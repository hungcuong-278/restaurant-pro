import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Table, TableLayout, TableStatusUpdate, TablePositionUpdate, BulkPositionUpdate } from '../../types/table';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface TableState {
  tables: Table[];
  selectedTable: Table | null;
  layout: TableLayout | null;
  loading: boolean;
  error: string | null;
  realTimeUpdates: boolean;
}

const initialState: TableState = {
  tables: [],
  selectedTable: null,
  layout: null,
  loading: false,
  error: null,
  realTimeUpdates: false,
};

// Async Thunks
export const fetchTables = createAsyncThunk(
  'tables/fetchTables',
  async (restaurantId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/tables`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tables');
    }
  }
);

export const fetchTableLayout = createAsyncThunk(
  'tables/fetchLayout',
  async (restaurantId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/tables/layout`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch layout');
    }
  }
);

export const createTable = createAsyncThunk(
  'tables/create',
  async ({ restaurantId, tableData }: { restaurantId: string; tableData: Partial<Table> }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/restaurants/${restaurantId}/tables`, tableData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create table');
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  'tables/updateStatus',
  async ({ restaurantId, id, status }: TableStatusUpdate & { restaurantId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/${id}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const updateTablePosition = createAsyncThunk(
  'tables/updatePosition',
  async ({ restaurantId, id, position }: TablePositionUpdate & { restaurantId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/${id}/position`, { position });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update position');
    }
  }
);

export const bulkUpdatePositions = createAsyncThunk(
  'tables/bulkUpdatePositions',
  async ({ restaurantId, positions }: BulkPositionUpdate & { restaurantId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/restaurants/${restaurantId}/tables/positions/bulk`, { positions });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update positions');
    }
  }
);

export const deleteTable = createAsyncThunk(
  'tables/delete',
  async ({ restaurantId, id }: { restaurantId: string; id: string }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/restaurants/${restaurantId}/tables/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete table');
    }
  }
);

// Slice
const tableSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    selectTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleRealTimeUpdates: (state) => {
      state.realTimeUpdates = !state.realTimeUpdates;
    },
    updateTableInState: (state, action: PayloadAction<Table>) => {
      const index = state.tables.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
      if (state.selectedTable?.id === action.payload.id) {
        state.selectedTable = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Tables
    builder.addCase(fetchTables.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTables.fulfilled, (state, action) => {
      state.loading = false;
      state.tables = action.payload;
    });
    builder.addCase(fetchTables.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Layout
    builder.addCase(fetchTableLayout.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTableLayout.fulfilled, (state, action) => {
      state.loading = false;
      state.layout = action.payload;
    });
    builder.addCase(fetchTableLayout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Table
    builder.addCase(createTable.fulfilled, (state, action) => {
      state.tables.push(action.payload);
    });
    builder.addCase(createTable.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Update Status
    builder.addCase(updateTableStatus.fulfilled, (state, action) => {
      const index = state.tables.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
      if (state.selectedTable?.id === action.payload.id) {
        state.selectedTable = action.payload;
      }
    });
    builder.addCase(updateTableStatus.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Update Position
    builder.addCase(updateTablePosition.fulfilled, (state, action) => {
      const index = state.tables.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
    });

    // Bulk Update Positions
    builder.addCase(bulkUpdatePositions.fulfilled, (state, action) => {
      // Update multiple tables at once
      action.payload.forEach((updatedTable: Table) => {
        const index = state.tables.findIndex(t => t.id === updatedTable.id);
        if (index !== -1) {
          state.tables[index] = updatedTable;
        }
      });
    });

    // Delete Table
    builder.addCase(deleteTable.fulfilled, (state, action) => {
      state.tables = state.tables.filter(t => t.id !== action.payload);
      if (state.selectedTable?.id === action.payload) {
        state.selectedTable = null;
      }
    });
  },
});

export const { selectTable, clearError, toggleRealTimeUpdates, updateTableInState } = tableSlice.actions;
export default tableSlice.reducer;
