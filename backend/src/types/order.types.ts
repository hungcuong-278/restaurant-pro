// Order Types and Interfaces

export type OrderType = 'dine_in' | 'takeout' | 'delivery';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type OrderItemStatus = 'ordered' | 'preparing' | 'ready' | 'served';

export interface Order {
  id: string;
  restaurant_id: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  discount_reason?: string;
  customer_notes?: string;
  kitchen_notes?: string;
  ordered_at: Date;
  confirmed_at?: Date;
  ready_at?: Date;
  served_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  total_price: number;
  special_instructions?: string;
  status: OrderItemStatus;
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  table?: {
    id: string;
    number: string;
    location?: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  staff?: {
    id: string;
    name: string;
  };
}

export interface OrderCreateData {
  restaurant_id: string;
  table_id?: string;
  customer_id?: string;
  staff_id?: string;
  order_type: OrderType;
  customer_notes?: string;
  kitchen_notes?: string;
  items: OrderItemCreateData[];
}

export interface OrderItemCreateData {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface OrderUpdateData {
  status?: OrderStatus;
  customer_notes?: string;
  kitchen_notes?: string;
  discount_amount?: number;
  discount_reason?: string;
  tip_amount?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  order_type?: OrderType;
  table_id?: string;
  staff_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface OrderCalculation {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
}

export interface OrderItemUpdate {
  quantity?: number;
  special_instructions?: string;
  status?: OrderItemStatus;
}
