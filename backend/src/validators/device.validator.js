const { body } = require('express-validator');

/**
 * Validation Rules for creating or updating a Device (Asset)
 * This is the most complex validation because devices have many specific fields.
 */
const deviceValidationRules = () => {
  return [
    // 1. Core Identification (Required)
    body('assetNumber')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }).withMessage('Asset Number is too long.'),
      
    body('categoryId')
      .notEmpty().withMessage('Device Category is required.')
      .isInt().withMessage('Category ID must be a valid number.'),

    // 2. Hardware Specs (Optional, because a Router doesn't have RAM/CPU)
    body('cpu').optional().trim().isLength({ max: 100 }),
    body('ram').optional().trim().isLength({ max: 100 }),
    body('ssd').optional().trim().isLength({ max: 100 }),
    body('hdd').optional().trim().isLength({ max: 100 }),
    body('gpu').optional().trim().isLength({ max: 100 }),
    
    // 3. Software Specs (Optional)
    body('operatingSystem').optional().trim().isLength({ max: 100 }),
    body('officeVersion').optional().trim().isLength({ max: 100 }),

    // 4. Identifiers & Network (Optional but must be correctly formatted if provided)
    body('serialNumber').optional().trim().isLength({ max: 100 }),
    body('inventoryNumber').optional().trim().isLength({ max: 100 }),
    body('macAddress').optional().trim().isLength({ max: 50 }),
    body('ipAddress')
      .optional()
      .trim()
      .isIP().withMessage('If provided, IP Address must be a valid IP format (e.g., 192.168.1.10)'),

    // 5. Status & Assignment (Optional)
    body('status')
      .optional()
      .isIn(['ACTIVE', 'BROKEN', 'UNDER_MAINTENANCE', 'INACTIVE', 'DISPOSED'])
      .withMessage('Invalid device status selected.'),
      
    body('departmentId')
      .optional({ nullable: true }) // nullable means it can be explicitly set to 'null' if device is unassigned
      .isInt().withMessage('Department ID must be a valid number.'),
      
    body('roomId')
      .optional({ nullable: true })
      .isInt().withMessage('Room ID must be a valid number.'),
      
    body('employeeId')
      .optional({ nullable: true })
      .isInt().withMessage('Employee ID must be a valid number.'),

    // 6. Dates (Optional)
    body('purchaseDate')
      .optional({ nullable: true })
      .isISO8601().withMessage('Purchase date must be a valid date format.'),
      
    body('warrantyExpire')
      .optional({ nullable: true })
      .isISO8601().withMessage('Warranty expire date must be a valid date format.')
  ];
};

module.exports = {
  deviceValidationRules
};
