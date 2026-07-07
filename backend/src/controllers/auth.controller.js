const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { generateToken, attachTokenToCookie } = require('../utils/jwt.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../config/logger');
const { logActivity } = require('../services/logger.service');

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Find the user in the database by their username
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    // 2. If user doesn't exist, return error
    if (!user) {
      return sendError(res, 401, 'Invalid username or password'); 
    }

    // 3. Compare the provided password with the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return sendError(res, 401, 'Invalid username or password');
    }

    // 4. Generate a JWT Token
    const token = generateToken(user.id);

    // 5. Attach the token to an HTTP-Only cookie for maximum security
    attachTokenToCookie(res, token);

    // 6. Log the successful login for auditing purposes
    logger.info(`User Logged In: ${user.username} (IP: ${req.ip})`);
    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: 'بەکارهێنەر چووە ژوورەوە بە سەرکەوتوویی',
      req
    });

    // 7. Send success response with user details (excluding password)
    return sendSuccess(res, 200, 'Logged in successfully', {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      token // Also send token in body for frontend to use in headers if needed
    });

  } catch (error) {
    // If anything fails (like DB disconnected), pass it to the Error Middleware
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Requires Token)
 */
const getProfile = async (req, res, next) => {
  try {
    // The user is already attached to req.user by the auth.middleware.js
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return sendError(res, 404, 'User profile not found');
    }

    return sendSuccess(res, 200, 'User profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  // Clear the HTTP-Only cookie by setting its expiration to the past
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  return sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = {
  login,
  getProfile,
  logout
};
