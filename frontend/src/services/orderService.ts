import api from './api';

const RESTAURANT_ID = '2c88c32a-03ba-4ef3-96e4-f37cf4b165de'; // Golden Fork Restaurant UUID

// Order Types
export interface OrderItem {
  id?: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  special_instructions?: string;
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
  table_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  total_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  table?: {
    id: string;
    table_number: string;
    capacity: number;
    status: string;
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
    return api.get(url);
  },

  // Get single order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    return api.get(url);
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders`;
    return api.post(url, orderData);
  },

  // Update order
  updateOrder: async (orderId: string, orderData: Partial<CreateOrderRequest>): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    return api.patch(url, orderData);
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderResponse> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`;
    return api.patch(url, { status });
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const url = `/restaurants/${RESTAURANT_ID}/orders/${orderId}`;
    return api.delete(url);
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
