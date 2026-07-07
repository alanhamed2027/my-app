const { sendSuccess, sendError } = require('../utils/response.util');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Backup MySQL Database
 * @route   POST /api/backup
 * @access  Private (Admin Only)
 */
const createBackup = (req, res, next) => {
  try {
    // Ensure backups directory exists
    const backupDir = path.join(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const date = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const fileName = `backup-${date}.sql`;
    const filePath = path.join(backupDir, fileName);

    // Get DB credentials from env (mysql://USER:PASSWORD@HOST:PORT/DB_NAME)
    const dbUrl = process.env.DATABASE_URL;
    const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)/;
    const match = dbUrl.match(regex);

    if (!match) {
      return sendError(res, 500, 'Could not parse database URL for backup.');
    }

    const [, user, password, host, port, dbName] = match;

    // Hardcoded XAMPP path for mysqldump, or fallback to global
    const xamppPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
    const mysqldump = fs.existsSync(xamppPath) ? `"${xamppPath}"` : 'mysqldump';

    // Build mysqldump command
    const passFlag = password ? `-p${password}` : '';
    const dumpCmd = `${mysqldump} -h ${host} -P ${port} -u ${user} ${passFlag} ${dbName} > "${filePath}"`;

    exec(dumpCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup Error:', error);
        return sendError(res, 500, 'Database backup failed. Is mysqldump installed?');
      }

      // Instead of just saying success, let's stream the file back for download!
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error downloading backup file:", err);
        }
        // Optional: delete file after download to save space
        // fs.unlinkSync(filePath); 
      });
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore MySQL Database
 * @route   POST /api/backup/restore
 * @access  Private (Admin Only)
 */
const restoreBackup = (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload a .sql file');
    }

    const filePath = req.file.path;

    // Get DB credentials from env
    const dbUrl = process.env.DATABASE_URL;
    const regex = /mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)/;
    const match = dbUrl.match(regex);

    if (!match) {
      fs.unlinkSync(filePath);
      return sendError(res, 500, 'Could not parse database URL for restore.');
    }

    const [, user, password, host, port, dbName] = match;

    // Hardcoded XAMPP path for mysql, or fallback to global
    const xamppPath = 'C:\\xampp\\mysql\\bin\\mysql.exe';
    const mysql = fs.existsSync(xamppPath) ? `"${xamppPath}"` : 'mysql';

    // Build mysql command
    const passFlag = password ? `-p${password}` : '';
    const restoreCmd = `${mysql} -h ${host} -P ${port} -u ${user} ${passFlag} ${dbName} < "${filePath}"`;

    exec(restoreCmd, (error, stdout, stderr) => {
      // Clean up the uploaded file after execution
      fs.unlinkSync(filePath);

      if (error) {
        console.error('Restore Error:', error);
        return sendError(res, 500, 'Database restore failed.');
      }

      return sendSuccess(res, 200, 'Database restored successfully');
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(error);
  }
};

/**
 * @desc    Get list of all backups
 * @route   GET /api/backup
 * @access  Private (Admin Only)
 */
const getBackupsList = (req, res, next) => {
  try {
    const backupDir = path.join(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
      return sendSuccess(res, 200, 'No backups found', []);
    }

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
    const backups = files.map(file => {
      const stats = fs.statSync(path.join(backupDir, file));
      return {
        fileName: file,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    return sendSuccess(res, 200, 'Backups retrieved successfully', backups);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBackup,
  restoreBackup,
  getBackupsList
};
