const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings (public)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'global' });

    // Create default if not exists
    if (!settings) {
      settings = await SiteSettings.create({
        key: 'global',
        socialLinks: {
          instagram: '',
          linkedin: '',
          twitter: '',
          youtube: '',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings',
    });
  }
};

// @desc    Update site settings (admin)
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const { socialLinks } = req.body;

    let settings = await SiteSettings.findOne({ key: 'global' });

    if (!settings) {
      settings = await SiteSettings.create({
        key: 'global',
        socialLinks: socialLinks || {},
      });
    } else {
      if (socialLinks) {
        settings.socialLinks = {
          ...settings.socialLinks.toObject(),
          ...socialLinks,
        };
      }
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings',
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
