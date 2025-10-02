import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  restaurants: [],
  currentRestaurant: null,
  menuItems: [],
  isLoading: false,
  error: null,
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      state.restaurants = action.payload;
    },
    setCurrentRestaurant: (state, action: PayloadAction<Restaurant>) => {
      state.currentRestaurant = action.payload;
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.menuItems = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setRestaurants,
  setCurrentRestaurant,
  setMenuItems,
  setError,
  clearError,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;