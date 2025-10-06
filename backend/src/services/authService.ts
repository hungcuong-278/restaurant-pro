import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request } from 'express';
import db from '../config/database';
import { 
  User, 
  UserSession, 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  UserPublic, 
  TokenPayload, 
  RefreshTokenPayload,
  PasswordValidation,
  SESSION_CONFIG,
  PASSWORD_REQUIREMENTS,
  ROLE_HIERARCHY,
  UserRole
} from '../types/auth';

class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }

    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
      errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate JWT token
   */
  generateAccessToken(user: UserPublic, sessionId: string): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(SESSION_CONFIG.ACCESS_TOKEN_EXPIRY)
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      algorithm: 'HS256'
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: string, sessionId: string, rememberMe = false): string {
    const expiry = rememberMe ? SESSION_CONFIG.REMEMBER_ME_EXPIRY : SESSION_CONFIG.REFRESH_TOKEN_EXPIRY;
    
    const payload: RefreshTokenPayload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiry(expiry)
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      algorithm: 'HS256'
    });
  }

  /**
   * Verify JWT token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash token for database storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest, req: Request): Promise<AuthResponse> {
    try {
      // Validate password
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join('. ')
        };
      }

      // Check if email already exists
      const existingUser = await db('users').where('email', data.email).first();
      if (existingUser) {
        return {
          success: false,
          message: 'Email address is already registered'
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const insertResult = await db('users').insert({
        email: data.email.toLowerCase().trim(),
        password_hash: passwordHash,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        phone: data.phone?.trim() || null,
        role: data.role || 'customer',
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Get the created user (SQLite returns rowid, not the actual id)
      const user = await db('users')
        .where('email', data.email.toLowerCase().trim())
        .orderBy('created_at', 'desc')
        .first();
        
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Create session and tokens
      const sessionResult = await this.createSession(user, req);

      return {
        success: true,
        message: 'Account created successfully',
        user: this.toPublicUser(user),
        token: sessionResult.accessToken,
        refreshToken: sessionResult.refreshToken,
        expiresIn: this.parseExpiry(SESSION_CONFIG.ACCESS_TOKEN_EXPIRY)
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest, req: Request): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await db('users')
        .where('email', data.email.toLowerCase().trim())
        .first();

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(data.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      await db('users')
        .where('id', user.id)
        .update({
          last_login: new Date(),
          updated_at: new Date()
        });

      // Create session and tokens
      const sessionResult = await this.createSession(user, req, data.rememberMe);

      return {
        success: true,
        message: 'Login successful',
        user: this.toPublicUser(user),
        token: sessionResult.accessToken,
        refreshToken: sessionResult.refreshToken,
        expiresIn: this.parseExpiry(SESSION_CONFIG.ACCESS_TOKEN_EXPIRY)
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Create user session
   */
  private async createSession(user: User, req: Request, rememberMe = false) {
    // Clean up old sessions if user has too many
    await this.cleanupUserSessions(user.id);

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Generate tokens
    const accessToken = this.generateAccessToken(this.toPublicUser(user), sessionId);
    const refreshToken = this.generateRefreshToken(user.id, sessionId, rememberMe);

    // Calculate expiry
    const expiryTime = rememberMe ? SESSION_CONFIG.REMEMBER_ME_EXPIRY : SESSION_CONFIG.ACCESS_TOKEN_EXPIRY;
    const expiresAt = new Date(Date.now() + this.parseExpiry(expiryTime) * 1000);

    // Store session in database
    await db('user_sessions').insert({
      id: sessionId,
      user_id: user.id,
      token_hash: this.hashToken(accessToken),
      refresh_token_hash: this.hashToken(refreshToken),
      device_info: req.get('User-Agent') || null,
      ip_address: this.getClientIP(req),
      session_type: 'web',
      is_active: true,
      is_revoked: false,
      expires_at: expiresAt,
      last_activity: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      sessionId,
      accessToken,
      refreshToken
    };
  }

  /**
   * Logout user (revoke session)
   */
  async logout(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await db('user_sessions')
        .where('id', sessionId)
        .update({
          is_active: false,
          is_revoked: true,
          revoked_at: new Date(),
          revoked_reason: 'user_logout',
          updated_at: new Date()
        });

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return db('users').where('id', id).first();
  }

  /**
   * Get session by ID
   */
  async getSessionById(id: string): Promise<UserSession | null> {
    return db('user_sessions').where('id', id).first();
  }

  /**
   * Check if user has permission for role
   */
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  /**
   * Convert User to UserPublic (remove sensitive data)
   */
  private toPublicUser(user: User): UserPublic {
    return {
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
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900; // 15 minutes default
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Cleanup old sessions for user
   */
  private async cleanupUserSessions(userId: string): Promise<void> {
    // Get active sessions count
    const sessionCount = await db('user_sessions')
      .where('user_id', userId)
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .count('id as count')
      .first();

    const count = sessionCount?.count ? Number(sessionCount.count) : 0;

    if (count >= SESSION_CONFIG.MAX_SESSIONS_PER_USER) {
      // Revoke oldest sessions
      const oldestSessions = await db('user_sessions')
        .where('user_id', userId)
        .where('is_active', true)
        .orderBy('created_at', 'asc')
        .limit(count - SESSION_CONFIG.MAX_SESSIONS_PER_USER + 1);

      const sessionIds = oldestSessions.map((s: any) => s.id);
      
      await db('user_sessions')
        .whereIn('id', sessionIds)
        .update({
          is_active: false,
          is_revoked: true,
          revoked_at: new Date(),
          revoked_reason: 'session_limit_exceeded',
          updated_at: new Date()
        });
    }
  }
}

export default new AuthService();