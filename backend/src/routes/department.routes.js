const express = require('express');
const router = express.Router();

// Import Controllers
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllRooms,
  createRoom,
  deleteRoom
} = require('../controllers/department.controller');

// Import Validators
const {
  departmentValidationRules,
  roomValidationRules
} = require('../validators/department.validator');
const { validate } = require('../validators/auth.validator'); // Re-use the error checker

// Import Middlewares
const { protect, authorize } = require('../middlewares/auth.middleware');

// ==========================================
// ALL ROUTES BELOW REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

// ==========================================
// DEPARTMENTS ROUTES (/api/departments)
// ==========================================

// Anyone logged in can view the departments
router.get('/', getAllDepartments);

// Only ADMIN and IT_STAFF can create or delete departments
router.post(
  '/',
  authorize('ADMIN', 'IT_STAFF'),
  departmentValidationRules(),
  validate,
  createDepartment
);

router.put(
  '/:id',
  authorize('ADMIN', 'IT_STAFF'),
  departmentValidationRules(),
  validate,
  updateDepartment
);

router.delete(
  '/:id',
  authorize('ADMIN', 'IT_STAFF'),
  deleteDepartment
);

// ==========================================
// ROOMS ROUTES (/api/departments/rooms)
// Note: In app.js we will mount this as /api/departments, 
// so the path here is just /rooms
// ==========================================

// Anyone logged in can view the rooms
router.get('/rooms', getAllRooms);

// Only ADMIN and IT_STAFF can create or delete rooms
router.post(
  '/rooms',
  authorize('ADMIN', 'IT_STAFF'),
  roomValidationRules(),
  validate,
  createRoom
);

router.delete(
  '/rooms/:id',
  authorize('ADMIN', 'IT_STAFF'),
  deleteRoom
);

module.exports = router;
