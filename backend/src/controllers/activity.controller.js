const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * @desc    Get all activity logs with pagination and filtering
 * @route   GET /api/activities
 * @access  Private (Admin only)
 */
const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, action, entity } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {};
    if (userId) whereClause.userId = parseInt(userId);
    if (action) whereClause.action = action;
    if (entity) whereClause.entity = entity;

    const [logs, totalItems] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.activityLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalItems / take);

    return sendSuccess(res, 200, 'Activities retrieved successfully', logs, {
      totalItems,
      totalPages,
      currentPage: parseInt(page),
      limit: take
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities
};
