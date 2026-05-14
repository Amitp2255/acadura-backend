const express = require('express');
const {
  submitQuestion,
  getApprovedQuestions,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', submitQuestion);
router.get('/college/:collegeId', getApprovedQuestions);

// Protected routes (Admin only)
router.get('/', protect, getAllQuestions);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;
