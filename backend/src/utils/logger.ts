/**
 * Centralized Logger for Restaurant Pro
 * Provides structured logging with different log levels
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  error?: any;
  userId?: string;
  restaurantId?: string;
  requestId?: string;
}

class Logger {
  private moduleName: string;
  private context: Record<string, any>;

  constructor(moduleName: string, context: Record<string, any> = {}) {
    this.moduleName = moduleName;
    this.context = context;
  }

  /**
   * Format log entry
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.moduleName,
      message,
      data: data || undefined,
      error: error ? this.formatError(error) : undefined,
      ...this.context
    };
  }

  /**
   * Format error object
   */
  private formatError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any)
      };
    }
    return error;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    const color = this.getColorForLevel(entry.level);
    const resetColor = '\x1b[0m';
    
    // Console output with color
    const prefix = `${color}[${entry.timestamp}] [${entry.level}] [${entry.module}]${resetColor}`;
    console.log(`${prefix} ${entry.message}`);
    
    if (entry.data) {
      console.log('  Data:', JSON.stringify(entry.data, null, 2));
    }
    
    if (entry.error) {
      console.error('  Error:', entry.error);
    }
    
    // In production, you would send this to a logging service
    // e.g., Winston, Bunyan, or cloud logging service
  }

  /**
   * Get ANSI color code for log level
   */
  private getColorForLevel(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };
    return colors[level];
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatLogEntry(LogLevel.DEBUG, message, data);
      this.output(entry);
    }
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    const entry = this.formatLogEntry(LogLevel.INFO, message, data);
    this.output(entry);
  }

  /**
   * Warning log
   */
  warn(message: string, data?: any): void {
    const entry = this.formatLogEntry(LogLevel.WARN, message, data);
    this.output(entry);
  }

  /**
   * Error log
   */
  error(message: string, error?: any, data?: any): void {
    const entry = this.formatLogEntry(LogLevel.ERROR, message, data, error);
    this.output(entry);
  }

  /**
   * Fatal log (critical errors)
   */
  fatal(message: string, error?: any, data?: any): void {
    const entry = this.formatLogEntry(LogLevel.FATAL, message, data, error);
    this.output(entry);
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: Record<string, any>): Logger {
    return new Logger(this.moduleName, {
      ...this.context,
      ...additionalContext
    });
  }
}

/**
 * Create logger instance
 */
export function createLogger(moduleName: string, context?: Record<string, any>): Logger {
  return new Logger(moduleName, context);
}

export default Logger;
export { LogLevel };
