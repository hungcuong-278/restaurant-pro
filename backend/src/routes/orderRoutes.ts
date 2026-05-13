import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController';
<<<<<<< HEAD
import { orderPaymentRoutes } from './paymentRoutes';
import {
  generateHTMLReceipt,
  generateTextReceipt,
  getReceiptData
} from '../controllers/receiptController';
import { authenticateToken, optionalAuthentication } from '../middleware/auth';
=======
import { authenticateToken } from '../middleware/auth';
>>>>>>> origin/main

const router = Router();

// All routes require authentication
router.use(authenticateToken);

<<<<<<< HEAD
// Create new order (can be optional if guest checkout is allowed, but let's use optionalAuthentication)
router.post('/', optionalAuthentication, createOrder);

// Get all orders for restaurant (with filters) - Requires auth
router.get('/', authenticateToken, getOrders);

// Get single order by ID
router.get('/:orderId', optionalAuthentication, getOrder);

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

// Receipt routes
router.get('/:orderId/receipt', generateHTMLReceipt);
router.get('/:orderId/receipt/text', generateTextReceipt);
router.get('/:orderId/receipt/data', getReceiptData);

// Mount payment routes under /orders/:orderId
router.use('/:orderId', orderPaymentRoutes);
=======
// Order routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);
>>>>>>> origin/main

export default router;
