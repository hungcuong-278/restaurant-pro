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

const router = Router();

// Menu Categories Routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Menu Items Routes
router.get('/items', getMenuItems);
router.get('/items/:id', getMenuItemById);
router.post('/items', createMenuItem);
router.put('/items/:id', updateMenuItem);
router.delete('/items/:id', deleteMenuItem);
router.patch('/items/:id/toggle', toggleItemAvailability);

// Special Menu Routes
router.get('/full', getMenuByCategory); // Get complete menu organized by categories
router.get('/featured', getFeaturedItems); // Get featured items

export default router;