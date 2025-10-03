import { Router } from 'express';
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  updateTablePosition,
  getTableLayout,
  bulkUpdatePositions,
  getTableAvailability,
  getTableAnalytics
} from '../controllers/tableController';

const router = Router({ mergeParams: true });

// Basic table CRUD operations
router.get('/', getTables);                    // GET /api/tables
router.get('/:id', getTable);                 // GET /api/tables/:id
router.post('/', createTable);                // POST /api/tables
router.put('/:id', updateTable);              // PUT /api/tables/:id
router.delete('/:id', deleteTable);           // DELETE /api/tables/:id

// Table status management
router.patch('/:id/status', updateTableStatus);   // PATCH /api/tables/:id/status

// Table positioning
router.patch('/:id/position', updateTablePosition); // PATCH /api/tables/:id/position
router.get('/layout/all', getTableLayout);           // GET /api/tables/layout/all
router.patch('/positions/bulk', bulkUpdatePositions); // PATCH /api/tables/positions/bulk

// Table availability and analytics
router.get('/availability/check', getTableAvailability); // GET /api/tables/availability/check
router.get('/analytics/stats', getTableAnalytics);       // GET /api/tables/analytics/stats

export default router;