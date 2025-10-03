import db from '../config/database';
import {
  Order,
  OrderWithItems,
  OrderCreateData,
  OrderUpdateData,
  OrderFilters,
  OrderCalculation,
  OrderItemCreateData,
  OrderItemUpdate,
  OrderStatus,
  OrderItemStatus
} from '../types/order.types';
import { createLogger } from '../utils/logger';
import {
  NotFoundError,
  ValidationError,
  OrderNotModifiableError,
  InvalidOrderStatusError,
  OrderAlreadyPaidError,
  MenuItemNotAvailableError,
  DatabaseError
} from '../utils/errors';

const logger = createLogger('OrderService');

// Constants
const TAX_RATE = 0.085; // 8.5% sales tax
const VALID_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
  'cancelled'
];

/**
 * Generate unique order number: ORD-YYYYMMDD-XXX
 */
async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get today's order count
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));
  
  const count = await db('orders')
    .whereBetween('ordered_at', [todayStart, todayEnd])
    .count('id as count')
    .first();
  
  const sequence = (count?.count as number || 0) + 1;
  const sequenceStr = sequence.toString().padStart(3, '0');
  
  return `ORD-${dateStr}-${sequenceStr}`;
}

/**
 * Calculate order totals
 */
function calculateOrderTotals(
  subtotal: number,
  discountAmount: number = 0,
  tipAmount: number = 0
): OrderCalculation {
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const totalAmount = afterDiscount + taxAmount + tipAmount;
  
  return {
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    tip_amount: tipAmount,
    total_amount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Validate status transition
 */
function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served', 'cancelled'],
    served: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Create a new order with items
 */
async function createOrder(data: OrderCreateData): Promise<OrderWithItems> {
  logger.info('Creating new order', { restaurant_id: data.restaurant_id, table_id: data.table_id });
  
  return await db.transaction(async (trx) => {
    // Validate restaurant exists
    const restaurant = await trx('restaurants')
      .where({ id: data.restaurant_id })
      .first();
    
    if (!restaurant) {
      logger.error('Restaurant not found', null, { restaurant_id: data.restaurant_id });
      throw new NotFoundError('Restaurant', data.restaurant_id);
    }
    
    // Validate table if provided
    if (data.table_id) {
      const table = await trx('tables')
        .where({ id: data.table_id, restaurant_id: data.restaurant_id })
        .first();
      
      if (!table) {
        logger.error('Table not found', null, { table_id: data.table_id });
        throw new NotFoundError('Table', data.table_id);
      }
    }
    
    // Validate items exist and calculate subtotal
    let subtotal = 0;
    const itemsWithPrices = [];
    
    for (const item of data.items) {
      const menuItem = await trx('menu_items')
        .where({ id: item.menu_item_id, restaurant_id: data.restaurant_id })
        .first();
      
      if (!menuItem) {
        logger.error('Menu item not found', null, { menu_item_id: item.menu_item_id });
        throw new NotFoundError('Menu item', item.menu_item_id);
      }
      
      if (!menuItem.is_available) {
        logger.warn('Menu item not available', { menu_item_id: item.menu_item_id, name: menuItem.name });
        throw new MenuItemNotAvailableError(item.menu_item_id, menuItem.name);
      }
      
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      
      itemsWithPrices.push({
        menu_item_id: item.menu_item_id,
        item_name: menuItem.name,
        item_price: menuItem.price,
        quantity: item.quantity,
        total_price: itemTotal,
        special_instructions: item.special_instructions,
        status: 'ordered' as OrderItemStatus
      });
    }
    
    // Generate order number
    const orderNumber = await generateOrderNumber();
    
    // Calculate totals
    const totals = calculateOrderTotals(subtotal);
    
    // Create order
    const [order] = await trx('orders')
      .insert({
        restaurant_id: data.restaurant_id,
        table_id: data.table_id,
        customer_id: data.customer_id,
        staff_id: data.staff_id,
        order_number: orderNumber,
        order_type: data.order_type,
        status: 'pending',
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        discount_amount: totals.discount_amount,
        tip_amount: totals.tip_amount,
        total_amount: totals.total_amount,
        customer_notes: data.customer_notes,
        kitchen_notes: data.kitchen_notes,
        ordered_at: new Date()
      })
      .returning('*');
    
    // Create order items
    const orderItems = itemsWithPrices.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    const insertedItems = await trx('order_items')
      .insert(orderItems)
      .returning('*');
    
    logger.info('Order created successfully', { 
      order_id: order.id, 
      order_number: order.order_number,
      total_items: insertedItems.length,
      total_amount: order.total_amount
    });
    
    return {
      ...order,
      items: insertedItems
    };
  });
}

/**
 * Get order by ID with full details
 */
async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const order = await db('orders')
    .where({ 'orders.id': orderId })
    .first();
  
  if (!order) {
    return null;
  }
  
  // Get order items
  const items = await db('order_items')
    .where({ order_id: orderId })
    .orderBy('created_at', 'asc');
  
  // Get table info if exists
  let table = null;
  if (order.table_id) {
    table = await db('tables')
      .where({ id: order.table_id })
      .select('id', 'number', 'location')
      .first();
  }
  
  // Get customer info if exists
  let customer = null;
  if (order.customer_id) {
    customer = await db('users')
      .where({ id: order.customer_id })
      .select('id', 'name', 'email')
      .first();
  }
  
  // Get staff info if exists
  let staff = null;
  if (order.staff_id) {
    staff = await db('users')
      .where({ id: order.staff_id })
      .select('id', 'name')
      .first();
  }
  
  return {
    ...order,
    items,
    table,
    customer,
    staff
  };
}

/**
 * Get orders by restaurant with filters
 */
async function getOrdersByRestaurant(
  restaurantId: string,
  filters: OrderFilters = {}
): Promise<{ orders: OrderWithItems[], total: number, page: number, limit: number }> {
  const {
    status,
    order_type,
    table_id,
    staff_id,
    start_date,
    end_date,
    page = 1,
    limit = 20
  } = filters;
  
  let query = db('orders').where({ restaurant_id: restaurantId });
  
  if (status) {
    query = query.where({ status });
  }
  
  if (order_type) {
    query = query.where({ order_type });
  }
  
  if (table_id) {
    query = query.where({ table_id });
  }
  
  if (staff_id) {
    query = query.where({ staff_id });
  }
  
  if (start_date) {
    query = query.where('ordered_at', '>=', start_date);
  }
  
  if (end_date) {
    query = query.where('ordered_at', '<=', end_date);
  }
  
  // Get total count
  const countResult = await query.clone().count('id as count').first();
  const total = countResult?.count as number || 0;
  
  // Get paginated results
  const offset = (page - 1) * limit;
  const orders = await query
    .orderBy('ordered_at', 'desc')
    .limit(limit)
    .offset(offset);
  
  // Get items for each order
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await db('order_items')
        .where({ order_id: order.id })
        .orderBy('created_at', 'asc');
      
      return { ...order, items };
    })
  );
  
  return {
    orders: ordersWithItems,
    total,
    page,
    limit
  };
}

