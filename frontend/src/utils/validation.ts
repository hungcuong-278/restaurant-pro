/**
 * Form Validation Utilities
 * Provides comprehensive validation for restaurant forms
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates Vietnamese phone numbers
 * Supports formats: +84xxxxxxxxx, 84xxxxxxxxx, 0xxxxxxxxx
 * Valid prefixes: 03, 05, 07, 08, 09
 */
export const validateVietnamesePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      message: 'Vui lòng nhập số điện thoại'
    };
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Check formats
  const patterns = [
    /^(\+84|84)(3|5|7|8|9)\d{8}$/, // +84 or 84 format
    /^(0)(3|5|7|8|9)\d{8}$/         // 0 format
  ];

  const isValid = patterns.some(pattern => pattern.test(cleanPhone));

  if (!isValid) {
    return {
      valid: false,
      message: 'Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx'
    };
  }

  return { valid: true };
};

/**
 * Validates email addresses
 * Uses standard RFC 5322 compliant regex
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: 'Vui lòng nhập email'
    };
  }

  // RFC 5322 compliant email regex
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(email)) {
    return {
      valid: false,
      message: 'Email không hợp lệ. Ví dụ: example@domain.com'
    };
  }

  // Additional length check
  if (email.length > 254) {
    return {
      valid: false,
      message: 'Email quá dài (tối đa 254 ký tự)'
    };
  }

  return { valid: true };
};

/**
 * Validates party size (number of guests)
 * Range: 1-20 people
 */
export const validatePartySize = (size: number | string): ValidationResult => {
  const numSize = typeof size === 'string' ? parseInt(size, 10) : size;

  if (isNaN(numSize)) {
    return {
      valid: false,
      message: 'Vui lòng nhập số người'
    };
  }

  if (numSize < 1) {
    return {
      valid: false,
      message: 'Số người phải ít nhất là 1'
    };
  }

  if (numSize > 20) {
    return {
      valid: false,
      message: 'Số người tối đa là 20. Vui lòng liên hệ trực tiếp cho nhóm lớn hơn'
    };
  }

  return { valid: true };
};

/**
 * Validates reservation date and time against business hours
 * Business hours: 11:00 AM - 10:00 PM
 * Closed: Mondays
 */
export const validateBusinessHours = (dateTime: Date | string): ValidationResult => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      message: 'Ngày giờ không hợp lệ'
    };
  }

  // Check if date is in the past
  const now = new Date();
  if (date < now) {
    return {
      valid: false,
      message: 'Không thể đặt bàn cho thời gian trong quá khứ'
    };
  }

  // Check if it's Monday (0 = Sunday, 1 = Monday, ...)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1) {
    return {
      valid: false,
      message: 'Nhà hàng đóng cửa vào thứ Hai. Vui lòng chọn ngày khác'
    };
  }

  // Check business hours (11 AM - 10 PM)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const openingTime = 11 * 60; // 11:00 AM
  const closingTime = 22 * 60; // 10:00 PM

  if (timeInMinutes < openingTime) {
    return {
      valid: false,
      message: 'Nhà hàng mở cửa từ 11:00 sáng. Vui lòng chọn giờ khác'
    };
  }

  if (timeInMinutes >= closingTime) {
    return {
      valid: false,
      message: 'Nhà hàng đóng cửa lúc 10:00 tối. Vui lòng chọn giờ trước đó'
    };
  }

  // Check if booking is too soon (minimum 30 minutes ahead)
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  if (date < thirtyMinutesFromNow) {
    return {
      valid: false,
      message: 'Vui lòng đặt bàn trước ít nhất 30 phút'
    };
  }

  // Check if booking is too far in advance (maximum 90 days)
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (date > ninetyDaysFromNow) {
    return {
      valid: false,
      message: 'Chỉ có thể đặt bàn trước tối đa 90 ngày'
    };
  }

  return { valid: true };
};

/**
 * Validates special instructions/notes text
 * Max length: 500 characters
 */
export const validateSpecialInstructions = (text: string): ValidationResult => {
  if (!text || text.trim() === '') {
    // Optional field, empty is valid
    return { valid: true };
  }

  if (text.length > 500) {
    return {
      valid: false,
      message: `Ghi chú quá dài (${text.length}/500 ký tự). Vui lòng rút ngắn lại`
    };
  }

  // Check for suspicious content (basic XSS prevention)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
  ];

  const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(text));
  if (hasSuspiciousContent) {
    return {
      valid: false,
      message: 'Ghi chú chứa nội dung không hợp lệ'
    };
  }

  return { valid: true };
};

/**
 * Validates customer name
 * Min length: 2 characters
 * Max length: 100 characters
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return {
      valid: false,
      message: 'Vui lòng nhập tên'
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      valid: false,
      message: 'Tên phải có ít nhất 2 ký tự'
    };
  }

  if (trimmedName.length > 100) {
    return {
      valid: false,
      message: 'Tên không được vượt quá 100 ký tự'
    };
  }

  // Check for valid characters (letters, spaces, Vietnamese characters)
  const namePattern = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;

  if (!namePattern.test(trimmedName)) {
    return {
      valid: false,
      message: 'Tên chỉ được chứa chữ cái và khoảng trắng'
    };
  }

  return { valid: true };
};

/**
 * Validates required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      message: `${fieldName} là bắt buộc`
    };
  }

  return { valid: true };
};

/**
 * Combines multiple validation results
 * Returns first error encountered or success if all valid
 */
export const combineValidations = (...results: ValidationResult[]): ValidationResult => {
  for (const result of results) {
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

/**
 * Formats Vietnamese phone number for display
 * Example: 0901234567 -> 090 123 4567
 */
export const formatVietnamesePhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Format: 0901234567 -> 090 123 4567
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }
  
  // Format: +84901234567 -> +84 90 123 4567
  if (cleanPhone.startsWith('+84') && cleanPhone.length === 12) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`;
  }
  
  return phone; // Return original if format unknown
};
