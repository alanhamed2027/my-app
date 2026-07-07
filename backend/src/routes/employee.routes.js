const express = require('express');
const router = express.Router();
const { getAllEmployees } = require('../controllers/employee.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/', getAllEmployees);

module.exports = router;
