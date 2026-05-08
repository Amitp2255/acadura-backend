const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@acadura.com';
    const password = 'Acadura@2024';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({ email, password });
    await admin.save();

    console.log('Admin seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
