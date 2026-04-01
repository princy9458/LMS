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

function getEnglishValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  return value.en || Object.values(value).find((item) => typeof item === 'string' && item.trim()) || '';
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

  const collection = mongoose.connection.collection('courses');
  const courses = await collection.find({}).toArray();

  for (const course of courses) {
    const englishTitle = getEnglishValue(course.title);
    const englishDescription = getEnglishValue(course.description);

    if (!englishTitle || !englishDescription) {
      continue;
    }

    const nextTitle =
      typeof course.title === 'object' && course.title
        ? { ...course.title }
        : { en: englishTitle };
    const nextDescription =
      typeof course.description === 'object' && course.description
        ? { ...course.description }
        : { en: englishDescription };

    if (!nextTitle.en) {
      nextTitle.en = englishTitle;
    }
    if (!nextDescription.en) {
      nextDescription.en = englishDescription;
    }

    if (!nextTitle.hi) {
      nextTitle.hi =
        course.slug === 'python-programming-beginner-to-advanced'
          ? 'पाइथन प्रोग्रामिंग (शुरुआती से उन्नत)'
          : `${englishTitle} (हिंदी)`;
    }

    if (!nextDescription.hi) {
      nextDescription.hi =
        course.slug === 'python-programming-beginner-to-advanced'
          ? 'पाइथन को बुनियादी से उन्नत स्तर तक सीखें, जिसमें OOP, फाइल हैंडलिंग और async प्रोग्रामिंग शामिल है। यह कोर्स वास्तविक दुनिया के उपयोग और व्यावहारिक अभ्यास को कवर करता है।'
          : `${englishDescription} हिंदी संस्करण जल्द उपलब्ध होगा।`;
    }

    await collection.updateOne(
      { _id: course._id },
      {
        $set: {
          title: nextTitle,
          description: nextDescription,
        },
      }
    );
  }

  const sampleCourse = await collection.findOne(
    { slug: 'python-programming-beginner-to-advanced' },
    { projection: { title: 1, description: 1, slug: 1 } }
  );

  console.log(JSON.stringify(sampleCourse, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[updateCourseHindiTranslations] Failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
