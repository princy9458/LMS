const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - attempt to find .env or .env.local
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'student' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'Admin@123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected.');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      
      if (existingAdmin.role !== 'admin') {
        console.log('Updating role to admin...');
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Role updated.');
      }
    } else {
      console.log('--- Initializing System: Creating Default Admin ---');
      await User.create({
        name: 'LMS Administrator',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // Hooks will hash this
        role: 'admin'
      });
      console.log('--- Admin User Created Successfully ---');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
