const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const logger = require('../config/logger');

/**
 * Middleware to verify if a user is logged in.
 * It checks the 'Authorization' header for a valid JWT token.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the token exists in the cookie (Priority) or in the headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // 3. Verify the token using our Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database to ensure they still exist
      // We exclude the password from the result for security
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, name: true, role: true }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: { message: 'The user belonging to this token no longer exists.' } });
      }

      // 5. Attach the user object to the request so other routes can use it
      req.user = user;
      next(); // Move to the next middleware or route
    } catch (error) {
      logger.error(`Authentication Failed: ${error.message}`);
      return res.status(401).json({ success: false, error: { message: 'Not authorized, token failed.' } });
    }
  }

  // 6. If no token was found at all
  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Not authorized, no token provided.' } });
  }
};

/**
 * Middleware to restrict access based on user roles.
 * Example usage: authorize('ADMIN', 'IT_STAFF')
 * 
 * @param  {...string} roles - The roles allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the logged-in user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ID: ${req.user.id} with role: ${req.user.role}`);
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Forbidden. You do not have permission to perform this action.' } 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
