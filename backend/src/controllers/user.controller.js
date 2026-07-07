const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../config/logger');
const { logActivity } = require('../services/logger.service');

/**
 * @desc    Get all users (excluding passwords)
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (IT Staff, Viewer, etc.)
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    // 1. Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUser) {
      return sendError(res, 400, 'A user with this username already exists.');
    }

    // 2. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || 'VIEWER' // Default to VIEWER if no role is provided
      },
      select: { id: true, username: true, name: true, role: true, createdAt: true } // Return everything EXCEPT the password
    });

    // 4. Log the action
    logger.info(`New user created: ${newUser.username} by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: newUser.id,
      details: `بەکارهێنەری نوێ دروستکرا: ${newUser.name} (${newUser.username})`,
      req
    });
    
    return sendSuccess(res, 201, 'User created successfully', newUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a user
 * @route   PUT /api/users/:id
 * @access  Private (Admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, password, name, role } = req.body;

    // Build the update object dynamically based on what was sent
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username.toLowerCase();
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Attempt to update the user
    // If the user doesn't exist, Prisma will throw a 'P2025' error which is caught by our error.middleware
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, name: true, role: true, updatedAt: true }
    });

    logger.info(`User ID: ${userId} updated by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'USER',
      entityId: userId,
      details: `گۆڕانکاری لە بەکارهێنەر کرا: ${updatedUser.name} (${updatedUser.username})`,
      req
    });

    return sendSuccess(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Security Check: Prevent the Admin from accidentally deleting themselves!
    if (userId === req.user.id) {
      return sendError(res, 400, 'You cannot delete your own admin account.');
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    logger.warn(`User ID: ${userId} DELETED by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'USER',
      entityId: userId,
      details: `بەکارهێنەرێک سڕایەوە (ID: ${userId})`,
      req
    });

    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
