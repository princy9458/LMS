const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';
const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'Admin@123';

if (!MONGODB_URI) {
  console.error('[SEED] Missing MONGODB_URI environment variable.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'student' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME, serverSelectionTimeoutMS: 5000 });
    console.log('[SEED] Connected.');

    const admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (!admin) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.create({
        name: 'LMS Administrator',
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'admin',
      });
      console.log('[SEED] Admin user created.');
    } else {
      let updated = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }

      const isMatch = await bcrypt.compare(ADMIN_PASSWORD, admin.password || '');
      if (!isMatch) {
        admin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        updated = true;
      }

      if (updated) {
        await admin.save();
        console.log('[SEED] Admin user updated.');
      } else {
        console.log('[SEED] Admin user already up to date.');
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
