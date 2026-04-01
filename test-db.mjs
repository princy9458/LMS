import mongoose from 'mongoose';
import connectDB from './modules/lms/lib/db.js';

async function test() {
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

test();
