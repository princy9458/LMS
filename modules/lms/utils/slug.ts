import type { Model, Types } from 'mongoose';
import { getTranslatedField, normalizeLocalizedText } from '@/plugins/lms/models/localizedField';

export function slugifyText(input: string) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getSlugSourceFromTitle(title: unknown) {
  if (typeof title === 'string') {
    return title.trim();
  }

  if (title && typeof title === 'object') {
    return getTranslatedField(normalizeLocalizedText(title as any), 'en').trim();
  }

  return '';
}

function buildTenantScope(tenant: unknown) {
  if (tenant === undefined || tenant === null || tenant === '') {
    return {
      $or: [
        { tenant: { $exists: false } },
        { tenant: null },
      ],
    };
  }

  return { tenant };
}

export async function makeUniqueSlug(
  model: Model<any>,
  baseSlug: string,
  options: {
    excludeId?: Types.ObjectId | string | null;
    tenant?: unknown;
    slugField?: string;
  } = {}
) {
  const slugField = options.slugField || 'slug';
  const scope = buildTenantScope(options.tenant);
  const excludeId = options.excludeId ? String(options.excludeId) : '';
  const seed = slugifyText(baseSlug) || 'item';

  let candidate = seed;
  let suffix = 2;

  // Keep slugs stable but resolve collisions deterministically.
  while (
    await model.exists({
      ...scope,
      [slugField]: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${seed}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function prepareSlugWritePayload(
  payload: Record<string, any> = {},
  existingDoc: Record<string, any> | null = null,
  options: {
    slugField?: string;
    historyField?: string;
    titleField?: string;
  } = {}
) {
  const slugField = options.slugField || 'slug';
  const historyField = options.historyField || 'slugHistory';
  const titleField = options.titleField || 'title';
  const nextPayload = { ...payload };
  const currentSlug = typeof nextPayload[slugField] === 'string' ? nextPayload[slugField].trim() : '';
  const existingSlug = typeof existingDoc?.[slugField] === 'string' ? existingDoc[slugField].trim() : '';
  const existingHistory = Array.isArray(existingDoc?.[historyField]) ? existingDoc[historyField] : [];

  const sourceTitle = getSlugSourceFromTitle(nextPayload[titleField] ?? existingDoc?.[titleField]);
  const generatedSlug = slugifyText(sourceTitle);
  const shouldAutoGenerate = !currentSlug && generatedSlug;
  const shouldRefreshFromTitle =
    Boolean(existingDoc) &&
    generatedSlug &&
    !nextPayload[slugField] &&
    JSON.stringify(nextPayload[titleField] ?? '') !== JSON.stringify(existingDoc?.[titleField] ?? '');

  if (shouldAutoGenerate || shouldRefreshFromTitle) {
    nextPayload[slugField] = generatedSlug;
  }

  if (existingDoc && nextPayload[slugField] && nextPayload[slugField] !== existingSlug) {
    nextPayload[historyField] = Array.from(new Set([...(existingHistory || []), existingSlug].filter(Boolean)));
  } else if (existingDoc && existingHistory.length) {
    nextPayload[historyField] = existingHistory;
  }

  return nextPayload;
}

export async function resolveDocumentBySlugOrId(
  model: Model<any>,
  identifier: string,
  options: {
    populate?: any;
    slugField?: string;
    historyField?: string;
  } = {}
) {
  const slugField = options.slugField || 'slug';
  const historyField = options.historyField || 'slugHistory';
  const trimmed = String(identifier || '').trim();
  const isObjectId = /^[a-f\d]{24}$/i.test(trimmed);
  const query = {
    $or: [
      { [slugField]: trimmed },
      { [historyField]: trimmed },
    ],
  };

  if (isObjectId) {
    const byId = await model.findById(trimmed).populate(options.populate || []);
    if (byId) {
      return byId;
    }
  }

  return model.findOne(query).populate(options.populate || []);
}
