import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import restaurantSlice from './slices/restaurantSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    restaurant: restaurantSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;