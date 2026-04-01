const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use the connection string provided in your db.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';

const ADMIN_EMAIL = 'admin@lms.com';
const NEW_PASSWORD = 'Admin@123';

async function resetPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected.');

    // Define a minimal User schema for this operation
    // We don't use the model import to avoid potential dependency/path issues in a standalone script
    const UserSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: false },
      role: String
    });

    // Check if model already exists
    const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

    console.log(`Searching for Admin: ${ADMIN_EMAIL}...`);
    const user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      console.log('Error: Admin user not found in the database. Please check the email.');
      process.exit(1);
    }

    console.log('User found. Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    console.log('Updating password in database...');
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, role: 'admin' } }
    );

    console.log('\nSUCCESS! Admin password has been reset to: Admin@123');
    console.log('You can now log in at /admin/login');

    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
  }
}

resetPassword();
