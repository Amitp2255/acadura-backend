const Question = require('../models/Question');

// @desc    Submit a question (public)
// @route   POST /api/questions
// @access  Public
const submitQuestion = async (req, res) => {
  try {
    const { collegeId, userName, question } = req.body;

    if (!collegeId || !userName || !question) {
      return res.status(400).json({
        success: false,
        message: 'College ID, name, and question are required',
      });
    }

    const newQuestion = await Question.create({
      collegeId,
      userName: userName.trim(),
      question: question.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Your question has been submitted! It will appear once approved by the admin.',
      data: newQuestion,
    });
  } catch (error) {
    console.error('Submit question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting question',
    });
  }
};

// @desc    Get approved questions for a college (public)
// @route   GET /api/questions/college/:collegeId
// @access  Public
const getApprovedQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      collegeId: req.params.collegeId,
      status: 'approved',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Get approved questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
    });
  }
};

// @desc    Get all questions (admin)
// @route   GET /api/questions
// @access  Private (Admin)
const getAllQuestions = async (req, res) => {
  try {
    const { status, college, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (college) query.collegeId = college;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('collegeId', 'name location')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: questions,
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions',
    });
  }
};

// @desc    Answer/update a question (admin)
// @route   PUT /api/questions/:id
// @access  Private (Admin)
const updateQuestion = async (req, res) => {
  try {
    const { answer, status } = req.body;

    const updateFields = {};
    if (answer !== undefined) updateFields.answer = answer;
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, approved, or rejected.',
        });
      }
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide answer and/or status to update.',
      });
    }

    // If admin provides an answer, auto-approve
    if (answer && answer.trim() && !status) {
      updateFields.status = 'approved';
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('collegeId', 'name location');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question',
    });
  }
};

// @desc    Delete a question (admin)
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question',
    });
  }
};

module.exports = {
  submitQuestion,
  getApprovedQuestions,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
};
