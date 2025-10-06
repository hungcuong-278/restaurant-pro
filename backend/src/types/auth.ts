import { Request } from 'express';

// Authentication Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  reset_password_token?: string;
  reset_password_expires?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  refresh_token_hash?: string;
  device_info?: string;
  ip_address?: string;
  session_type: 'web' | 'mobile' | 'api';
  is_active: boolean;
  is_revoked: boolean;
  revoked_at?: Date;
  revoked_reason?: string;
  expires_at: Date;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'staff'; // Only allow limited roles for registration
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserPublic;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface UserPublic {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

// Request interfaces with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserPublic;
  session?: UserSession;
}

// Password validation interface
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
  maxLength: 128
} as const;

// Role hierarchy for authorization
export const ROLE_HIERARCHY = {
  admin: 4,
  manager: 3,
  staff: 2,
  customer: 1
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

// Session constants
export const SESSION_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',     // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d',     // 7 days
  REMEMBER_ME_EXPIRY: '30d',      // 30 days
  MAX_SESSIONS_PER_USER: 5,       // Limit concurrent sessions
  SESSION_CLEANUP_INTERVAL: '1h'  // Clean expired sessions
} as const;