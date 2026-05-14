const Application = require('../models/Application');
const College = require('../models/College');

// @desc    Submit application (public lead form)
// @route   POST /api/applications
// @access  Public
const createApplication = async (req, res) => {
  try {
    const { 
      name, phone, email, 
      interestedCourses, 
      isAcaduraRecommendation, 
      preferredStates, 
      preferredDistricts, 
      interestedColleges,
      selectedCourses,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required basic fields (name, phone, email)',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    // Basic phone validation (10 digits)
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number',
      });
    }

    // If interestedColleges provided, verify they exist
    if (interestedColleges && interestedColleges.length > 0) {
      const collegesExist = await College.find({ _id: { $in: interestedColleges } });
      if (collegesExist.length !== interestedColleges.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected colleges not found',
        });
      }
    }

    const application = await Application.create({
      name,
      phone,
      email,
      interestedCourses: interestedCourses || [],
      isAcaduraRecommendation: isAcaduraRecommendation || false,
      preferredStates: preferredStates || [],
      preferredDistricts: preferredDistricts || [],
      interestedColleges: interestedColleges || [],
      selectedCourses: selectedCourses || [],
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will contact you soon.',
      data: application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application',
    });
  }
};

// @desc    Get all applications (leads)
// @route   GET /api/applications
// @access  Private (Admin)
const getApplications = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    let query = {};

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('interestedColleges', 'name location')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications',
    });
  }
};

// @desc    Update application status / notes
// @route   PUT /api/applications/:id
// @access  Private (Admin)
const ALLOWED_STATUSES = ['new', 'contacted', 'enrolled', 'closed'];

const updateApplication = async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Validate status if provided
    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    // Build update object — only include fields actually sent
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update. Provide "status" and/or "notes".',
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('interestedColleges', 'name location');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Update application error:', error);

    // Return Mongoose validation errors with 400 so frontend can show them
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid application ID' });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating application',
    });
  }
};

// @desc    Get analytics stats
// @route   GET /api/analytics/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalColleges = await College.countDocuments({ isActive: true });
    const totalLeads = await Application.countDocuments();
    const newLeads = await Application.countDocuments({ status: 'new' });
    const contactedLeads = await Application.countDocuments({ status: 'contacted' });
    const enrolledLeads = await Application.countDocuments({ status: 'enrolled' });
    const closedLeads = await Application.countDocuments({ status: 'closed' });

    // Leads per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leadsPerDay = await Application.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top colleges by applications
    const topColleges = await Application.aggregate([
      { $unwind: { path: '$interestedColleges', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: '$interestedColleges',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'colleges',
          localField: '_id',
          foreignField: '_id',
          as: 'collegeInfo',
        },
      },
      { $unwind: '$collegeInfo' },
      {
        $project: {
          name: '$collegeInfo.name',
          count: 1,
        },
      },
    ]);

    // Recent leads (last 10)
    const recentLeads = await Application.find()
      .populate('interestedColleges', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Conversion rate
    const conversionRate = totalLeads > 0
      ? ((enrolledLeads / totalLeads) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalColleges,
          totalLeads,
          newLeads,
          contactedLeads,
          enrolledLeads,
          closedLeads,
          conversionRate: Number(conversionRate),
        },
        leadsPerDay,
        topColleges,
        recentLeads,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
    });
  }
};

module.exports = {
  createApplication,
  getApplications,
  updateApplication,
  getStats,
};
