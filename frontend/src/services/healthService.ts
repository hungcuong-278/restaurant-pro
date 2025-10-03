import api from './api';

// Health check service
export const healthService = {
  // Basic API health check
  checkHealth: async (): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Database health check
  checkDatabase: async (): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> => {
    const response = await api.get('/health/db');
    return response.data;
  },

  // Basic API test
  testAPI: async (): Promise<{
    success: boolean;
    message: string;
    version: string;
    timestamp: string;
  }> => {
    const response = await api.get('/');
    return response.data;
  },
};