/**
 * Update order status
 */
async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderWithItems | null> {
  if (!VALID_ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Validate status transition
    if (!isValidStatusTransition(order.status, newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }
    
    // Update status and set timestamp fields
    const updates: any = { status: newStatus };
    
    switch (newStatus) {
      case 'confirmed':
        updates.confirmed_at = new Date();
        break;
      case 'ready':
        updates.ready_at = new Date();
        break;
      case 'served':
        updates.served_at = new Date();
        break;
      case 'completed':
        updates.completed_at = new Date();
        break;
    }
    
    await trx('orders').where({ id: orderId }).update(updates);
    
    // Get updated order with items
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

/**
 * Add item to order
 */
async function addOrderItem(
  orderId: string,
  itemData: OrderItemCreateData
): Promise<OrderWithItems | null> {
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot add items to ${order.status} order`);
    }
    
    // Get menu item
    const menuItem = await trx('menu_items')
      .where({ id: itemData.menu_item_id, restaurant_id: order.restaurant_id })
      .first();
    
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    
    if (!menuItem.is_available) {
      throw new Error(`Menu item ${menuItem.name} is not available`);
    }
    
    // Create order item
    const itemTotal = menuItem.price * itemData.quantity;
    
    await trx('order_items').insert({
      order_id: orderId,
      menu_item_id: itemData.menu_item_id,
      item_name: menuItem.name,
      item_price: menuItem.price,
      quantity: itemData.quantity,
      total_price: itemTotal,
      special_instructions: itemData.special_instructions,
      status: 'ordered'
    });
    
    // Recalculate order totals
    const newSubtotal = order.subtotal + itemTotal;
    const totals = calculateOrderTotals(
      newSubtotal,
      order.discount_amount,
      order.tip_amount
    );
    
    await trx('orders').where({ id: orderId }).update({
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      total_amount: totals.total_amount
    });
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

/**
 * Remove item from order
 */
async function removeOrderItem(
  orderId: string,
  itemId: string
): Promise<OrderWithItems | null> {
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot remove items from ${order.status} order`);
    }
    
    const item = await trx('order_items')
      .where({ id: itemId, order_id: orderId })
      .first();
    
    if (!item) {
      throw new Error('Order item not found');
    }
    
    // Delete item
    await trx('order_items').where({ id: itemId }).delete();
    
    // Recalculate order totals
    const newSubtotal = order.subtotal - item.total_price;
    const totals = calculateOrderTotals(
      newSubtotal,
      order.discount_amount,
      order.tip_amount
    );
    
    await trx('orders').where({ id: orderId }).update({
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      total_amount: totals.total_amount
    });
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

/**
 * Update order item
 */
async function updateOrderItem(
  orderId: string,
  itemId: string,
  updates: OrderItemUpdate
): Promise<OrderWithItems | null> {
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot update items in ${order.status} order`);
    }
    
    const item = await trx('order_items')
      .where({ id: itemId, order_id: orderId })
      .first();
    
    if (!item) {
      throw new Error('Order item not found');
    }
    
    // Update item
    const updateData: any = {};
    
    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity;
      updateData.total_price = item.item_price * updates.quantity;
    }
    
    if (updates.special_instructions !== undefined) {
      updateData.special_instructions = updates.special_instructions;
    }
    
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    
    await trx('order_items').where({ id: itemId }).update(updateData);
    
    // Recalculate order totals if quantity changed
    if (updates.quantity !== undefined) {
      const oldTotal = item.total_price;
      const newTotal = item.item_price * updates.quantity;
      const newSubtotal = order.subtotal - oldTotal + newTotal;
      
      const totals = calculateOrderTotals(
        newSubtotal,
        order.discount_amount,
        order.tip_amount
      );
      
      await trx('orders').where({ id: orderId }).update({
        subtotal: totals.subtotal,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount
      });
    }
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

/**
 * Cancel order
 */
async function cancelOrder(orderId: string): Promise<OrderWithItems | null> {
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed order');
    }
    
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }
    
    // Check if order has been paid
    const payment = await trx('payments')
      .where({ order_id: orderId, status: 'completed' })
      .first();
    
    if (payment) {
      throw new Error('Cannot cancel paid order. Please process refund instead.');
    }
    
    // Cancel order
    await trx('orders').where({ id: orderId }).update({
      status: 'cancelled'
    });
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

/**
 * Update order (non-status fields)
 */
async function updateOrder(
  orderId: string,
  updates: OrderUpdateData
): Promise<OrderWithItems | null> {
  return await db.transaction(async (trx) => {
    const order = await trx('orders').where({ id: orderId }).first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new Error(`Cannot update ${order.status} order`);
    }
    
    const updateData: any = {};
    
    if (updates.customer_notes !== undefined) {
      updateData.customer_notes = updates.customer_notes;
    }
    
    if (updates.kitchen_notes !== undefined) {
      updateData.kitchen_notes = updates.kitchen_notes;
    }
    
    // Handle discount update
    if (updates.discount_amount !== undefined || updates.discount_reason !== undefined) {
      const discountAmount = updates.discount_amount ?? order.discount_amount;
      updateData.discount_amount = discountAmount;
      updateData.discount_reason = updates.discount_reason ?? order.discount_reason;
      
      // Recalculate totals
      const totals = calculateOrderTotals(
        order.subtotal,
        discountAmount,
        order.tip_amount
      );
      
      updateData.tax_amount = totals.tax_amount;
      updateData.total_amount = totals.total_amount;
    }
    
    // Handle tip update
    if (updates.tip_amount !== undefined) {
      updateData.tip_amount = updates.tip_amount;
      
      // Recalculate totals
      const totals = calculateOrderTotals(
        order.subtotal,
        order.discount_amount,
        updates.tip_amount
      );
      
      updateData.total_amount = totals.total_amount;
    }
    
    await trx('orders').where({ id: orderId }).update(updateData);
    
    // Return updated order
    const updatedOrder = await getOrderById(orderId);
    return updatedOrder;
  });
}

export default {
  createOrder,
  getOrderById,
  getOrdersByRestaurant,
  updateOrderStatus,
  addOrderItem,
  removeOrderItem,
  updateOrderItem,
  cancelOrder,
  updateOrder,
  calculateOrderTotals,
  generateOrderNumber
};
