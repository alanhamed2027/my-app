require('dotenv').config();
const http = require('http');
const app = require('./app');

// Determine the port from environment variables, or default to 5000
const PORT = process.env.PORT || 5000;

// Create the HTTP server using our Express app
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log('==================================================');
  console.log(`🚀 Government IT Asset Management Server Started!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api/status`);
  console.log('==================================================');
});

// Handle unhandled Promise rejections (safety net to prevent server crashes)
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
