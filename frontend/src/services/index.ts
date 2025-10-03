// Export all services
export { default as api, API_BASE_URL } from './api';
export * from './authService';
export * from './restaurantService';
export * from './healthService';

// Re-export commonly used interfaces
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from './authService';

export type {
  Restaurant,
  MenuItem,
  Reservation,
} from './restaurantService';