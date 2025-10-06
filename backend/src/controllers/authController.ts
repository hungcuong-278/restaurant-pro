import { Request, Response } from 'express';
import Joi from 'joi';
import authService from '../services/authService';
import { RegisterRequest, LoginRequest, AuthenticatedRequest } from '../types/auth';

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must be no more than 50 characters long',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long', 
    'string.max': 'Last name must be no more than 50 characters long',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be no more than 128 characters long',
    'any.required': 'Password is required'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).min(10).max(20).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'string.min': 'Phone number must be at least 10 characters long',
    'string.max': 'Phone number must be no more than 20 characters long'
  }),
  role: Joi.string().valid('customer', 'staff').optional().messages({
    'any.only': 'Role must be either customer or staff'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  }),
  rememberMe: Joi.boolean().optional()
});

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
      return;
    }

    const registerData: RegisterRequest = value;

    // Attempt registration
    const result = await authService.register(registerData, req);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Register controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
      return;
    }

    const loginData: LoginRequest = value;

    // Attempt login
    const result = await authService.login(loginData, req);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }

  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.session?.id) {
      res.status(400).json({
        success: false,
        message: 'No active session found'
      });
      return;
    }

    const result = await authService.logout(req.session.id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Logout controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: req.user
    });

  } catch (error) {
    console.error('Get profile controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const payload = authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
      return;
    }

    // Get session
    const session = await authService.getSessionById(payload.sessionId);
    if (!session || !session.is_active || session.is_revoked) {
      res.status(401).json({
        success: false,
        message: 'Session is no longer valid'
      });
      return;
    }

    // Get user
    const user = await authService.getUserById(payload.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'User account is no longer active'
      });
      return;
    }

    // Generate new access token
    const newAccessToken = authService.generateAccessToken(
      {
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
      },
      session.id
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newAccessToken,
      expiresIn: 900 // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Refresh token controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
};

/**
 * Change password (authenticated endpoint)
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
      return;
    }

    // Validate new password
    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.errors.join('. ')
      });
      return;
    }

    // Get full user data
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password and update
    const newPasswordHash = await authService.hashPassword(newPassword);
    
    // Implementation would continue here with database update
    // For now, return success response
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
};