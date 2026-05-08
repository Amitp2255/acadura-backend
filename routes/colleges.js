const express = require('express');
const {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
} = require('../controllers/collegeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getColleges);
router.get('/:id', getCollege);

// Protected routes (Admin only)
router.post('/', protect, createCollege);
router.put('/:id', protect, updateCollege);
router.delete('/:id', protect, deleteCollege);

module.exports = router;
