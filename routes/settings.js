const express = require('express');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route
router.get('/', getSettings);

// Protected route (Admin only)
router.put('/', protect, updateSettings);

module.exports = router;
