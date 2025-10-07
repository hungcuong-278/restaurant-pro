/**
 * Simple logger utility
 */

export interface Logger {
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}

export const createLogger = (context: string): Logger => {
  return {
    info: (message: string, meta?: any) => {
      console.log(`[${context}] INFO:`, message, meta || '');
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[${context}] WARN:`, message, meta || '');
    },
    error: (message: string, meta?: any) => {
      console.error(`[${context}] ERROR:`, message, meta || '');
    },
  };
};
