import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types when possible
    });
    
    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      res.status(422).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
      return;
    }
    
    req.body = value; // Use validated and sanitized data
    next();
  };
};

// User validation schemas
export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,20}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    role: Joi.string().valid('admin', 'manager', 'staff', 'customer').default('customer')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  })
};

// Menu validation schemas
export const menuValidation = {
  createCategory: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    sortOrder: Joi.number().integer().min(0).default(0)
  }),
  
  createItem: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().precision(2).required(),
    cost: Joi.number().positive().precision(2).optional(),
    categoryId: Joi.string().uuid().required(),
    allergens: Joi.array().items(Joi.string()).optional(),
    dietaryInfo: Joi.array().items(Joi.string()).optional(),
    preparationTime: Joi.number().integer().min(1).max(300).optional(),
    isAvailable: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false)
  })
};

// Table validation schemas
export const tableValidation = {
  create: Joi.object({
    number: Joi.string().min(1).max(20).required(),
    capacity: Joi.number().integer().min(1).max(20).required(),
    location: Joi.string().max(100).optional(),
    position: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required()
    }).optional(),
    notes: Joi.string().max(500).optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('available', 'occupied', 'reserved', 'maintenance').required()
  })
};

// Reservation validation schemas
export const reservationValidation = {
  create: Joi.object({
    customerName: Joi.string().min(2).max(100).required(),
    customerEmail: Joi.string().email().required(),
    customerPhone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,20}$/).optional(),
    partySize: Joi.number().integer().min(1).max(20).required(),
    reservationDate: Joi.date().min('now').required(),
    reservationTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    specialRequests: Joi.string().max(1000).optional()
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show').required(),
    tableId: Joi.string().uuid().when('status', {
      is: 'confirmed',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    notes: Joi.string().max(1000).optional()
  })
};