const express = require('express');
const router = express.Router();

// Import Controllers
const {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  transferDevice,
  getAllCategories,
  createCategory,
  deleteCategory
} = require('../controllers/device.controller');

// Import Validators
const { deviceValidationRules } = require('../validators/device.validator');
const { validate } = require('../validators/auth.validator');

// Import Middlewares
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ==========================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

// ==========================================
// DEVICE CATEGORIES
// ==========================================
// Anyone logged in can see categories (e.g., for a dropdown menu)
router.get('/categories', getAllCategories);
router.post('/categories', authorize('ADMIN', 'IT_STAFF'), createCategory);
router.delete('/categories/:id', authorize('ADMIN', 'IT_STAFF'), deleteCategory);

// ==========================================
// DEVICES
// ==========================================
// Anyone logged in can search and view devices
router.get('/', getAllDevices);
router.get('/:id', getDeviceById);

// Only ADMIN and IT_STAFF can create, update, or delete devices
// Notice the 'upload.single('image')' middleware! It intercepts the request,
// saves the image, and then passes the rest of the data to the validator.
router.post(
  '/',
  authorize('ADMIN', 'IT_STAFF'),
  upload.single('image'),
  deviceValidationRules(),
  validate,
  createDevice
);

router.put(
  '/:id',
  authorize('ADMIN', 'IT_STAFF'),
  upload.single('image'),
  deviceValidationRules(),
  validate,
  updateDevice
);

router.put(
  '/:id/transfer',
  authorize('ADMIN', 'IT_STAFF'),
  transferDevice
);

router.delete(
  '/:id',
  authorize('ADMIN', 'IT_STAFF'),
  deleteDevice
);

module.exports = router;
