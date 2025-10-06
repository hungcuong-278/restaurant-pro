import axios from 'axios';
import { 
  AuthResponse, 
  RegisterData, 
  LoginData, 
  User,
  AUTH_STORAGE_KEYS 
} from '../types/auth';

// Configure base URL for auth requests
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: `${API_BASE}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 responses
let refreshPromise: Promise<boolean> | null = null;

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Prevent multiple refresh calls
        if (!refreshPromise) {
          refreshPromise = authServiceInstance.refreshToken();
        }
        
        const refreshed = await refreshPromise;
        refreshPromise = null;
        
        if (refreshed) {
          const newToken = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        authServiceInstance.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/register', data);
      const authResponse = response.data as AuthResponse;

      if (authResponse.success && authResponse.token && authResponse.user) {
        this.setAuthData(authResponse.token, authResponse.refreshToken, authResponse.user);
      }

      return authResponse;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Registration failed. Please check your connection and try again.'
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/login', data);
      const authResponse = response.data as AuthResponse;

      if (authResponse.success && authResponse.token && authResponse.user) {
        this.setAuthData(authResponse.token, authResponse.refreshToken, authResponse.user);
      }

      return authResponse;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Login failed. Please check your connection and try again.'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to revoke session
      await authApi.post('/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(`${API_BASE}/auth/refresh-token`, {
        refreshToken: refreshToken
      });

      const data = response.data;
      if (data.success && data.token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User | null> {
    try {
      const response = await authApi.get('/profile');
      const data = response.data;

      if (data.success && data.user) {
        // Update stored user data
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('Get profile failed:', error);
      return null;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await authApi.patch('/change-password', {
        currentPassword,
        newPassword
      });

      return response.data.success;
    } catch (error) {
      console.error('Change password failed:', error);
      return false;
    }
  }

  /**
   * Check authentication status
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Check if user has required role
   */
  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: 4,
      manager: 3,
      staff: 2,
      customer: 1
    };

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is manager or higher
   */
  isManager(): boolean {
    return this.hasRole('manager');
  }

  /**
   * Check if user is staff or higher
   */
  isStaff(): boolean {
    return this.hasRole('staff');
  }

  /**
   * Store authentication data
   */
  private setAuthData(token: string, refreshToken?: string, user?: User): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    
    if (refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh(): void {
    // Check for token refresh every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated()) {
        const token = this.getToken();
        if (token) {
          // Decode JWT to check expiry (simplified)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            // Refresh if token expires in less than 5 minutes
            if (payload.exp - currentTime < 300) {
              await this.refreshToken();
            }
          } catch (error) {
            console.error('Token parsing error:', error);
          }
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;