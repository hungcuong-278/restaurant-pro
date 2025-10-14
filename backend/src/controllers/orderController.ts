import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { OrderCreateData, OrderUpdateData, OrderItemCreateData, OrderItemUpdate } from '../types/order.types';

/**
 * Create a new order
 * POST /api/restaurants/:restaurantId/orders
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const orderData: OrderCreateData = {
      ...req.body,
      restaurant_id: restaurantId
    };

    // Validation
    if (!orderData.order_type) {
      res.status(400).json({
        success: false,
        message: 'order_type is required (dine_in, takeout, or delivery)'
      });
      return;
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
      return;
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.menu_item_id) {
        res.status(400).json({
          success: false,
          message: 'menu_item_id is required for each item'
        });
        return;
      }

      if (!item.quantity || item.quantity < 1) {
        res.status(400).json({
          success: false,
          message: 'quantity must be at least 1 for each item'
        });
        return;
      }
    }

    const order = await orderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

/**
 * Get all orders for a restaurant with filters
 * GET /api/restaurants/:restaurantId/orders
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      order_type,
      table_id,
      staff_id,
      start_date,
      end_date,
      page = '1',
      limit = '50'
    } = req.query;

    const db = require('../config/database').default;

    // Build query
    let query = db('orders')
      .select(
        'orders.*',
        'tables.number as table_number',
        'users.first_name as staff_name'
      )
      .leftJoin('tables', 'orders.table_id', 'tables.id')
      .leftJoin('users', 'orders.staff_id', 'users.id')
      .orderBy('orders.ordered_at', 'desc');

    // Apply filters
    if (status) {
      query = query.where('orders.status', status as string);
    }
    if (order_type) {
      query = query.where('orders.order_type', order_type as string);
    }
    if (table_id) {
      query = query.where('orders.table_id', table_id as string);
    }
    if (staff_id) {
      query = query.where('orders.staff_id', staff_id as string);
    }
    if (start_date) {
      query = query.where('orders.ordered_at', '>=', start_date as string);
    }
    if (end_date) {
      query = query.where('orders.ordered_at', '<=', end_date as string);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [orders, totalResult] = await Promise.all([
      query.limit(limitNum).offset(offset),
      db('orders').count('* as count').first()
    ]);

    const total = Number(totalResult?.count || 0);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order'
    });
  }
};

/**
 * Update order status
 * PATCH /api/restaurants/:restaurantId/orders/:orderId/status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'status is required'
      });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // TODO: Emit socket event 'order:status_updated' for real-time updates
    // io.to(`restaurant:${order.restaurant_id}`).emit('order:status_updated', order);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
};

/**
 * Add item to order
 * POST /api/restaurants/:restaurantId/orders/:orderId/items
 */
export const addItemToOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const itemData: OrderItemCreateData = req.body;

    if (!itemData.menu_item_id) {
      res.status(400).json({
        success: false,
        message: 'menu_item_id is required'
      });
      return;
    }

    if (!itemData.quantity || itemData.quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'quantity must be at least 1'
      });
      return;
    }

    const order = await orderService.addOrderItem(orderId, itemData);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // TODO: Emit socket event 'order:item_added'
    // io.to(`restaurant:${order.restaurant_id}`).emit('order:item_added', order);

    res.status(201).json({
      success: true,
      message: 'Item added to order successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Add item to order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add item to order'
    });
  }
};

/**
 * Remove item from order
 * DELETE /api/restaurants/:restaurantId/orders/:orderId/items/:itemId
 */
export const removeItemFromOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, itemId } = req.params;

    const order = await orderService.removeOrderItem(orderId, itemId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order or item not found'
      });
      return;
    }

    // TODO: Emit socket event 'order:item_removed'
    // io.to(`restaurant:${order.restaurant_id}`).emit('order:item_removed', order);

    res.json({
      success: true,
      message: 'Item removed from order successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Remove item from order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove item from order'
    });
  }
};

/**
 * Update order item
 * PATCH /api/restaurants/:restaurantId/orders/:orderId/items/:itemId
 */
export const updateOrderItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, itemId } = req.params;
    const updates: OrderItemUpdate = req.body;

    if (updates.quantity !== undefined && updates.quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'quantity must be at least 1'
      });
      return;
    }

    const order = await orderService.updateOrderItem(orderId, itemId, updates);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order or item not found'
      });
      return;
    }

    // TODO: Emit socket event 'order:item_updated'
    // io.to(`restaurant:${order.restaurant_id}`).emit('order:item_updated', order);

    res.json({
      success: true,
      message: 'Order item updated successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Update order item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order item'
    });
  }
};

/**
 * Cancel order
 * POST /api/restaurants/:restaurantId/orders/:orderId/cancel
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await orderService.cancelOrder(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // TODO: Emit socket event 'order:cancelled'
    // io.to(`restaurant:${order.restaurant_id}`).emit('order:cancelled', order);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order'
    });
  }
};

/**
 * Update order (non-status fields)
 * PATCH /api/restaurants/:restaurantId/orders/:orderId
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const updates: OrderUpdateData = req.body;

    if (updates.discount_amount !== undefined && updates.discount_amount < 0) {
      res.status(400).json({
        success: false,
        message: 'discount_amount cannot be negative'
      });
      return;
    }

    if (updates.tip_amount !== undefined && updates.tip_amount < 0) {
      res.status(400).json({
        success: false,
        message: 'tip_amount cannot be negative'
      });
      return;
    }

    const order = await orderService.updateOrder(orderId, updates);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order'
    });
  }
};




