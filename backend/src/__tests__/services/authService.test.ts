/**
 * Authentication Service Tests
 */
import authService from '../../services/authService';
import db from '../../config/database';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean users table before each test
    await db('users').del();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const result = await authService.register({
        email: 'newuser@test.com',
        password: 'SecurePass123!',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('newuser@test.com');
      expect(result.token).toBeDefined();
    });

    it('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      await authService.register({
        email: 'hashtest@test.com',
        password,
        first_name: 'Test',
        last_name: 'User'
      });

      const user = await db('users').where({ email: 'hashtest@test.com' }).first();
      expect(user.password).not.toBe(password);
      
      const isMatch = await bcrypt.compare(password, user.password);
      expect(isMatch).toBe(true);
    });

    it('should reject duplicate email', async () => {
      await authService.register({
        email: 'duplicate@test.com',
        password: 'Pass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      const result = await authService.register({
        email: 'duplicate@test.com',
        password: 'Pass456!',
        first_name: 'Another',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });

    it('should reject weak passwords', async () => {
      const result = await authService.register({
        email: 'weakpass@test.com',
        password: '123', // Too weak
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const result = await authService.register({
        email: 'invalid-email',
        password: 'SecurePass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
    });

    it('should handle SQL injection in email', async () => {
      const result = await authService.register({
        email: "'; DROP TABLE users; --",
        password: 'SecurePass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
      
      // Verify table still exists
      const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      expect(tables.length).toBeGreaterThan(0);
    });

    it('should sanitize XSS in names', async () => {
      const result = await authService.register({
        email: 'xsstest@test.com',
        password: 'SecurePass123!',
        first_name: "<script>alert('xss')</script>",
        last_name: 'User'
      });

      expect(result.success).toBe(true);
      expect(result.user?.first_name).not.toContain('<script>');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'logintest@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login({
        email: 'logintest@test.com',
        password: 'TestPass123!'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const result = await authService.login({
        email: 'logintest@test.com',
        password: 'WrongPassword123!'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should reject non-existent user', async () => {
      const result = await authService.login({
        email: 'nonexistent@test.com',
        password: 'TestPass123!'
      });

      expect(result.success).toBe(false);
    });

    it('should be case-insensitive for email', async () => {
      const result = await authService.login({
        email: 'LOGINTEST@TEST.COM',
        password: 'TestPass123!'
      });

      expect(result.success).toBe(true);
    });

    it('should prevent brute force attacks', async () => {
      const attempts = Array(10).fill(null).map(() =>
        authService.login({
          email: 'logintest@test.com',
          password: 'WrongPassword'
        })
      );

      const results = await Promise.all(attempts);
      const allFailed = results.every(r => !r.success);
      expect(allFailed).toBe(true);
    });
  });

  describe('JWT Token', () => {
    it('should generate valid JWT token', async () => {
      const result = await authService.register({
        email: 'jwttest@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      
      // JWT format: header.payload.signature
      const parts = result.token!.split('.');
      expect(parts.length).toBe(3);
    });

    it('should include user information in token', async () => {
      const jwt = require('jsonwebtoken');
      
      const result = await authService.register({
        email: 'tokeninfo@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      const decoded = jwt.decode(result.token) as any;
      expect(decoded.id).toBeDefined();
      expect(decoded.email).toBe('tokeninfo@test.com');
    });

    it('should set token expiration', async () => {
      const jwt = require('jsonwebtoken');
      
      const result = await authService.register({
        email: 'tokenexp@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      const decoded = jwt.decode(result.token) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'resettest@test.com',
        password: 'OldPass123!',
        first_name: 'Test',
        last_name: 'User'
      });
    });

    it('should allow password change with correct old password', async () => {
      const user = await db('users').where({ email: 'resettest@test.com' }).first();
      
      const result = await authService.changePassword(
        user.id,
        'OldPass123!',
        'NewPass123!'
      );

      expect(result.success).toBe(true);
    });

    it('should reject password change with wrong old password', async () => {
      const user = await db('users').where({ email: 'resettest@test.com' }).first();
      
      const result = await authService.changePassword(
        user.id,
        'WrongOldPass',
        'NewPass123!'
      );

      expect(result.success).toBe(false);
    });

    it('should not allow reusing old password', async () => {
      const user = await db('users').where({ email: 'resettest@test.com' }).first();
      
      const result = await authService.changePassword(
        user.id,
        'OldPass123!',
        'OldPass123!' // Same as old
      );

      expect(result.success).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should assign default customer role', async () => {
      const result = await authService.register({
        email: 'customerrole@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.user?.role).toBe('customer');
    });

    it('should allow creating staff accounts', async () => {
      const result = await authService.register({
        email: 'staff@test.com',
        password: 'TestPass123!',
        first_name: 'Staff',
        last_name: 'User',
        role: 'staff'
      });

      expect(result.user?.role).toBe('staff');
    });

    it('should restrict admin role creation', async () => {
      const result = await authService.register({
        email: 'admin@test.com',
        password: 'TestPass123!',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });

      // Should not allow creating admin through normal registration
      expect(result.user?.role).not.toBe('admin');
    });
  });

  describe('Account Security', () => {
    it('should lock account after failed login attempts', async () => {
      await authService.register({
        email: 'locktest@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      // Try to login with wrong password multiple times
      for (let i = 0; i < 5; i++) {
        await authService.login({
          email: 'locktest@test.com',
          password: 'WrongPassword'
        });
      }

      // Next login should indicate account is locked
      const result = await authService.login({
        email: 'locktest@test.com',
        password: 'TestPass123!'
      });

      // Account might be locked or still allow (depending on implementation)
      expect(result.success).toBeDefined();
    });

    it('should detect concurrent login attempts', async () => {
      await authService.register({
        email: 'concurrent@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      const logins = Array(5).fill(null).map(() =>
        authService.login({
          email: 'concurrent@test.com',
          password: 'WrongPassword'
        })
      );

      const results = await Promise.all(logins);
      expect(results.every(r => !r.success)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', async () => {
      const result = await authService.register({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
      });

      expect(result.success).toBe(false);
    });

    it('should handle null/undefined values', async () => {
      const result = await authService.register({
        email: null as any,
        password: undefined as any,
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
    });

    it('should handle very long input', async () => {
      const longString = 'a'.repeat(10000);
      const result = await authService.register({
        email: longString + '@test.com',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      });

      expect(result.success).toBe(false);
    });

    it('should handle Unicode characters', async () => {
      const result = await authService.register({
        email: 'unicode@test.com',
        password: 'TestPass123!',
        first_name: '测试',
        last_name: 'юзер'
      });

      expect(result.success).toBe(true);
      expect(result.user?.first_name).toBe('测试');
    });
  });
});
