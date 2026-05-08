const College = require('../models/College');

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    const { search, state, course, minFees, maxFees, minPlacement, sort } = req.query;

    let query = { isActive: true };

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by state
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    // Filter by course
    if (course) {
      query['courses.name'] = { $regex: course, $options: 'i' };
    }

    // Filter by fees range
    if (minFees || maxFees) {
      query['fees.min'] = {};
      if (minFees) query['fees.min'].$gte = Number(minFees);
      if (maxFees) query['fees.max'] = { $lte: Number(maxFees) };
    }

    // Filter by minimum placement percentage
    if (minPlacement) {
      query['placement.percentage'] = { $gte: Number(minPlacement) };
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'placement') sortOption = { 'placement.percentage': -1 };
    if (sort === 'fees-low') sortOption = { 'fees.min': 1 };
    if (sort === 'fees-high') sortOption = { 'fees.max': -1 };
    if (sort === 'package') sortOption = { 'placement.averagePackage': -1 };

    const colleges = await College.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: colleges.length,
      data: colleges,
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching colleges',
    });
  }
};

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Public
const getCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error('Get college error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching college',
    });
  }
};

// @desc    Create college
// @route   POST /api/colleges
// @access  Private (Admin)
const createCollege = async (req, res) => {
  try {
    const college = await College.create(req.body);

    res.status(201).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error('Create college error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A college with this name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating college',
    });
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private (Admin)
const updateCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating college',
    });
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private (Admin)
const deleteCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'College deleted successfully',
    });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting college',
    });
  }
};

module.exports = {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
};
