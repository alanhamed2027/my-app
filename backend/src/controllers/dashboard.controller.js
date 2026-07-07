const prisma = require('../config/db');
const { sendSuccess } = require('../utils/response.util');

/**
 * @desc    Get dashboard statistics for the frontend charts
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const systemType = req.headers['x-system-type'] === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

    // 1. Total counts
    const totalDevicesCount = await prisma.device.count({ where: { systemType } });
    const totalUsersCount = await prisma.user.count(); // Users are shared
    const totalDepartmentsCount = await prisma.department.count({ where: { systemType } });
    const totalMaintenanceCount = await prisma.maintenance.count({ where: { systemType } });

    // 2. Devices by Status (Active, Broken, etc.)
    const devicesByStatusRaw = await prisma.device.groupBy({
      by: ['status'],
      where: { systemType },
      _count: { status: true }
    });
    const devicesByStatus = devicesByStatusRaw.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {});

    // 3. Devices by Category (PC, Printer, etc.)
    const devicesByCategoryRaw = await prisma.device.groupBy({
      by: ['categoryId'],
      where: { systemType },
      _count: { categoryId: true }
    });
    
    const categories = await prisma.deviceCategory.findMany();
    const devicesByCategory = devicesByCategoryRaw.map(item => {
      const category = categories.find(c => c.id === item.categoryId);
      return {
        name: category ? category.name : 'Unknown',
        count: item._count.categoryId
      };
    });

    // 4. Recent Maintenance Activities (Last 5)
    const recentMaintenance = await prisma.maintenance.findMany({
      where: { systemType },
      take: 5,
      orderBy: { visitDate: 'desc' },
      include: {
        technician: { select: { name: true } }
      }
    });

    // 5. Recent Added Devices (Last 5)
    const recentDevices = await prisma.device.findMany({
      where: { systemType },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } }
    });

    return sendSuccess(res, 200, 'Dashboard stats retrieved', {
      totals: {
        devices: totalDevicesCount,
        users: totalUsersCount,
        departments: totalDepartmentsCount,
        maintenance: totalMaintenanceCount
      },
      devicesByStatus,
      devicesByCategory,
      recentMaintenance,
      recentDevices
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
