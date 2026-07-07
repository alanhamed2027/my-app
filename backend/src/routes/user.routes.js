const express = require('express');
const router = express.Router();

// Import Controllers
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');

// Import Validators
const { createUserValidationRules, updateUserValidationRules } = require('../validators/user.validator');
const { validate } = require('../validators/auth.validator'); // Re-use the same validation checker

// Import Middlewares
const { protect, authorize } = require('../middlewares/auth.middleware');

/**
 * SUPER IMPORTANT:
 * All routes in this file are STRICTLY for Admins.
 * Instead of adding "protect" and "authorize('ADMIN')" to every single route below,
 * we can apply it to the entire router at once!
 */
router.use(protect); // 1. Must be logged in
router.use(authorize('ADMIN')); // 2. Must be an Admin

/**
 * Route: GET /api/users
 * Desc: Get all users
 */
router.get('/', getAllUsers);

/**
 * Route: POST /api/users
 * Desc: Create a new user
 * Flow: Token Check -> Admin Check -> Validation Rules -> Controller
 */
router.post(
  '/',
  createUserValidationRules(),
  validate,
  createUser
);

/**
 * Route: PUT /api/users/:id
 * Desc: Update an existing user
 */
router.put(
  '/:id',
  updateUserValidationRules(),
  validate,
  updateUser
);

/**
 * Route: DELETE /api/users/:id
 * Desc: Delete a user
 */
router.delete('/:id', deleteUser);

module.exports = router;
