import { Router, Request, Response } from 'express';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Restaurant Pro API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check (will implement after database setup)
router.get('/db', (req: Request, res: Response) => {
  // TODO: Implement database connection check
  res.json({
    success: true,
    message: 'Database connection check - Coming soon'
  });
});

export default router;