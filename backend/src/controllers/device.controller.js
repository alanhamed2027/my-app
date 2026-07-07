const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../config/logger');
const { logActivity } = require('../services/logger.service');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get all devices (with advanced filtering & pagination)
 * @route   GET /api/devices
 * @access  Private
 */
const getAllDevices = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      categoryId, 
      departmentId, 
      roomId,
      status,
      isExternal
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    // Build the dynamic WHERE clause based on filters provided by the frontend
    let whereClause = { systemType };

    if (search) {
      whereClause.OR = [
        { assetNumber: { contains: search } },
        { serialNumber: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ];
    }
    
    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    if (departmentId) whereClause.departmentId = parseInt(departmentId);
    if (roomId) whereClause.roomId = parseInt(roomId);
    if (status) whereClause.status = status;

    // Run two queries at the same time: one to get the data, one to get the total count for pagination
    const [devices, totalItems] = await prisma.$transaction([
      prisma.device.findMany({
        where: whereClause,
        include: {
          category: { select: { name: true } },
          department: { select: { name: true } },
          room: { select: { name: true, floor: true } },
          assignedTo: { select: { name: true } }
        },
        skip,
        take,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.device.count({ where: whereClause })
    ]);

    // Attach maintenance count manually since there is no foreign key relation
    const devicesWithCount = await Promise.all(devices.map(async (device) => {
      const count = device.serialNumber 
        ? await prisma.maintenance.count({ where: { deviceSerialNumber: device.serialNumber } })
        : 0;
      return { ...device, maintenanceCount: count };
    }));

    const totalPages = Math.ceil(totalItems / take);

    return sendSuccess(res, 200, 'Devices retrieved successfully', devicesWithCount, {
      totalItems,
      totalPages,
      currentPage: parseInt(page),
      limit: take
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single device by ID
 * @route   GET /api/devices/:id
 * @access  Private
 */
const getDeviceById = async (req, res, next) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        department: true,
        room: true,
        assignedTo: true,
        maintenanceLogs: {
          orderBy: { visitDate: 'desc' },
          take: 5 // Only show the 5 most recent maintenance logs
        },
        attachments: true
      }
    });

    if (!device) return sendError(res, 404, 'Device not found');

    return sendSuccess(res, 200, 'Device retrieved successfully', device);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new device (Asset)
 * @route   POST /api/devices
 * @access  Private (Admin or IT Staff)
 */
const createDevice = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.assetNumber || data.assetNumber.trim() === '') {
      data.assetNumber = `AUTO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    // Check if asset number already exists
    const existingAsset = await prisma.device.findUnique({ where: { assetNumber: data.assetNumber } });
    if (existingAsset) {
      // If there's an uploaded file but the creation fails, we must delete the orphaned file to save space
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, 400, 'Asset Number already exists.');
    }

    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    // Convert string numbers to integers where necessary and convert empty strings to null
    const deviceData = {
      ...data,
      categoryId: parseInt(data.categoryId),
      departmentId: data.departmentId ? parseInt(data.departmentId) : null,
      roomId: data.roomId ? parseInt(data.roomId) : null,
      employeeId: data.employeeId ? parseInt(data.employeeId) : null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      warrantyExpire: data.warrantyExpire ? new Date(data.warrantyExpire) : null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null, // Save the path if an image was uploaded
      systemType
    };


    // Clean up empty strings to null to prevent Unique Constraint errors
    Object.keys(deviceData).forEach(key => {
      if (deviceData[key] === '') {
        deviceData[key] = null;
      }
    });

    const newDevice = await prisma.device.create({
      data: deviceData
    });

    logger.info(`New Device added: ${newDevice.assetNumber} by User ID: ${req.user.id}`);
    
    // Log Activity
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'DEVICE',
      entityId: newDevice.id,
      details: `ئامێرێکی نوێ تۆمارکرا: ${newDevice.brand || ''} ${newDevice.model || ''}`,
      req
    });

    return sendSuccess(res, 201, 'Device created successfully', newDevice);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file on error
    next(error);
  }
};

/**
 * @desc    Update a device
 * @route   PUT /api/devices/:id
 * @access  Private (Admin or IT Staff)
 */
const updateDevice = async (req, res, next) => {
  try {
    const deviceId = parseInt(req.params.id);
    const data = req.body;

    const existingDevice = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!existingDevice) {
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, 404, 'Device not found');
    }

    const updateData = {
      ...data,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
      roomId: data.roomId ? parseInt(data.roomId) : undefined,
      employeeId: data.employeeId ? parseInt(data.employeeId) : undefined,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyExpire: data.warrantyExpire ? new Date(data.warrantyExpire) : undefined,
    };


    // Handle new image upload (replace the old one)
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
      // Delete the old image from the server to save space!
      if (existingDevice.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', existingDevice.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: updateData
    });

    logger.info(`Device ${deviceId} updated by User ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'DEVICE',
      entityId: updatedDevice.id,
      details: `زانیاریەکانی ئامێرێک نوێکرایەوە: ${updatedDevice.brand || ''} ${updatedDevice.model || ''}`,
      req
    });

    return sendSuccess(res, 200, 'Device updated successfully', updatedDevice);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

