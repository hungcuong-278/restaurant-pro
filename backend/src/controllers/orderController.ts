import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { OrderCreateData, OrderUpdateData, OrderItemCreateData, OrderItemUpdate } from '../types/order.types';
import { createLogger } from '../utils/logger';
import { AppError } from '../utils/errors';

const logger = createLogger('OrderController');

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

    logger.info('Order created via API', { order_id: order.id, order_number: order.order_number });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error: any) {
    logger.error('Create order error', error, { restaurant_id: req.params.restaurantId });
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

/**
 * Get all orders for a restaurant with filters
 * GET /api/restaurants/:restaurantId/orders
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const {
      status,
      order_type,
      table_id,
      staff_id,
      start_date,
      end_date,
      page,
      limit
    } = req.query;

    const filters = {
      status: status as any,
      order_type: order_type as any,
      table_id: table_id as string,
      staff_id: staff_id as string,
      start_date: start_date as string,
      end_date: end_date as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    };

    const result = await orderService.getOrdersByRestaurant(restaurantId, filters);

    res.json({
      success: true,
      data: result.orders,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
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

/**
 * Get a single order by ID
 * GET /api/restaurants/:restaurantId/orders/:orderId
 */
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
