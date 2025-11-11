/**
 * Simple logger utility
 */

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export const createLogger = (context: string): Logger => {
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${context}] INFO:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${context}] WARN:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${context}] ERROR:`, message, ...args);
    },
  };
};
