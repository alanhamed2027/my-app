const { body } = require('express-validator');

/**
 * Validation Rules for creating or updating a Department
 */
const departmentValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Department name is required.')
      .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters.')
  ];
};

/**
 * Validation Rules for creating or updating a Room
 */
const roomValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Room name/number is required.')
      .isLength({ min: 1, max: 50 }).withMessage('Room name must be between 1 and 50 characters.'),

    body('departmentId')
      .notEmpty().withMessage('A room must belong to a department.')
      .isInt().withMessage('Department ID must be a valid integer number.'),

    body('floor')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Floor description is too long.'),

    body('building')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Building description is too long.')
  ];
};

module.exports = {
  departmentValidationRules,
  roomValidationRules
};