/**
 * @desc    Delete a device
 * @route   DELETE /api/devices/:id
 * @access  Private (Admin only)
 */
const deleteDevice = async (req, res, next) => {
  try {
    const deviceId = parseInt(req.params.id);

    const existingDevice = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!existingDevice) return sendError(res, 404, 'Device not found');

    // Delete the associated image file from the server
    if (existingDevice.imageUrl) {
      const imagePath = path.join(__dirname, '../../', existingDevice.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.device.delete({
      where: { id: deviceId }
    });

    logger.warn(`Device ${deviceId} DELETED by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'DEVICE',
      entityId: deviceId,
      details: `ئامێرێک سڕایەوە (ID: ${deviceId})`,
      req
    });

    return sendSuccess(res, 200, 'Device deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Transfer a device to a new department/room/employee
 * @route   PUT /api/devices/:id/transfer
 * @access  Private (Admin/IT_Staff)
 */
const transferDevice = async (req, res, next) => {
  try {
    const deviceId = parseInt(req.params.id);
    const { departmentId, roomId, employeeId, reason } = req.body;

    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        department: true,
        room: true,
        category: true
      }
    });

    if (!existingDevice) return sendError(res, 404, 'Device not found');

    // Fetch the new locations for the activity log string
    let newDeptName = 'نەزانراو';
    let newRoomName = 'نەزانراو';

    if (departmentId) {
      const d = await prisma.department.findUnique({ where: { id: parseInt(departmentId) } });
      if (d) newDeptName = d.name;
    }
    if (roomId) {
      const r = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
      if (r) newRoomName = r.name;
    }

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        departmentId: departmentId ? parseInt(departmentId) : null,
        roomId: roomId ? parseInt(roomId) : null,
        employeeId: employeeId ? parseInt(employeeId) : null,
      }
    });

    const oldLocation = `(${existingDevice.department?.name || 'نەزانراو'} - ${existingDevice.room?.name || 'نەزانراو'})`;
    const newLocation = `(${newDeptName} - ${newRoomName})`;
    const deviceStr = `${existingDevice.category?.name || 'ئامێر'} (${existingDevice.brand || ''} ${existingDevice.model || ''})`;
    const details = `ئامێری ${deviceStr} گوازرایەوە لە ${oldLocation} بۆ ${newLocation}. هۆکار: ${reason || 'بەبێ هۆکار'}`;

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'DEVICE',
      entityId: deviceId,
      details: details,
      req
    });

    return sendSuccess(res, 200, 'Device transferred successfully', updatedDevice);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DEVICE CATEGORIES
// ==========================================

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.deviceCategory.findMany({
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return sendError(res, 400, 'Category name is required');
    
    // Check if it already exists
    const existing = await prisma.deviceCategory.findUnique({ where: { name } });
    if (existing) {
      return sendSuccess(res, 200, 'Category already exists', existing);
    }
    
    const newCategory = await prisma.deviceCategory.create({
      data: { name }
    });
    return sendSuccess(res, 201, 'Category created', newCategory);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    // Check if category exists
    const existing = await prisma.deviceCategory.findUnique({ where: { id: categoryId } });
    if (!existing) return sendError(res, 404, 'Category not found');

    // Check if there are devices using this category
    const devicesCount = await prisma.device.count({ where: { categoryId } });
    if (devicesCount > 0) {
      return sendError(res, 400, 'سڕینەوە سەرکەوتوو نەبوو، چونکە ئامێر تۆمارکراوە لەسەر ئەم جۆرە.');
    }

    await prisma.deviceCategory.delete({
      where: { id: categoryId }
    });

    return sendSuccess(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  transferDevice,
  getAllCategories,
  createCategory,
  deleteCategory
};
