/**
 * Standardized API Response Utilities
 * 
 * Having a consistent JSON response structure across the entire API
 * makes it significantly easier for the Frontend (React) to parse
 * data and handle errors predictably.
 */

/**
 * Send a successful response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g., 200, 201)
 * @param {string} message - A short description of the success
 * @param {object} [data=null] - The actual payload (e.g., user object, device list)
 * @param {object} [meta=null] - Extra metadata (e.g., pagination data: total pages, current page)
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response (Manually triggered errors)
 * Note: Unhandled errors are caught by error.middleware.js
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g., 400, 404)
 * @param {string} message - The error message
 */
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
