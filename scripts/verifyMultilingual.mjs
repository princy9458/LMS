import assert from 'node:assert/strict';
import {
  normalizeLocalizedArrayForMigration,
  normalizeLocalizedFieldForMigration,
} from './migrateMultilingualContent.mjs';

function resolveLocalizedField(value, language) {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  return value[language] || value.en || Object.values(value).find(Boolean) || '';
}

function run() {
  const migratedTitle = normalizeLocalizedFieldForMigration('React Course');
  assert.deepEqual(migratedTitle, { en: 'React Course', hi: '', fr: '', es: '' });

  const migratedOptions = normalizeLocalizedArrayForMigration(['Hooks', 'Components']);
  assert.deepEqual(migratedOptions, [
    { en: 'Hooks', hi: '', fr: '', es: '' },
    { en: 'Components', hi: '', fr: '', es: '' },
  ]);

  assert.equal(resolveLocalizedField({ en: 'React Course', hi: 'React कोर्स' }, 'hi'), 'React कोर्स');
  assert.equal(resolveLocalizedField({ en: 'React Course', hi: '' }, 'hi'), 'React Course');
  assert.equal(resolveLocalizedField({ en: 'React Course', hi: '', fr: 'Cours React', es: '' }, 'fr'), 'Cours React');
  assert.equal(resolveLocalizedField({ en: 'React Course', hi: '', fr: '', es: 'Curso de React' }, 'es'), 'Curso de React');
  assert.equal(resolveLocalizedField('Legacy lesson title', 'hi'), 'Legacy lesson title');

  console.log('Multilingual verification passed.');
}

run();
