const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');

/**
 * Validation Rules for User Login
 * 
 * We use express-validator to ensure the data sent by the user
 * matches our exact requirements BEFORE it even touches our database.
 */
const loginValidationRules = () => {
  return [
    // Username must not be empty
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.'),

    // Password cannot be empty
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required.')
  ];
};

/**
 * Middleware to check if the validation rules passed or failed.
 * If they failed, it automatically stops the request and sends a 400 Error.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    // If there are no errors, move to the next function (the controller)
    return next();
  }

  // If there are errors, extract the first error message and send it back
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push(err.msg));

  // Send a 400 Bad Request with the validation messages
  return sendError(res, 400, extractedErrors.join(' '));
};

module.exports = {
  loginValidationRules,
  validate
};
