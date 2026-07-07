const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activity.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, authorize('ADMIN'), getActivities);

module.exports = router;
