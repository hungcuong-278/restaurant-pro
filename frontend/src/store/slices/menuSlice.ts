import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import menuService, { MenuItem, MenuFilters } from '../../services/menuService';

// Async thunks for menu operations
export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await menuService.getCategories();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
    }
  }
);

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (filters: MenuFilters = {}, { rejectWithValue }) => {
    try {
      return await menuService.getMenuItems(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch menu items');
    }
  }
);

export const fetchFullMenu = createAsyncThunk(
  'menu/fetchFullMenu',
  async (_, { rejectWithValue }) => {
    try {
      return await menuService.getFullMenu();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch full menu');
    }
  }
);

export const fetchFeaturedItems = createAsyncThunk(
  'menu/fetchFeaturedItems',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      return await menuService.getFeaturedItems(limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch featured items');
    }
  }
);

// Simplified state interface for Phase 3
interface MenuState {
  menuItems: MenuItem[];
  categories: string[];
  fullMenu: any[];
  featuredItems: MenuItem[];
  currentCategory: string | null;
  filters: MenuFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menuItems: [],
  categories: [],
  fullMenu: [],
  featuredItems: [],
  currentCategory: null,
  filters: {
    is_available: true
  },
  isLoading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<string | null>) => {
      state.currentCategory = action.payload;
    },
    setFilters: (state, action: PayloadAction<MenuFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Menu Items
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItems = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Full Menu
      .addCase(fetchFullMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFullMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.fullMenu = action.payload;
      })
      .addCase(fetchFullMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Featured Items
      .addCase(fetchFeaturedItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredItems = action.payload;
      })
      .addCase(fetchFeaturedItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentCategory, setFilters, clearError } = menuSlice.actions;
export default menuSlice.reducer;
