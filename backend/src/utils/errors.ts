/**
 * Custom Error Classes for Restaurant Pro
 * Provides structured error handling with proper HTTP status codes
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid input
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, true, 'NOT_FOUND', { resource, identifier });
  }
}

/**
 * 409 Conflict - Resource already exists or conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, true, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity - Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, true, 'BUSINESS_LOGIC_ERROR', details);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, false, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * 503 Service Unavailable - External service error
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string, details?: any) {
    super(`Service '${service}' is currently unavailable`, 503, true, 'SERVICE_UNAVAILABLE', {
      service,
      ...details
    });
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(message, 500, false, 'DATABASE_ERROR', {
      originalError: originalError?.message || originalError
    });
  }
}

/**
 * Order-specific errors
 */
export class OrderError extends BusinessLogicError {
  constructor(message: string, details?: any) {
    super(message, { ...details, errorType: 'ORDER_ERROR' });
    this.code = 'ORDER_ERROR';
  }
}

export class InvalidOrderStatusError extends OrderError {
  constructor(currentStatus: string, requestedStatus: string) {
    super(
      `Cannot transition order from '${currentStatus}' to '${requestedStatus}'`,
      { currentStatus, requestedStatus }
    );
    this.code = 'INVALID_ORDER_STATUS_TRANSITION';
  }
}

export class OrderNotModifiableError extends OrderError {
  constructor(orderId: string, status: string) {
    super(
      `Order '${orderId}' cannot be modified (status: ${status})`,
      { orderId, status }
    );
    this.code = 'ORDER_NOT_MODIFIABLE';
  }
}

export class OrderAlreadyPaidError extends OrderError {
  constructor(orderId: string) {
    super(
      `Order '${orderId}' has already been paid and cannot be cancelled`,
      { orderId }
    );
    this.code = 'ORDER_ALREADY_PAID';
  }
}

/**
 * Menu Item errors
 */
export class MenuItemNotAvailableError extends BusinessLogicError {
  constructor(itemId: string, itemName: string) {
    super(
      `Menu item '${itemName}' is not available`,
      { itemId, itemName }
    );
    this.code = 'MENU_ITEM_NOT_AVAILABLE';
  }
}

/**
 * Payment-specific errors
 */
export class PaymentError extends BusinessLogicError {
  constructor(message: string, details?: any) {
    super(message, { ...details, errorType: 'PAYMENT_ERROR' });
    this.code = 'PAYMENT_ERROR';
  }
}

export class PaymentProcessingError extends PaymentError {
  constructor(paymentMethod: string, originalError?: any) {
    super(
      `Payment processing failed for method '${paymentMethod}'`,
      { paymentMethod, originalError: originalError?.message }
    );
    this.code = 'PAYMENT_PROCESSING_ERROR';
  }
}

export class InsufficientPaymentError extends PaymentError {
  constructor(totalAmount: number, paidAmount: number) {
    super(
      `Insufficient payment: Required $${totalAmount}, Received $${paidAmount}`,
      { totalAmount, paidAmount, shortfall: totalAmount - paidAmount }
    );
    this.code = 'INSUFFICIENT_PAYMENT';
  }
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
