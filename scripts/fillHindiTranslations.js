const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const hindiTranslationMap = require('../config/hindiTranslationMap.json');
const supportedLanguages = require('../config/supportedLanguages.json');
const SUPPORTED_LANGUAGE_CODES = supportedLanguages.map((language) => language.code);

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }

  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function translateToHindi(text) {
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  if (!normalizedText) {
    return '';
  }

  return hindiTranslationMap[normalizedText] || normalizedText;
}

function normalizeLocalizedField(value) {
  const normalized = SUPPORTED_LANGUAGE_CODES.reduce((acc, locale) => {
    acc[locale] = '';
    return acc;
  }, {});

  if (typeof value === 'string') {
    normalized.en = value.trim();
    return normalized;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return normalized;
  }

  for (const [locale, localizedValue] of Object.entries(value)) {
    if (typeof localizedValue !== 'string') {
      continue;
    }

    normalized[locale] = localizedValue.trim();
  }

  if (!normalized.en) {
    normalized.en = Object.values(normalized).find((item) => typeof item === 'string' && item.trim()) || '';
  }

  return normalized;
}

function valuesAreEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function fillCollectionTranslations(collectionName, fields) {
  const collection = mongoose.connection.collection(collectionName);
  const documents = await collection.find({}).toArray();
  let updatedCount = 0;

  for (const document of documents) {
    const nextFields = {};

    for (const fieldName of fields) {
      const currentValue = document[fieldName];
      if (typeof currentValue === 'undefined') {
        continue;
      }

      const normalizedValue = normalizeLocalizedField(currentValue);
      if (!normalizedValue.en) {
        continue;
      }

      const nextValue = { ...normalizedValue };

      for (const locale of SUPPORTED_LANGUAGE_CODES) {
        if (locale === 'en' || nextValue[locale]) {
          continue;
        }

        nextValue[locale] = locale === 'hi' ? translateToHindi(normalizedValue.en) : normalizedValue.en;
      }

      if (!valuesAreEqual(currentValue, nextValue)) {
        nextFields[fieldName] = nextValue;
      }
    }

    if (Object.keys(nextFields).length === 0) {
      continue;
    }

    await collection.updateOne(
      { _id: document._id },
      { $set: nextFields }
    );
    updatedCount += 1;
  }

  return updatedCount;
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
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  });

  const results = {
    courses: await fillCollectionTranslations('courses', ['title', 'description']),
    lessons: await fillCollectionTranslations('lessons', ['title', 'content']),
    modules: await fillCollectionTranslations('modules', ['title']),
  };

  console.log('[fillHindiTranslations] Updated documents:', JSON.stringify(results, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[fillHindiTranslations] Failed:', error.message || error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
