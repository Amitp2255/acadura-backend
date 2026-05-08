const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['public/uploads/images', 'public/uploads/documents'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'public/uploads/images');
    } else if (file.mimetype === 'application/pdf') {
      cb(null, 'public/uploads/documents');
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const { protect } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload multiple files
router.post('/', protect, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => {
      // Normalize path for frontend (replace backslashes with forward slashes)
      const relativePath = file.path.replace(/\\/g, '/').split('public')[1];
      return relativePath; // Example: /uploads/images/file-123.jpg
    });

    res.json({
      success: true,
      urls: fileUrls
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
