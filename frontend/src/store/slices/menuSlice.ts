import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import menuService, { MenuCategory, MenuItem, MenuFilters } from '../../services/menuService';

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

export const createCategory = createAsyncThunk(
  'menu/createCategory',
  async (category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      return await menuService.createCategory(category);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'menu/updateCategory',
  async ({ id, updates }: { id: string; updates: Partial<MenuCategory> }, { rejectWithValue }) => {
    try {
      return await menuService.updateCategory(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'menu/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await menuService.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete category');
    }
  }
);

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> & { category: string }), { rejectWithValue }) => {
    try {
      return await menuService.createMenuItem(item);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create menu item');
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, updates }: { id: string; updates: Partial<MenuItem> }, { rejectWithValue }) => {
    try {
      return await menuService.updateMenuItem(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update menu item');
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await menuService.deleteMenuItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete menu item');
    }
  }
);

export const toggleItemAvailability = createAsyncThunk(
  'menu/toggleItemAvailability',
  async (id: string, { rejectWithValue }) => {
    try {
      return await menuService.toggleItemAvailability(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle item availability');
    }
  }
);

// State interface
interface MenuState {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  fullMenu: { category: MenuCategory; items: MenuItem[] }[];
  featuredItems: MenuItem[];
  currentCategory: string | null;
  currentMenuItem: MenuItem | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  filters: MenuFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: MenuState = {
  categories: [],
  menuItems: [],
  fullMenu: [],
  featuredItems: [],
  currentCategory: null,
  currentMenuItem: null,
  pagination: null,
  filters: {
    available: true
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<string | null>) => {
      state.currentCategory = action.payload;
    },
    setCurrentMenuItem: (state, action: PayloadAction<MenuItem | null>) => {
      state.currentMenuItem = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<MenuFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMenuData: (state) => {
      state.menuItems = [];
      state.pagination = null;
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
      });

    // Fetch Menu Items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItems = action.payload;
        // state.pagination = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Full Menu
    builder
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
      });

    // Fetch Featured Items
    builder
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

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isSaving = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.categories.findIndex((cat: any) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Delete Category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSaving = false;
        state.categories = state.categories.filter((cat: any) => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Create Menu Item
    builder
      .addCase(createMenuItem.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.isSaving = false;
        state.menuItems.push(action.payload);
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Update Menu Item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.menuItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.menuItems[index] = action.payload;
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Delete Menu Item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isSaving = false;
        state.menuItems = state.menuItems.filter(item => item.id !== action.payload);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Toggle Item Availability
    builder
      .addCase(toggleItemAvailability.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(toggleItemAvailability.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.menuItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.menuItems[index] = action.payload;
        }
      })
      .addCase(toggleItemAvailability.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentCategory,
  setCurrentMenuItem,
  setFilters,
  clearError,
  clearMenuData,
} = menuSlice.actions;

export default menuSlice.reducer;



