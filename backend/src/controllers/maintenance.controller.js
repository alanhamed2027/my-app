const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../config/logger');
const { logActivity } = require('../services/logger.service');

/**
 * @desc    Get all maintenance logs
 * @route   GET /api/maintenance
 * @access  Private
 */
const getAllMaintenanceLogs = async (req, res, next) => {
  try {
    const { deviceId, departmentId, roomId, limit = 50 } = req.query;
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    const whereClause = { systemType };
    if (deviceId) whereClause.deviceId = parseInt(deviceId);
    if (departmentId) whereClause.departmentId = parseInt(departmentId);
    if (roomId) whereClause.roomId = parseInt(roomId);

    const logs = await prisma.maintenance.findMany({
      where: whereClause,
      include: {
        department: { select: { name: true } },
        room: { select: { name: true } },
        technician: { select: { name: true, username: true } },
      },
      take: parseInt(limit),
      orderBy: { visitDate: 'desc' }
    });

    return sendSuccess(res, 200, 'Maintenance logs retrieved successfully', logs);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new maintenance log
 * @route   POST /api/maintenance
 * @access  Private (Admin or IT Staff)
 */
const createMaintenanceLog = async (req, res, next) => {
  try {
    const data = req.body;

    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    const logData = {
      departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      roomId: data.roomId ? parseInt(data.roomId) : null,
      maintenanceTask: data.maintenanceTask || null,
      requesterName: data.requesterName || null,
      deviceType: data.deviceType || null,
      deviceBrandModel: data.deviceBrandModel || null,
      deviceSerialNumber: data.deviceSerialNumber || null,
      notes: data.notes || null,
      technicianId: req.user.id,
      visitDate: new Date(data.visitDate),
      systemType
    };
    
    if (req.file) {
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      logData.documentUrl = `${serverUrl}/uploads/${req.file.filename}`;
    }

    const newLog = await prisma.maintenance.create({
      data: logData,
      include: {
        department: { select: { name: true } },
        room: { select: { name: true } },
        technician: { select: { name: true, username: true } },
      }
    });

    logger.info(`Maintenance Log added by Technician ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'MAINTENANCE',
      entityId: newLog.id,
      details: `چاککردنەوەیەکی نوێ تۆمارکرا بۆ ئامێری: ${newLog.deviceType || 'نەزانراو'}`,
      req
    });

    return sendSuccess(res, 201, 'Maintenance log created successfully', newLog);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a maintenance log
 * @route   PUT /api/maintenance/:id
 * @access  Private (Admin or IT Staff)
 */
const updateMaintenanceLog = async (req, res, next) => {
  try {
    const logId = parseInt(req.params.id);
    const data = req.body;

    const existingLog = await prisma.maintenance.findUnique({ where: { id: logId } });
    if (!existingLog) return sendError(res, 404, 'Maintenance log not found.');

    if (req.user.role !== 'ADMIN' && existingLog.technicianId !== req.user.id) {
      return sendError(res, 403, 'You do not have permission to edit someone else\'s maintenance log.');
    }

    const updateData = {};
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId ? parseInt(data.departmentId) : null;
    if (data.roomId !== undefined) updateData.roomId = data.roomId ? parseInt(data.roomId) : null;
    if (data.maintenanceTask !== undefined) updateData.maintenanceTask = data.maintenanceTask;
    if (data.requesterName !== undefined) updateData.requesterName = data.requesterName;
    if (data.deviceType !== undefined) updateData.deviceType = data.deviceType;
    if (data.deviceBrandModel !== undefined) updateData.deviceBrandModel = data.deviceBrandModel;
    if (data.deviceSerialNumber !== undefined) updateData.deviceSerialNumber = data.deviceSerialNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.visitDate) updateData.visitDate = new Date(data.visitDate);
    
    if (req.file) {
      const serverUrl = `${req.protocol}://${req.get('host')}`;
      updateData.documentUrl = `${serverUrl}/uploads/${req.file.filename}`;
    }

    const updatedLog = await prisma.maintenance.update({
      where: { id: logId },
      data: updateData,
      include: {
        department: { select: { name: true } },
        room: { select: { name: true } },
        technician: { select: { name: true, username: true } },
      }
    });

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'MAINTENANCE',
      entityId: updatedLog.id,
      details: `گۆڕانکاری لە چاککردنەوەیەک کرا: ${updatedLog.deviceType || 'نەزانراو'}`,
      req
    });

    return sendSuccess(res, 200, 'Maintenance log updated successfully', updatedLog);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a maintenance log
 * @route   DELETE /api/maintenance/:id
 * @access  Private (Admin only)
 */
const deleteMaintenanceLog = async (req, res, next) => {
  try {
    const logId = parseInt(req.params.id);

    const existingLog = await prisma.maintenance.findUnique({ where: { id: logId } });
    if (!existingLog) return sendError(res, 404, 'Maintenance log not found.');

    await prisma.maintenance.delete({ where: { id: logId } });

    logger.info(`Maintenance log ${logId} deleted by Admin ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'MAINTENANCE',
      entityId: logId,
      details: `چاککردنەوەیەک سڕایەوە (ID: ${logId})`,
      req
    });

    return sendSuccess(res, 200, 'Maintenance log deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog
};
