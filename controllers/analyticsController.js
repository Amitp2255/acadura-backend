const College = require('../models/College');
const Application = require('../models/Application');

const getStats = async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const totalLeads = await Application.countDocuments();
    const newLeads = await Application.countDocuments({ status: 'new' });
    const contactedLeads = await Application.countDocuments({ status: 'contacted' });
    const enrolledLeads = await Application.countDocuments({ status: 'enrolled' });
    const closedLeads = await Application.countDocuments({ status: 'closed' });
    
    let conversionRate = 0;
    if (totalLeads > 0) {
      conversionRate = ((enrolledLeads / totalLeads) * 100).toFixed(1);
    }

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
          conversionRate,
        },
        leadsPerDay: [],
        topColleges: [],
        recentLeads: await Application.find().sort({ createdAt: -1 }).limit(5).populate('interestedColleges', 'name'),
      }
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
  getStats,
};
