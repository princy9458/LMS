const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'lms_core';
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing from .env');
  }

  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  });

  const admin = mongoose.connection.db.admin();
  const result = await admin.command({ ping: 1 });
  console.log(JSON.stringify({ connected: true, ping: result.ok }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[checkMongoConnection] Failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
