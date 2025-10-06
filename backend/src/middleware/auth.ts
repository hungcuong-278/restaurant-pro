import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { AuthenticatedRequest, UserRole } from '../types/auth';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    // Verify token
    const payload = authService.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    // Check if session is still active
    const session = await authService.getSessionById(payload.sessionId);
    if (!session || !session.is_active || session.is_revoked) {
      res.status(401).json({
        success: false,
        message: 'Session is no longer valid'
      });
      return;
    }

    // Check if session has expired
    if (new Date() > new Date(session.expires_at)) {
      res.status(401).json({
        success: false,
        message: 'Session has expired'
      });
      return;
    }

    // Get user data
    const user = await authService.getUserById(payload.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'User account is no longer active'
      });
      return;
    }

    // Attach user and session to request
    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
      email_verified: user.email_verified,
      last_login: user.last_login,
      created_at: user.created_at
    };
    req.session = session;

    // Update last activity
    await updateLastActivity(session.id);

    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Authorization middleware - checks if user has required role
 */
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const hasPermission = allowedRoles.some(role => 
      authService.hasRole(userRole, role)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource'
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuthentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Try to authenticate if token is provided
    const payload = authService.verifyAccessToken(token);
    if (payload) {
      const session = await authService.getSessionById(payload.sessionId);
      if (session && session.is_active && !session.is_revoked && new Date() <= new Date(session.expires_at)) {
        const user = await authService.getUserById(payload.userId);
        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            phone: user.phone,
            is_active: user.is_active,
            email_verified: user.email_verified,
            last_login: user.last_login,
            created_at: user.created_at
          };
          req.session = session;
          await updateLastActivity(session.id);
        }
      }
    }

    next();

  } catch (error) {
    // In optional auth, we don't fail on errors, just log them
    console.warn('Optional authentication warning:', error);
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const resourceUserId = req.params[userIdParam];
    
    // Admin and manager can access any resource
    const userRole = req.user.role as UserRole;
    if (authService.hasRole(userRole, 'manager')) {
      next();
      return;
    }

    // Regular users can only access their own resources
    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for rate limiting (placeholder)
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would integrate with express-rate-limit
  // For now, just pass through
  next();
};

/**
 * Helper function to update session last activity
 */
async function updateLastActivity(sessionId: string): Promise<void> {
  try {
    const db = (await import('../config/database')).default;
    await db('user_sessions')
      .where('id', sessionId)
      .update({
        last_activity: new Date(),
        updated_at: new Date()
      });
  } catch (error) {
    console.warn('Failed to update session activity:', error);
    // Don't throw error as this is not critical
  }
}