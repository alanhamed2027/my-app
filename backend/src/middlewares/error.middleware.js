const logger = require('../config/logger');

/**
 * Global Error Handling Middleware
 * 
 * In Express, if any route throws an error (e.g., database failure, validation error),
 * it eventually falls down to this middleware. 
 * This ensures that our server never crashes violently, and the user
 * always receives a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // 1. Log the error securely for IT staff to see later
  logger.error(`${err.name}: ${err.message}\nPath: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${req.ip}\nStack: ${err.stack}`);

  // 2. Determine the HTTP status code
  // If the error doesn't specify a status code, default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // 3. Customize the error message based on the type of error
  let message = err.message || 'An unexpected error occurred on the server.';

  // Handle specific Prisma Database Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      // P2002 means "Unique constraint failed" (e.g., trying to register a username that already exists)
      message = 'Duplicate entry detected. This record already exists in the database.';
    } else if (err.code === 'P2025') {
      message = 'Record not found in the database.';
    }
  }

  // Handle JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please log in again.';
  }

  // 4. Send the JSON response to the user
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      // Only show the full technical stack trace if we are developing locally.
      // NEVER show stack traces in production, as hackers can use them to find vulnerabilities!
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

module.exports = errorHandler;
