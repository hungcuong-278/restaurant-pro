/**
 * Custom Error Classes
 */

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 402, 'PAYMENT_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: any) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class OrderNotModifiableError extends AppError {
  constructor(message: string = 'Order cannot be modified in current status') {
    super(message, 400, 'ORDER_NOT_MODIFIABLE');
  }
}

export class InvalidOrderStatusError extends AppError {
  constructor(message: string = 'Invalid order status transition') {
    super(message, 400, 'INVALID_ORDER_STATUS');
  }
}

export class OrderAlreadyPaidError extends AppError {
  constructor(message: string = 'Order has already been paid') {
    super(message, 400, 'ORDER_ALREADY_PAID');
  }
}

export class MenuItemNotAvailableError extends AppError {
  constructor(itemId: number) {
    super(`Menu item ${itemId} is not available`, 400, 'MENU_ITEM_NOT_AVAILABLE');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'BUSINESS_LOGIC_ERROR', details);
  }
}

export class PaymentProcessingError extends AppError {
  constructor(message: string = 'Payment processing failed', details?: any) {
    super(message, 402, 'PAYMENT_PROCESSING_ERROR', details);
  }
}

export class InsufficientPaymentError extends AppError {
  constructor(message: string = 'Insufficient payment amount', details?: any) {
    super(message, 400, 'INSUFFICIENT_PAYMENT', details);
  }
}
