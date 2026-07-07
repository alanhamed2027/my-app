const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../config/logger');
const { logActivity } = require('../services/logger.service');

// ==========================================
// DEPARTMENTS
// ==========================================

/**
 * @desc    Get all departments (with their rooms)
 * @route   GET /api/departments
 * @access  Private
 */
const getAllDepartments = async (req, res, next) => {
  try {
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';
    const departments = await prisma.department.findMany({
      where: { systemType },
      include: {
        rooms: {
          include: {
            devices: {
              include: { category: true }
            }
          }
        },
        devices: {
          where: { roomId: null },
          include: { category: true }
        },
        _count: {
          select: { devices: true, employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Fetch maintenance counts in a single query
    const maintenanceCounts = await prisma.maintenance.groupBy({
      by: ['deviceSerialNumber'],
      _count: { deviceSerialNumber: true }
    });

    const countMap = {};
    maintenanceCounts.forEach(m => {
      if (m.deviceSerialNumber) {
        countMap[m.deviceSerialNumber] = m._count.deviceSerialNumber;
      }
    });

    // Inject maintenanceCount into devices
    departments.forEach(dept => {
      dept.rooms?.forEach(room => {
        room.devices?.forEach(device => {
          device.maintenanceCount = countMap[device.serialNumber] || 0;
        });
      });
      dept.devices?.forEach(device => {
        device.maintenanceCount = countMap[device.serialNumber] || 0;
      });
    });

    return sendSuccess(res, 200, 'Departments retrieved successfully', departments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private (Admin or IT Staff)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, rooms } = req.body;

    const existingDept = await prisma.department.findUnique({ where: { name } });
    if (existingDept) {
      return sendError(res, 400, 'A department with this name already exists.');
    }

    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    const createData = { name, systemType };
    
    // If rooms are provided, create them along with the department
    if (rooms && Array.isArray(rooms) && rooms.length > 0) {
      createData.rooms = {
        create: rooms.map(r => ({ 
          name: r.name, 
          floor: r.floor || null, 
          building: r.building || null,
          systemType 
        }))
      };
    }

    const newDept = await prisma.department.create({
      data: createData,
      include: {
        rooms: true,
        _count: { select: { devices: true, employees: true } }
      }
    });

    logger.info(`Department '${name}' created by User ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'DEPARTMENT',
      entityId: newDept.id,
      details: `بەشێکی نوێ دروستکرا: ${newDept.name}`,
      req
    });

    return sendSuccess(res, 201, 'Department created successfully', newDept);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a department
 * @route   PUT /api/departments/:id
 * @access  Private (Admin or IT Staff)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const deptId = parseInt(req.params.id);
    const { name, rooms } = req.body;

    const existingDept = await prisma.department.findUnique({ where: { id: deptId } });
    if (!existingDept) {
      return sendError(res, 404, 'Department not found');
    }

    // Ensure the new name doesn't clash with another department
    if (name && name !== existingDept.name) {
      const nameConflict = await prisma.department.findUnique({ where: { name } });
      if (nameConflict) {
        return sendError(res, 400, 'A department with this name already exists.');
      }
    }

    // If rooms array is provided, we sync the rooms state
    if (rooms && Array.isArray(rooms)) {
      const existingRooms = await prisma.room.findMany({ where: { departmentId: deptId } });
      const existingRoomIds = existingRooms.map(r => r.id);
      
      const newRoomIds = rooms.filter(r => r.id).map(r => r.id);
      const roomsToDelete = existingRoomIds.filter(id => !newRoomIds.includes(id));
      
      // Delete removed rooms
      if (roomsToDelete.length > 0) {
        await prisma.room.deleteMany({ where: { id: { in: roomsToDelete } } });
      }
      
      // Create or update current rooms
      for (const r of rooms) {
        if (r.name && r.name.trim() !== '') {
          if (r.id) {
            await prisma.room.update({
              where: { id: r.id },
              data: { name: r.name, floor: r.floor || null, building: r.building || null }
            });
          } else {
            await prisma.room.create({
              data: { 
                name: r.name, 
                floor: r.floor || null, 
                building: r.building || null, 
                departmentId: deptId,
                systemType: existingDept.systemType
              }
            });
          }
        }
      }
    }

    const updatedDept = await prisma.department.update({
      where: { id: deptId },
      data: { name: name || existingDept.name },
      include: {
        rooms: true,
        _count: { select: { devices: true, employees: true } }
      }
    });

    logger.info(`Department ID: ${deptId} updated by User ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'DEPARTMENT',
      entityId: updatedDept.id,
      details: `گۆڕانکاری لە بەشێک کرا: ${updatedDept.name}`,
      req
    });

    return sendSuccess(res, 200, 'Department updated successfully', updatedDept);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a department
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin only)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const deptId = parseInt(req.params.id);

    // Because of "onDelete: Cascade" in schema, deleting a department will ALSO delete all its rooms automatically!
    await prisma.department.delete({
      where: { id: deptId }
    });

    logger.warn(`Department ID: ${deptId} DELETED by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'DEPARTMENT',
      entityId: deptId,
      details: `بەشێک سڕایەوە (ID: ${deptId})`,
      req
    });

    return sendSuccess(res, 200, 'Department and its rooms deleted successfully');
  } catch (error) {
    next(error);
  }
};


// ==========================================
// ROOMS
// ==========================================

/**
 * @desc    Get all rooms (or filter by departmentId via query)
 * @route   GET /api/rooms
 * @access  Private
 */
const getAllRooms = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';
    
    let whereClause = { systemType };
    if (departmentId) whereClause.departmentId = parseInt(departmentId);

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        department: { select: { name: true } }, // Show the department name instead of just the ID
        _count: { select: { devices: true } } // Show how many devices are in this room
      },
      orderBy: { name: 'asc' }
    });

    return sendSuccess(res, 200, 'Rooms retrieved successfully', rooms);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room in a department
 * @route   POST /api/rooms
 * @access  Private (Admin or IT Staff)
 */
const createRoom = async (req, res, next) => {
  try {
    const { name, floor, building, notes, departmentId } = req.body;

    // Verify the department actually exists before putting a room in it
    const deptExists = await prisma.department.findUnique({ where: { id: parseInt(departmentId) } });
    if (!deptExists) {
      return sendError(res, 404, 'The specified department does not exist.');
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        floor,
        building,
        notes,
        departmentId: parseInt(departmentId),
        systemType: deptExists.systemType
      }
    });

    logger.info(`Room '${name}' created in Dept ID: ${departmentId} by User ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'ROOM',
      entityId: newRoom.id,
      details: `ژوورێکی نوێ دروستکرا: ${newRoom.name} لە بەشی ID: ${departmentId}`,
      req
    });

    return sendSuccess(res, 201, 'Room created successfully', newRoom);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private (Admin only)
 */
const deleteRoom = async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.id);

    await prisma.room.delete({
      where: { id: roomId }
    });

    logger.warn(`Room ID: ${roomId} DELETED by Admin ID: ${req.user.id}`);
    
    await logActivity({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'ROOM',
      entityId: roomId,
      details: `ژوورێک سڕایەوە (ID: ${roomId})`,
      req
    });

    return sendSuccess(res, 200, 'Room deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Departments
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  
  // Rooms
  getAllRooms,
  createRoom,
  deleteRoom
};
