import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import restaurantSlice from './slices/restaurantSlice';
import menuSlice from './slices/menuSlice';
import tableSlice from './slices/tableSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    restaurant: restaurantSlice,
    menu: menuSlice,
    tables: tableSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;