const express = require('express');
const router = express.Router();
const { getDeviceReport, getMaintenanceReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Anyone in IT or Admin can view reports
router.get('/devices', authorize('ADMIN', 'IT_STAFF'), getDeviceReport);
router.get('/maintenance', authorize('ADMIN', 'IT_STAFF'), getMaintenanceReport);

module.exports = router;
