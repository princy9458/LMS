import mongoose from 'mongoose';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const supportedLanguages = require('../config/supportedLanguages.json');
const CONTENT_LANGUAGES = supportedLanguages.map((language) => language.code);
const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';
const isDryRun = process.argv.includes('--dry-run');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
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

function createEmptyLocalizedField() {
  return CONTENT_LANGUAGES.reduce((acc, language) => {
    acc[language] = '';
    return acc;
  }, {});
}

export function normalizeLocalizedFieldForMigration(value) {
  if (typeof value === 'string') {
    return {
      ...createEmptyLocalizedField(),
      en: value.trim(),
    };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  const normalized = {
    ...createEmptyLocalizedField(),
  };

  for (const [key, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue === 'string') {
      normalized[key] = fieldValue.trim();
    }
  }

  if (!normalized.en) {
    const firstAvailable = Object.values(normalized).find((fieldValue) => typeof fieldValue === 'string' && fieldValue.trim());
    normalized.en = firstAvailable || '';
  }

  return normalized;
}

export function normalizeLocalizedArrayForMigration(value) {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => normalizeLocalizedFieldForMigration(item));
}

function valuesAreEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildUpdatePayload(document, rules) {
  const updates = {};

  for (const rule of rules) {
    const field = typeof rule === 'string' ? rule : rule.field;
    const type = typeof rule === 'string' ? 'field' : rule.type;
    const currentValue = document[field];
    if (typeof currentValue === 'undefined') {
      continue;
    }

    const nextValue =
      type === 'array'
        ? normalizeLocalizedArrayForMigration(currentValue)
        : normalizeLocalizedFieldForMigration(currentValue);

    if (!valuesAreEqual(currentValue, nextValue)) {
      updates[field] = nextValue;
    }
  }

  return updates;
}

async function migrateCollection(db, collectionName, rules) {
  const collection = db.collection(collectionName);
  const documents = await collection.find({}, { projection: rules.reduce((acc, rule) => {
    const field = typeof rule === 'string' ? rule : rule.field;
    acc[field] = 1;
    return acc;
  }, { _id: 1 }) }).toArray();

  const operations = [];

  for (const document of documents) {
    const updates = buildUpdatePayload(document, rules);
    if (Object.keys(updates).length > 0) {
      operations.push({
        updateOne: {
          filter: { _id: document._id },
          update: { $set: updates },
        },
      });
    }
  }

  if (!operations.length) {
    console.log(`[${collectionName}] No documents needed migration.`);
    return { scanned: documents.length, updated: 0 };
  }

  if (isDryRun) {
    console.log(`[${collectionName}] Dry run: ${operations.length} documents would be updated.`);
    return { scanned: documents.length, updated: operations.length };
  }

  const result = await collection.bulkWrite(operations, { ordered: false });
  console.log(`[${collectionName}] Updated ${result.modifiedCount} documents.`);
  return { scanned: documents.length, updated: result.modifiedCount };
}

async function main() {
  loadEnvFile();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  await mongoose.connect(mongoUri, { dbName: DEFAULT_DB_NAME });
  const db = mongoose.connection.db;

  const collectionRules = {
    courses: ['title', 'description'],
    lessons: ['title', 'content', 'subtitles'],
    modules: ['title'],
    questions: ['text', 'explanation', { field: 'options', type: 'array' }],
    quizzes: ['title', 'description'],
  };

  const summary = {};

  for (const [collectionName, rules] of Object.entries(collectionRules)) {
    summary[collectionName] = await migrateCollection(db, collectionName, rules);
  }

  console.log('\nMigration summary');
  for (const [collectionName, result] of Object.entries(summary)) {
    console.log(`- ${collectionName}: scanned ${result.scanned}, updated ${result.updated}`);
  }

  await mongoose.disconnect();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    console.error('Migration failed:', error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exitCode = 1;
  });
}
