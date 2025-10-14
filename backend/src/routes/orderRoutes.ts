import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Order routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', cancelOrder);

export default router;
