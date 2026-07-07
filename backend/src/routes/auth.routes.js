const express = require('express');
const router = express.Router();

// Import the Controller (The Brain)
const { login, getProfile, logout } = require('../controllers/auth.controller');

// Import the Validator (The Spell Checker)
const { loginValidationRules, validate } = require('../validators/auth.validator');

// Import the Middlewares (The Security Guards)
const { protect } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

/**
 * Route: POST /api/auth/login
 * Flow: User sends Request -> Login Rate Limiter -> Validator Rules -> Validator Check -> Login Controller
 */
router.post(
  '/login',
  loginLimiter,
  loginValidationRules(),
  validate,
  login
);

/**
 * Route: GET /api/auth/profile
 * Flow: User sends Request -> Protect Middleware (Checks Token) -> Get Profile Controller
 */
router.get(
  '/profile',
  protect,
  getProfile
);

/**
 * Route: POST /api/auth/logout
 * Flow: User sends Request -> Logout Controller
 */
router.post(
  '/logout',
  logout
);

module.exports = router;
