const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the "uploads" directory exists before saving files
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Configure Storage: Where to save files and what to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: <timestamp>-<original-name>
    // This prevents files with the same name from overwriting each other
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// 2. Configure File Filter: Decide which file types are allowed
const fileFilter = (req, file, cb) => {
  // Define allowed MIME types (Images, PDF, Word, Excel, ZIP)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-excel', // XLS
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // File type is allowed!
    cb(null, true);
  } else {
    // File type is NOT allowed, reject it with an error
    cb(new Error('Invalid file type! Only Images, PDFs, Word, Excel, and ZIP files are allowed.'), false);
  }
};

// 3. Create the Multer upload middleware instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Limit file size to 10 Megabytes (10 * 1024 * 1024 bytes) to prevent server overload
    fileSize: 10 * 1024 * 1024 
  }
});

module.exports = upload;
