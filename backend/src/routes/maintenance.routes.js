const express = require('express');
const router = express.Router();

// Import Controllers
const {
  getAllMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog
} = require('../controllers/maintenance.controller');

// Import Validators
const { maintenanceValidationRules } = require('../validators/maintenance.validator');
const { validate } = require('../validators/auth.validator'); // Re-use the error checker

// Import Middlewares
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

/**
 * Route: GET /api/maintenance
 * Desc: Get all maintenance logs (can be filtered by ?deviceId=1)
 * Access: Private
 */
router.get('/', getAllMaintenanceLogs);

/**
 * Route: POST /api/maintenance
 * Desc: Create a new maintenance log
 * Access: Private (Admin or IT Staff)
 */
router.post(
  '/',
  authorize('ADMIN', 'IT_STAFF'),
  upload.single('document'),
  maintenanceValidationRules(),
  validate,
  createMaintenanceLog
);

/**
 * Route: PUT /api/maintenance/:id
 * Desc: Update a maintenance log
 * Access: Private (Admin or IT Staff)
 */
router.put(
  '/:id',
  authorize('ADMIN', 'IT_STAFF'),
  upload.single('document'),
  maintenanceValidationRules(),
  validate,
  updateMaintenanceLog
);

/**
 * Route: DELETE /api/maintenance/:id
 * Desc: Delete a maintenance log
 * Access: Private (Admin only)
 */
router.delete(
  '/:id',
  authorize('ADMIN'), // Strict restriction: Only admins can delete logs permanently
  deleteMaintenanceLog
);

module.exports = router;
