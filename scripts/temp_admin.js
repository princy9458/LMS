const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'Admin@123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';

async function test() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected.');

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: { type: String, select: false },
      role: { type: String, default: 'student' }
    });

    const User = mongoose.model('UserTest', UserSchema, 'users');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { name: 'Default Admin', password: hashedPassword, role: 'admin' },
      { upsert: true, new: true }
    );

    console.log('Admin user ensured.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
