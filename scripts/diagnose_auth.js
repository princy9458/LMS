const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';
const EMAIL = 'admin@lms.com';
const PASSWORD = 'Admin@123';

async function diagnose() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected.');

    const UserSchema = new mongoose.Schema({
      email: String,
      password: { type: String, select: false },
      role: String
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

    const user = await User.findOne({ email: EMAIL }).select('+password');
    if (!user) {
      console.log('DIAGNOSIS: User not found in DB!');
      process.exit(1);
    }

    console.log('DIAGNOSIS: User found.');
    console.log('Role:', user.role);
    console.log('Stored Hash:', user.password);

    const isMatch = await bcrypt.compare(PASSWORD, user.password);
    console.log('DIAGNOSIS: Password match result:', isMatch);

    if (isMatch) {
      console.log('SUCCESS: Credentials are correct in the database.');
    } else {
      console.log('FAILURE: Password mismatch. Stored hash does not match Admin@123.');
      
      // Check if it's double-hashed
      const doubleCheck = await bcrypt.compare(PASSWORD, '$2a$10$vai4GLhOgTziiaw2wLHS6.w0wGmAROUI5t63S2NSrRTppA8vxpoPq');
      console.log('DEBUG: Comparison with hardcoded Slide 3 hash:', doubleCheck);
    }

    process.exit(0);
  } catch (err) {
    console.error('DIAGNOSIS ERROR:', err);
    process.exit(1);
  }
}

diagnose();
