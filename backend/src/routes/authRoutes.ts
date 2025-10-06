import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  refreshToken,
  changePassword 
} from '../controllers/authController';
import { authenticateToken, authorizeRole, authRateLimit } from '../middleware/auth';

const router = Router();

/**
 * Public routes
 */

// User registration
router.post('/register', authRateLimit, register);

// User login
router.post('/login', authRateLimit, login);

// Refresh access token
router.post('/refresh-token', authRateLimit, refreshToken);

/**
 * Protected routes (require authentication)
 */

// Get current user profile
router.get('/profile', authenticateToken, getProfile);

// Logout current session
router.post('/logout', authenticateToken, logout);

// Change password
router.patch('/change-password', authenticateToken, changePassword);

/**
 * Admin only routes
 */

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  // This would be implemented in a separate controller
  res.status(501).json({
    success: false,
    message: 'Not implemented yet'
  });
});

// Deactivate user (admin only)
router.patch('/users/:userId/deactivate', authenticateToken, authorizeRole('admin'), async (req, res) => {
  // This would be implemented in a separate controller
  res.status(501).json({
    success: false,
    message: 'Not implemented yet'
  });
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
