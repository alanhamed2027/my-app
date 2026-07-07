const express = require('express');
const router = express.Router();

const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// GET settings
router.get('/', protect, getSettings);

// PUT settings (Admin only)
router.put('/', protect, authorize('ADMIN'), updateSettings);

module.exports = router;
