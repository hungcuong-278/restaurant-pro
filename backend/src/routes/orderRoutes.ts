import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  addItemToOrder,
  removeItemFromOrder,
  updateOrderItem,
  cancelOrder,
  updateOrder
} from '../controllers/orderController';
import { orderPaymentRoutes } from './paymentRoutes';

const router = express.Router({ mergeParams: true });

/**
 * Order Routes
 * Base path: /api/restaurants/:restaurantId/orders
 */

// Create new order
router.post('/', createOrder);

// Get all orders for restaurant (with filters)
router.get('/', getOrders);

// Get single order by ID
router.get('/:orderId', getOrder);

// Update order (non-status fields: notes, discount, tip)
router.patch('/:orderId', updateOrder);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

// Cancel order
router.post('/:orderId/cancel', cancelOrder);

// Add item to order
router.post('/:orderId/items', addItemToOrder);

// Update order item
router.patch('/:orderId/items/:itemId', updateOrderItem);

// Remove item from order
router.delete('/:orderId/items/:itemId', removeItemFromOrder);

// Mount payment routes under /orders/:orderId
router.use('/:orderId', orderPaymentRoutes);

export default router;
