const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, 200, 'Employees retrieved successfully', employees);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllEmployees };
