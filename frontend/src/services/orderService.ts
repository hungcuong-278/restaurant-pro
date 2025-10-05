import api from './api';

const RESTAURANT_ID = '2c88c32a-03ba-4ef3-96e4-f37cf4b165de'; // Golden Fork Restaurant UUID

// Order Types
export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  total_price: number;
  special_instructions?: string;
  status?: string;
  // Legacy fields (for backward compatibility)
  unit_price?: number;
  subtotal?: number;
  menu_item?: {
    id: string;
    name: string;
    price: number;
    category: string;
    available: boolean;
  };
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  order_number: string;
  order_type: 'dine_in' | 'takeout' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  tip_amount?: number;
  total_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  customer_notes?: string;
  kitchen_notes?: string;
  special_instructions?: string;
  ordered_at: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  table?: {
    id: string;
    number?: string;
    table_number?: string;
    location?: string;
    capacity?: number;
    status?: string;
  };
}

export interface CreateOrderRequest {
  order_type: 'dine_in' | 'takeout' | 'delivery';
  table_id?: string; // Optional for takeout/delivery
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
  special_instructions?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

// Order Service API
export const orderService = {
  // Get all orders for the restaurant
  getAllOrders: async (filters?: {
    status?: string;
    payment_status?: string;
    table_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const url = `/restaurants/${RESTAURANT_ID}/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders`;
    const response = await api.post(url, orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (orderId: string, orderData: Partial<CreateOrderRequest>): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    const response = await api.patch(url, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`;
    const response = await api.patch(url, { status });
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    const response = await api.delete(url);
    return response.data;
  },

  // Add item to order
  addOrderItem: async (
    orderId: string,
    item: { menu_item_id: string; quantity: number; special_instructions?: string }
  ): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/items`;
    return api.post(url, item);
  },

  // Update order item
  updateOrderItem: async (
    orderId: string,
    itemId: string,
    updates: { quantity?: number; special_instructions?: string }
  ): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/items/${itemId}`;
    return api.patch(url, updates);
  },

  // Remove item from order
  removeOrderItem: async (orderId: string, itemId: string): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/items/${itemId}`;
    return api.delete(url);
  },
};

export default orderService;
