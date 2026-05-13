import { Router } from 'express';
import {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Menu Items
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  // Special endpoints
  getMenuByCategory,
  getFeaturedItems
} from '../controllers/menuController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// ─── Menu Categories Routes ──────────────────────────────────────────────────
// Public read
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
// Admin/Manager write
router.post('/categories', authenticateToken, authorizeRole('manager', 'admin'), createCategory);
router.put('/categories/:id', authenticateToken, authorizeRole('manager', 'admin'), updateCategory);
router.delete('/categories/:id', authenticateToken, authorizeRole('manager', 'admin'), deleteCategory);

// ─── Menu Items Routes ───────────────────────────────────────────────────────
// Public read
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);
// Admin/Manager write
router.post('/items', authenticateToken, authorizeRole('manager', 'admin'), createMenuItem);
router.put('/items/:id', authenticateToken, authorizeRole('manager', 'admin'), updateMenuItem);
router.delete('/items/:id', authenticateToken, authorizeRole('manager', 'admin'), deleteMenuItem);
router.patch('/items/:id/toggle', authenticateToken, authorizeRole('manager', 'admin'), toggleItemAvailability);

// ─── Special Menu Routes ─────────────────────────────────────────────────────
router.get('/full', getMenuByCategory);
router.get('/featured', getFeaturedItems);

export default router;