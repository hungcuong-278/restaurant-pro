import app from './app';
import { testConnection } from './config/database';

const PORT = process.env.PORT || 5000;

// Global error handlers for debugging
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  console.error("Stack:", err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Test database connection before starting server
let server: any;

testConnection().then((isConnected) => {
  if (!isConnected) {
    console.error('❌ Cannot start server - database connection failed');
    process.exit(1);
  }
  
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close(() => {
      console.log('Process terminated');
    });
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  if (server) {
    server.close(() => {
      console.log('Process terminated');
    });
  }
});