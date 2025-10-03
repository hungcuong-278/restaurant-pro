import { Router, Request, Response } from 'express';

const router = Router();

// Store last error and debug logs
let lastError: any = null;
let debugLogs: string[] = [];

export const setLastError = (error: any) => {
  lastError = {
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: new Date().toISOString()
  };
};

export const addDebugLog = (log: string) => {
  debugLogs.push(`[${new Date().toISOString()}] ${log}`);
  if (debugLogs.length > 100) debugLogs.shift(); // Keep only last 100
};

// Debug endpoint to get last error
router.get('/last-error', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: lastError || { message: 'No errors recorded' }
  });
});

// Debug endpoint to get logs
router.get('/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: debugLogs
  });
});

export default router;
