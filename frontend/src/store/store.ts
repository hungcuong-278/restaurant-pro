import { configureStore } from '@reduxjs/toolkit';
// Note: authSlice removed - using AuthContext instead
import restaurantSlice from './slices/restaurantSlice';
import menuSlice from './slices/menuSlice';
import tableSlice from './slices/tableSlice';
import reservationSlice from './slices/reservationSlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    // auth: removed - using AuthContext instead
    restaurant: restaurantSlice,
    menu: menuSlice,
    tables: tableSlice,
    reservation: reservationSlice,
    orders: orderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
