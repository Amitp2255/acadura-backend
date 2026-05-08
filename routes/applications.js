const express = require('express');
const {
  createApplication,
  getApplications,
  updateApplication,
  getStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route — submit application
router.post('/', createApplication);

// Protected routes (Admin only)
router.get('/', protect, getApplications);
router.put('/:id', protect, updateApplication);

// Analytics
router.get('/stats', protect, getStats);

module.exports = router;
