import api from './api';

// Auth API interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'customer' | 'staff' | 'manager' | 'admin';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

// Auth API functions
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<{ success: boolean; token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};