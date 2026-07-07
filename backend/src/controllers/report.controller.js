const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * @desc    Generate a report of devices based on filters (for printing/export)
 * @route   GET /api/reports/devices
 * @access  Private
 */
const getDeviceReport = async (req, res, next) => {
  try {
    const { departmentId, roomId, categoryId, fromDate, toDate } = req.query;
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    let whereClause = { systemType };

    if (departmentId) whereClause.departmentId = parseInt(departmentId);
    if (roomId) whereClause.roomId = parseInt(roomId);
    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    
    // Filter by createdAt date range if provided
    if (fromDate || toDate) {
      whereClause.createdAt = {};
      if (fromDate) whereClause.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    const devices = await prisma.device.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } },
        department: { select: { name: true } },
        room: { select: { name: true } }
      },
      orderBy: { departmentId: 'asc' } // Group by department logically
    });

    return sendSuccess(res, 200, 'Device report generated', devices);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a report of maintenance costs and activities
 * @route   GET /api/reports/maintenance
 * @access  Private
 */
const getMaintenanceReport = async (req, res, next) => {
  try {
    const { technicianId, fromDate, toDate, serialNumber } = req.query;
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    let whereClause = { systemType };

    if (technicianId) whereClause.technicianId = parseInt(technicianId);
    if (serialNumber) whereClause.deviceSerialNumber = serialNumber;
    
    if (fromDate || toDate) {
      whereClause.visitDate = {};
      if (fromDate) whereClause.visitDate.gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.visitDate.lte = endDate;
      }
    }

    const logs = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        technician: { select: { name: true } },
        room: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { visitDate: 'desc' }
    });

    return sendSuccess(res, 200, 'Maintenance report generated', {
      logsCount: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeviceReport,
  getMaintenanceReport
};
