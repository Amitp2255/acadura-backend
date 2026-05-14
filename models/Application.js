const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    interestedCourses: [{
      type: String,
      trim: true,
    }],
    isAcaduraRecommendation: {
      type: Boolean,
      default: false,
    },
    preferredStates: [{
      type: String,
      trim: true,
    }],
    preferredDistricts: [{
      type: String,
      trim: true,
    }],
    interestedColleges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    }],
    selectedCourses: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['new', 'contacted', 'enrolled', 'closed'],
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching leads
applicationSchema.index({ name: 'text', email: 'text', phone: 'text' });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
