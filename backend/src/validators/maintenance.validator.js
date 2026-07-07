const { body } = require('express-validator');

/**
 * Validation Rules for creating or updating a Maintenance Record
 */
const maintenanceValidationRules = () => {
  return [
    body('departmentId')
      .optional({ nullable: true })
      .isInt().withMessage('Department ID must be a valid integer.'),

    body('roomId')
      .optional({ nullable: true })
      .isInt().withMessage('Room ID must be a valid integer.'),

    body('maintenanceTask')
      .optional({ nullable: true })
      .isString().withMessage('Maintenance task must be a string.'),
      
    body('requesterName')
      .optional({ nullable: true })
      .isString().withMessage('Requester name must be a string.'),

    body('deviceType')
      .optional({ nullable: true })
      .isString(),

    body('deviceBrandModel')
      .optional({ nullable: true })
      .isString(),

    body('deviceSerialNumber')
      .optional({ nullable: true })
      .isString(),

    body('visitDate')
      .notEmpty().withMessage('Visit date is required.')
      .isISO8601().withMessage('Visit date must be a valid date format.'),

    body('notes')
      .optional({ nullable: true })
      .trim()
  ];
};

module.exports = {
  maintenanceValidationRules
};
