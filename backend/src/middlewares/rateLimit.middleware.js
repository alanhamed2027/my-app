const rateLimit = require('express-rate-limit');

/**
 * Global Rate Limiter
 * 
 * Protects the entire API from general spam/DDoS attacks.
 * Allows 100 requests per 15 minutes per IP address.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000, // Increased to 1000 for development testing
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many requests created from this IP, please try again after 15 minutes.'
    }
  }
});

/**
 * Strict Login Rate Limiter
 * 
 * Specifically protects the login endpoint from Brute Force attacks.
 * If a hacker tries to guess passwords, they are blocked quickly.
 * Allows only 5 login attempts per 10 minutes per IP address.
 */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes window
  max: 50, // Increased to 50 for development testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts from this IP, please try again after 10 minutes. This is a security measure.'
    }
  }
});

module.exports = {
  globalLimiter,
  loginLimiter
};
