const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { createBackup, restoreBackup, getBackupsList } = require('../controllers/backup.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Configure multer for file uploads (temporary storage)
const uploadDir = path.join(__dirname, '../../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'restore-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
router.use(protect);
router.use(authorize('ADMIN')); // VERY IMPORTANT: Only Admin can touch backups

router.get('/', getBackupsList);
router.get('/export', createBackup); // Changed to GET so we can trigger a direct download in browser
router.post('/restore', upload.single('backupFile'), restoreBackup);

module.exports = router;
