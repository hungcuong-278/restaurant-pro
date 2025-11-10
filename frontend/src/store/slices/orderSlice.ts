import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService, Order } from '../../services/orderService';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string) => {
    const response = await orderService.getOrder(orderId);
    return response;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        const existingIndex = state.orders.findIndex(o => o.id === action.payload.id);
        if (existingIndex >= 0) {
          state.orders[existingIndex] = action.payload;
        } else {
          state.orders.push(action.payload);
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch order';
      });
  },
});

export default orderSlice.reducer;
