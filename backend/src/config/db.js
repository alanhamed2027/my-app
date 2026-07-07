const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// We declare a global variable to hold our Prisma connection.
// This is necessary because in development mode (using nodemon), 
// the server constantly restarts when you save a file.
// If we don't use a global variable, it will create thousands of 
// "zombie" connections to MySQL and crash the database.
const globalForPrisma = global;

// Initialize Prisma. 
// If it already exists in the global object, use that one.
// Otherwise, create a new one.
const prisma = globalForPrisma.prisma || new PrismaClient({
  // Log database queries in development to help with debugging
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// If we are NOT in production (i.e., we are developing), 
// save the connection to the global object so it survives server restarts.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log when the database connection is successfully established
prisma.$connect()
  .then(() => {
    logger.info('✅ Successfully connected to the MySQL Database via Prisma.');
  })
  .catch((error) => {
    logger.error('❌ Failed to connect to the MySQL Database!', error);
  });

module.exports = prisma;
