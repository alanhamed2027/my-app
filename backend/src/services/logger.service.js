const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const UAParser = require('ua-parser-js');

/**
 * Log an activity to the database
 * 
 * @param {Object} params
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - The action being performed (CREATE, UPDATE, DELETE, LOGIN, etc)
 * @param {string} params.entity - The entity being affected (DEVICE, USER, DEPARTMENT, etc)
 * @param {number} params.entityId - The ID of the affected entity
 * @param {string} params.details - A human readable description of the action
 * @param {Object} params.req - The Express request object to extract IP and Browser info
 */
const logActivity = async ({ userId, action, entity, entityId, details, req }) => {
  try {
    let ipAddress = null;
    let browser = null;
    let os = null;

    if (req) {
      ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
      
      const userAgent = req.headers['user-agent'];
      if (userAgent) {
        const parser = new UAParser(userAgent);
        const browserInfo = parser.getBrowser();
        const osInfo = parser.getOS();
        
        browser = browserInfo.name ? `${browserInfo.name} ${browserInfo.version || ''}`.trim() : null;
        os = osInfo.name ? `${osInfo.name} ${osInfo.version || ''}`.trim() : null;
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details,
        ipAddress,
        browser,
        os
      }
    });
  } catch (error) {
    // Log to console but don't break the application flow if activity logging fails
    console.error('Failed to log activity:', error);
  }
};

module.exports = {
  logActivity
};
