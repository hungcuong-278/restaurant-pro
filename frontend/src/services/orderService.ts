import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Restaurant ID - In production, this would come from auth context
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;  // Backend returns this
  item_price: number;  // Backend returns this
  quantity: number;
  total_price: number;  // Backend returns this
  special_instructions?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  // Helper properties for compatibility
  unit_price?: number;  // Alias for item_price
  subtotal?: number;  // Alias for total_price
  menu_item?: {  // Optional nested object
    id: string;
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string;
  table_number?: string;
  order_number: string;
  order_type: 'dine_in' | 'takeout' | 'delivery';  // Backend uses underscore
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  tip_amount?: number;
  special_instructions?: string;
  customer_notes?: string;
  kitchen_notes?: string;
  created_at: string;
  updated_at: string;
  ordered_at?: number;
  confirmed_at?: number | null;
  ready_at?: number | null;
  served_at?: number | null;
  completed_at?: number | null;
  items?: OrderItem[];
  payment_status?: 'unpaid' | 'paid' | 'partially_paid';
  paid_at?: string | null;
  table?: {
    id: string;
    number?: string;  // Backend returns this
    table_number: string;
    location?: string;
    capacity: number;
    status: string;
  };
}

export interface CreateOrderData {
  table_id?: string;
  order_type: 'dine_in' | 'takeout' | 'delivery';  // Match backend format (underscore)
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
  special_instructions?: string;
}

export interface UpdateOrderData {
  table_id?: string;
  order_type?: 'dine_in' | 'takeout' | 'delivery';  // Match backend format (underscore)
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  special_instructions?: string;
}

export interface OrderFilters {
  status?: string;
  order_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const orderService = {
  // Get all orders
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.order_type) params.append('order_type', filters.order_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      // Backend returns { success: true, data: [...] }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}`
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Create new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
        orderData
      );
      // Backend returns { success: true, data: {...} }
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order
  async updateOrder(orderId: string, orderData: UpdateOrderData): Promise<Order> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}`
      );
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Add item to order
  async addOrderItem(orderId: string, item: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
  }): Promise<OrderItem> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/items`,
        item
      );
      return response.data;
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  },

  // Update order item
  async updateOrderItem(orderId: string, itemId: string, updates: {
    quantity?: number;
    special_instructions?: string;
  }): Promise<OrderItem> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/items/${itemId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  },

  // Remove order item
  async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/items/${itemId}`
      );
    } catch (error) {
      console.error('Error removing order item:', error);
      throw error;
    }
  },
};

export { orderService };
export default orderService;
