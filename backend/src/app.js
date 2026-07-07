const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/error.middleware');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const departmentRoutes = require('./routes/department.routes');
const deviceRoutes = require('./routes/device.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const employeeRoutes = require('./routes/employee.routes');
const backupRoutes = require('./routes/backup.routes');
const settingRoutes = require('./routes/setting.routes');
const activityRoutes = require('./routes/activity.routes');

// Initialize Express App
const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow frontend on different port to load images
})); // Secures HTTP headers
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})); // Allows frontend to communicate with backend
app.use(globalLimiter); // Apply DDoS protection to all routes

// Parsing Middlewares
app.use(express.json({ limit: '10mb' })); // Parse incoming JSON requests with increased size for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies securely

// Static File Serving
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Optimization Middlewares
app.use(compression()); // Compress responses to make them faster

// Logging Middleware
app.use(morgan('dev')); // Logs API requests in the terminal (e.g., GET /api/users 200)

// Basic Test Route
app.get('/api/status', (req, res) => {
  res.json({ message: 'Government IT Asset Management API is running normally.' });
});

// Define API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/activities', activityRoutes);

// 404 Route Not Found
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler Middleware
// Must be the very last middleware
app.use(errorHandler);

module.exports = app;
