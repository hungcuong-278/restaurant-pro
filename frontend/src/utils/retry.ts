import React from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  shouldRetry: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 && status < 600;
  },
};

/**
 * Exponential backoff delay calculation
 */
const calculateDelay = (retryCount: number, baseDelay: number): number => {
  return baseDelay * Math.pow(2, retryCount);
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry wrapper for async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, retryDelay, shouldRetry } = { ...defaultRetryConfig, ...config };
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if we should retry
      const isAxiosError = error.isAxiosError;
      const shouldRetryThis = isAxiosError ? shouldRetry(error as AxiosError) : false;
      
      // If last attempt or shouldn't retry, throw error
      if (attempt === maxRetries || !shouldRetryThis) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = calculateDelay(attempt, retryDelay);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Axios interceptor for automatic retries
 */
export const setupAxiosRetry = (axiosInstance: any, config: RetryConfig = {}) => {
  const { maxRetries, retryDelay, shouldRetry } = { ...defaultRetryConfig, ...config };
  
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as AxiosRequestConfig & { _retry?: number };
      
      // Initialize retry count
      if (!originalConfig._retry) {
        originalConfig._retry = 0;
      }
      
      // Check if we should retry
      const shouldRetryThis = shouldRetry(error);
      
      if (originalConfig._retry < maxRetries && shouldRetryThis) {
        originalConfig._retry += 1;
        
        const delay = calculateDelay(originalConfig._retry - 1, retryDelay);
        
        console.log(
          `Retrying request to ${originalConfig.url} (attempt ${originalConfig._retry}/${maxRetries}) after ${delay}ms...`
        );
        
        await sleep(delay);
        
        return axiosInstance(originalConfig);
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Hook for retry with state management
 */
export const useRetry = () => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const retry = async <T,>(
    fn: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> => {
    setIsRetrying(true);
    setRetryCount(0);

    try {
      const result = await withRetry(fn, {
        ...config,
        shouldRetry: (error) => {
          setRetryCount(prev => prev + 1);
          return config?.shouldRetry?.(error) ?? defaultRetryConfig.shouldRetry(error);
        },
      });
      return result;
    } finally {
      setIsRetrying(false);
    }
  };

  const reset = () => {
    setIsRetrying(false);
    setRetryCount(0);
  };

  return { retry, isRetrying, retryCount, reset };
};
