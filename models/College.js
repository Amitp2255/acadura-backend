const mongoose = require('mongoose');
const slugify = require('slugify');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    location: {
      city: { type: String, required: true, trim: true },
      district: { type: String, trim: true },
      state: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      mapLink: { type: String, trim: true },
    },
    type: {
      type: String,
      enum: ['Private', 'Government', 'Deemed', 'Autonomous'],
      default: 'Private',
    },
    established: {
      type: Number,
    },
    affiliation: {
      type: String,
      trim: true,
    },
    accreditation: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxLength: 250,
    },
    campusSize: {
      type: String,
      trim: true,
    },
    hostelAvailable: {
      type: Boolean,
      default: false,
    },
    scholarshipsAvailable: {
      type: Boolean,
      default: false,
    },
    highlights: [
      {
        label: String,
        value: String,
      },
    ],
    courses: [
      {
        name: { type: String, required: true },
        category: { type: String, trim: true },
        duration: { type: String, default: '4 Years' },
        fees: { type: String, trim: true, default: '' },
        eligibility: { type: String, trim: true },
      },
    ],
    fees: {
      min: { type: String, trim: true, default: '0' },
      max: { type: String, trim: true, default: '0' },
    },
    placement: {
      percentage: { type: Number, default: 0 },
      averagePackage: { type: Number, default: 0 },
      highestPackage: { type: Number, default: 0 },
      medianPackage: { type: Number, default: 0 },
    },
    recruiters: [
      {
        type: String,
        trim: true,
      },
    ],
    images: {
      thumbnail: { type: String, default: '' },
      banner: { type: String, default: '' },
      logo: { type: String, default: '' },
      gallery: [{ type: String }],
    },
    facilities: [{ type: String }],
    brochureUrl: {
      type: String,
      trim: true,
    },
    faqs: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],
    ranking: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
collegeSchema.pre('save', async function (next) {
  // Only generate slug if name is modified or slug is missing
  if (!this.isModified('name') && this.slug) {
    return next();
  }

  // Create base slug
  const baseSlug = slugify(this.name, {
    lower: true,      // convert to lower case
    strict: true,     // strip special characters except replacement
    trim: true        // trim leading and trailing replacement chars
  });

  let uniqueSlug = baseSlug;
  let isUnique = false;
  let counter = 1;

  // Loop to check and append suffix if duplicate exists
  while (!isUnique) {
    // Check if another document already uses this slug
    const existingCollege = await this.constructor.findOne({
      slug: uniqueSlug,
      _id: { $ne: this._id } // exclude current document
    });

    if (existingCollege) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    } else {
      isUnique = true;
    }
  }

  this.slug = uniqueSlug;
  next();
});

// Index for search and filtering
collegeSchema.index({ name: 'text', 'location.city': 'text', 'location.state': 'text' });
collegeSchema.index({ 'location.state': 1 });
collegeSchema.index({ 'fees.min': 1, 'fees.max': 1 });
collegeSchema.index({ 'placement.percentage': -1 });

module.exports = mongoose.model('College', collegeSchema);
