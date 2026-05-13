import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import authService from '../services/authService';
import { 
  AuthState, 
  AuthContextType, 
  User, 
  LoginData, 
  RegisterData, 
  AuthResponse
} from '../types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken?: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          const token = authService.getToken();
          
          if (user && token) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token }
            });

            // Verify token is still valid by fetching profile
            const currentUser = await authService.getProfile();
            if (currentUser) {
              dispatch({
                type: 'UPDATE_USER',
                payload: currentUser
              });
            } else {
              // Token invalid, logout
              dispatch({ type: 'AUTH_LOGOUT' });
              await authService.logout();
            }
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
        await authService.logout();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Setup automatic token refresh
    authService.setupTokenRefresh();
  }, []);

  // Login function
  const login = async (data: LoginData): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.login(data);

      if (response.success && response.user && response.token) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken
          }
        });
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message
        });
      }

      return response;
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authService.register(data);

      if (response.success && response.user && response.token) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken
          }
        });
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message
        });
      }

      return response;
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      });
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();
      if (!success) {
        dispatch({ type: 'AUTH_LOGOUT' });
        await authService.logout();
      }
      return success;
    } catch (error) {
      console.error('Token refresh error:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
      await authService.logout();
      return false;
    }
  };

  // Clear error function
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      // This would call an update profile API endpoint
      // For now, just update local state
      if (state.user) {
        const updatedUser = { ...state.user, ...data };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  // Role checking functions
  const hasRole = (requiredRole: string): boolean => {
    return authService.hasRole(requiredRole);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isManager = (): boolean => {
    return authService.isManager();
  };

  const isStaff = (): boolean => {
    return authService.isStaff();
  };

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateProfile,
    changePassword,

    // Role checking
    hasRole,
    isAdmin,
    isManager,
    isStaff,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for components that require authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;