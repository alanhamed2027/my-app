const { body } = require('express-validator');

/**
 * Validation Rules for creating a new User (e.g., IT Staff)
 * Only Admins will be able to hit the route that uses this validator.
 */
const createUserValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters.'),

    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.')
      .isAlphanumeric().withMessage('Username can only contain letters and numbers.')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.'),

    body('password')
      .trim()
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

    body('role')
      .optional()
      .isIn(['ADMIN', 'IT_STAFF', 'VIEWER']).withMessage('Invalid role selected.')
  ];
};

/**
 * Validation Rules for updating an existing User
 * Fields are optional here because the admin might only want to update the name, not the password.
 */
const updateUserValidationRules = () => {
  return [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters.'),

    body('username')
      .optional()
      .trim()
      .isAlphanumeric().withMessage('Username can only contain letters and numbers.')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.'),

    body('password')
      .optional()
      .trim()
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

    body('role')
      .optional()
      .isIn(['ADMIN', 'IT_STAFF', 'VIEWER']).withMessage('Invalid role selected.')
  ];
};

module.exports = {
  createUserValidationRules,
  updateUserValidationRules
};
