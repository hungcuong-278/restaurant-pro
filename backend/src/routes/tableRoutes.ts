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

console.log('🔧 Creating table router...');
const router = Router({ mergeParams: true });
console.log('✅ Table router created');

// Table availability and analytics (must be before /:id to avoid conflicts)
router.get('/availability/check', getTableAvailability); // GET /api/tables/availability/check
router.get('/analytics/stats', getTableAnalytics);       // GET /api/tables/analytics/stats

// Table layout and positioning (must be before /:id)
router.get('/layout', getTableLayout);                   // GET /api/tables/layout
router.patch('/positions/bulk', bulkUpdatePositions);    // PATCH /api/tables/positions/bulk

// Basic table CRUD operations
router.get('/', getTables);                    // GET /api/tables
router.post('/', createTable);                // POST /api/tables
router.get('/:id', getTable);                 // GET /api/tables/:id (must be after specific routes)
router.put('/:id', updateTable);              // PUT /api/tables/:id
router.delete('/:id', deleteTable);           // DELETE /api/tables/:id

// Table status management
router.patch('/:id/status', updateTableStatus);         // PATCH /api/tables/:id/status
router.patch('/:id/position', updateTablePosition);     // PATCH /api/tables/:id/position

console.log('✅ All table routes registered on router');
export default router;