import { Request, Response } from 'express';
import Joi from 'joi';
import reservationService from '../services/reservationService';
import { AuthenticatedRequest } from '../types/auth';

/**
 * Validation schemas
 */
const createReservationSchema = Joi.object({
  restaurant_id: Joi.string().uuid().optional(),
  table_id: Joi.string().uuid().optional().allow(null),
  customer_name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name must not exceed 255 characters',
    'any.required': 'Customer name is required'
  }),
  customer_email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  customer_phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).min(10).max(20).optional().allow('', null).messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number must not exceed 20 characters'
  }),
  party_size: Joi.number().integer().min(1).max(20).required().messages({
    'number.min': 'Party size must be at least 1',
    'number.max': 'Party size cannot exceed 20',
    'any.required': 'Party size is required'
  }),
  reservation_date: Joi.date().iso().required().messages({
    'any.required': 'Reservation date is required',
    'date.base': 'Please provide a valid date'
  }),
  reservation_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:MM format (e.g., 19:00)',
    'any.required': 'Reservation time is required'
  }),
  special_requests: Joi.string().max(1000).optional().allow('', null).messages({
    'string.max': 'Special requests must not exceed 1000 characters'
  })
});

const updateReservationSchema = Joi.object({
  table_id: Joi.string().uuid().optional().allow(null),
  party_size: Joi.number().integer().min(1).max(20).optional(),
  reservation_date: Joi.date().iso().optional(),
  reservation_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  status: Joi.string().valid('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show').optional(),
  special_requests: Joi.string().max(1000).optional().allow('', null),
  notes: Joi.string().max(1000).optional().allow('', null)
});

/**
 * Create new reservation
 */
export const createReservation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = createReservationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Create reservation
    const result = await reservationService.createReservation({
      ...value,
      customer_id: userId
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation. Please try again.'
    });
  }
};

/**
 * Get user's reservations
 */
export const getMyReservations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const result = await reservationService.getUserReservations(userId);
    res.json(result);

  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations. Please try again.'
    });
  }
};

/**
 * Get all reservations (admin/staff only)
 */
export const getAllReservations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    
    // Check if user is staff or admin
    if (userRole !== 'staff' && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
      return;
    }

    const { status, date, limit, offset } = req.query;

    const result = await reservationService.getAllReservations({
      status: status as string,
      date: date as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json(result);

  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations. Please try again.'
    });
  }
};

/**
 * Get single reservation by ID
 */
export const getReservationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const result = await reservationService.getReservationById(id, userId, userRole);

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.message === 'Reservation not found' ? 404 : 403).json(result);
    }

  } catch (error) {
    console.error('Get reservation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation. Please try again.'
    });
  }
};

/**
 * Update reservation
 */
export const updateReservation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate request body
    const { error, value } = updateReservationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
      return;
    }

    const result = await reservationService.updateReservation(id, value, userId, userRole);

    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.message === 'Reservation not found' ? 404 : 
                        result.message?.includes('Access denied') ? 403 : 400;
      res.status(statusCode).json(result);
    }

  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation. Please try again.'
    });
  }
};

/**
 * Cancel reservation
 */
export const cancelReservation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const result = await reservationService.cancelReservation(id, userId, userRole);

    if (result.success) {
      res.json(result);
    } else {
      const statusCode = result.message === 'Reservation not found' ? 404 : 
                        result.message?.includes('Access denied') ? 403 : 400;
      res.status(statusCode).json(result);
    }

  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation. Please try again.'
    });
  }
};

/**
 * Check table availability
 */
export const checkAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { date, time, party_size, restaurant_id } = req.query;

    // Validate required parameters
    if (!date || !time || !party_size) {
      res.status(400).json({
        success: false,
        message: 'Date, time, and party size are required'
      });
      return;
    }

    const result = await reservationService.checkAvailability({
      date: date as string,
      time: time as string,
      party_size: parseInt(party_size as string),
      restaurant_id: restaurant_id as string
    });

    res.json(result);

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability. Please try again.'
    });
  }
};

export default {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  checkAvailability
};
