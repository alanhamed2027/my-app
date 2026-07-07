const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

// Create transports (where the logs will be saved)
const transports = [
  // 1. Console Transport (Shows logs in the terminal while developing)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),

  // 2. Error Log Transport (Saves only ERROR level logs)
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d', // Keep logs for 30 days
    zippedArchive: true,
  }),

  // 3. Combined Log Transport (Saves ALL logs: info, warn, error)
  new DailyRotateFile({
    filename: path.join(__dirname, '../../logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    zippedArchive: true,
  }),
];

// Create and export the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports,
});

module.exports = logger;
