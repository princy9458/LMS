import { CONTENT_LANGUAGE_CODES } from '@/config/contentLanguages';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGE_CODES, createEmptyLanguageRecord } from '@/config/languages';
import { prepareSlugWritePayload } from '@/modules/lms/utils/slug';

const SUPPORTED_LOCALES = [...SUPPORTED_LANGUAGE_CODES];
const CONTENT_LOCALES = [...CONTENT_LANGUAGE_CODES];
const DEFAULT_LOCALE = DEFAULT_LANGUAGE;

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getSafeLocale(locale) {
  const normalizedLocale =
    typeof locale === 'string'
      ? locale.trim().toLowerCase()
      : '';

  return SUPPORTED_LOCALES.includes(normalizedLocale) ? normalizedLocale : DEFAULT_LOCALE;
}

function readSearchParam(request, key) {
  if (typeof request?.nextUrl?.searchParams?.get === 'function') {
    return request.nextUrl.searchParams.get(key);
  }

  if (typeof request?.url === 'string') {
    try {
      return new URL(request.url).searchParams.get(key);
    } catch {
      return null;
    }
  }

  return null;
}

function readLocaleFromReferer(request) {
  const referer = request?.headers?.get?.('referer');
  if (!referer) {
    return null;
  }

  try {
    const pathname = new URL(referer).pathname;
    const segment = pathname.split('/')[1];
    return segment || null;
  } catch {
    return null;
  }
}

function createEmptyLocalizedField() {
  return createEmptyLanguageRecord('');
}

function normalizeCmsTranslations(value) {
  if (!isPlainObject(value)) {
    return {};
  }

  return Object.entries(value).reduce((acc, [locale, block]) => {
    if (!isPlainObject(block)) {
      return acc;
    }

    acc[locale] = Object.entries(block).reduce((blockAcc, [key, fieldValue]) => {
      if (typeof fieldValue !== 'string') {
        return blockAcc;
      }

      const normalized = fieldValue.trim();
      if (normalized) {
        blockAcc[key] = normalized;
      }
      return blockAcc;
    }, {});

    return acc;
  }, {});
}

function ensureTranslationLocaleShape(translations, fallbackFields = []) {
  return SUPPORTED_LOCALES.reduce((acc, locale) => {
    const block = translations?.[locale] || {};
    acc[locale] = fallbackFields.reduce((blockAcc, field) => {
      if (typeof block[field] === 'string') {
        blockAcc[field] = block[field];
      }
      return blockAcc;
    }, {});
    return acc;
  }, {});
}

function mergeTranslationPayload(existingTranslations, payloadTranslations) {
  const normalizedExisting = normalizeCmsTranslations(existingTranslations);
  const normalizedPayload = normalizeCmsTranslations(payloadTranslations);

  return {
    ...normalizedExisting,
    ...Object.entries(normalizedPayload).reduce((acc, [locale, block]) => {
      acc[locale] = {
        ...(normalizedExisting[locale] || {}),
        ...block,
      };
      return acc;
    }, {}),
  };
}

function applyTranslationsToLocalizedField(existingField, translations, fieldName) {
  const merged = normalizeLocalizedField(existingField, { preserveEmpty: true });
  Object.entries(translations || {}).forEach(([locale, block]) => {
    if (typeof block?.[fieldName] === 'string' && block[fieldName].trim()) {
      merged[locale] = block[fieldName].trim();
    }
  });
  return merged;
}

function buildCmsTranslationsFromLegacy(source, fields) {
  const result = normalizeCmsTranslations(source?.translations);
  return ensureTranslationLocaleShape(
    SUPPORTED_LOCALES.reduce((acc, locale) => {
      acc[locale] = {
        ...(result[locale] || {}),
      };
      fields.forEach((field) => {
        const localized = resolveLocalizedFieldResult(source?.[field], locale).value;
        if (localized) {
          acc[locale][field] = localized;
        }
      });
      return acc;
    }, {}),
    fields
  );
}

function mergeLocalizedField(nextValue, currentValue) {
  const normalizedNext = normalizeLocalizedField(nextValue, { preserveEmpty: true });
  if (Object.keys(normalizedNext).length === 0) {
    return currentValue;
  }

  return {
    ...normalizeLocalizedField(currentValue, { preserveEmpty: true }),
    ...normalizedNext,
  };
}

function mergeLocalizedArray(nextValue, currentValue = []) {
  const normalizedNext = normalizeLocalizedArray(nextValue, { preserveEmpty: true });
  if (!normalizedNext.length) {
    return currentValue;
  }

  const normalizedCurrent = normalizeLocalizedArray(currentValue, { preserveEmpty: true });

  return normalizedNext.map((item, index) => ({
    ...normalizeLocalizedField(normalizedCurrent[index], { preserveEmpty: true }),
    ...item,
  }));
}

export function getRequestedLocale(request) {
  const queryLocale = readSearchParam(request, 'lang') || readSearchParam(request, 'locale');
  const headerLocale =
    request?.headers?.get?.('x-lang') ||
    request?.headers?.get?.('x-locale');
  const refererLocale = readLocaleFromReferer(request);

  return getSafeLocale(queryLocale || headerLocale || refererLocale || DEFAULT_LOCALE);
}

export function normalizeLocalizedField(value, options = {}) {
  const { preserveEmpty = false } = options;

  if (typeof value === 'string') {
    const normalizedString = value.trim();
    return normalizedString || preserveEmpty ? { en: normalizedString } : {};
  }

  if (!isPlainObject(value)) {
    return {};
  }

  return Object.entries(value).reduce((acc, [locale, localizedValue]) => {
    if (typeof localizedValue !== 'string') {
      return acc;
    }

    const normalizedString = localizedValue.trim();
    if (normalizedString || preserveEmpty) {
      acc[locale] = normalizedString;
    }

    return acc;
  }, {});
}

export function expandLocalizedField(value) {
  const normalized = normalizeLocalizedField(value, { preserveEmpty: true });
  return {
    ...createEmptyLocalizedField(),
    ...Object.keys(normalized).reduce((acc, locale) => {
      acc[locale] = '';
      return acc;
    }, {}),
    ...normalized,
  };
}

export function normalizeLocalizedArray(value, options = {}) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeLocalizedField(item, options));
}

export function hasRequiredEnglishText(value) {
  return Boolean(normalizeLocalizedField(value).en);
}

export function hasRequiredEnglishCourseFields(title, description) {
  return hasRequiredEnglishText(title) && hasRequiredEnglishText(description);
}

export function resolveLocalizedFieldResult(value, locale = DEFAULT_LOCALE) {
  const safeLocale = getSafeLocale(locale);

  if (typeof value === 'string') {
    return {
      value,
      localeUsed: DEFAULT_LOCALE,
      usedEnglishFallback: safeLocale !== DEFAULT_LOCALE && Boolean(value.trim()),
    };
  }

  const normalized = normalizeLocalizedField(value);
  if (normalized[safeLocale]) {
    return {
      value: normalized[safeLocale],
      localeUsed: safeLocale,
      usedEnglishFallback: false,
    };
  }

  if (normalized.en) {
    return {
      value: normalized.en,
      localeUsed: 'en',
      usedEnglishFallback: safeLocale !== 'en',
    };
  }

  const firstAvailableEntry = Object.entries(normalized).find(([, localizedValue]) => localizedValue);
  return {
    value: firstAvailableEntry?.[1] || '',
    localeUsed: firstAvailableEntry?.[0] || DEFAULT_LOCALE,
    usedEnglishFallback: false,
  };
}

export function resolveLocalizedField(value, locale = DEFAULT_LOCALE) {
  return resolveLocalizedFieldResult(value, locale).value;
}

export function getTranslatedField(field, locale = DEFAULT_LOCALE) {
  return resolveLocalizedField(field, locale);
}

export function resolveLocalizedArray(value, locale = DEFAULT_LOCALE) {
  return normalizeLocalizedArray(value).map((item) => resolveLocalizedField(item, locale));
}

export function localizeModuleDocument(module, locale = DEFAULT_LOCALE) {
  if (!module || typeof module !== 'object') {
    return module;
  }

  const plainModule =
    typeof module.toObject === 'function'
      ? module.toObject({ virtuals: true })
      : { ...module };
  const titleResult = resolveLocalizedFieldResult(plainModule.title, locale);

  return {
    ...plainModule,
    titleTranslations: expandLocalizedField(plainModule.title),
    title: titleResult.value,
    lessons: Array.isArray(plainModule.lessons)
      ? plainModule.lessons.map((lesson) => localizeLessonDocument(lesson, locale))
      : plainModule.lessons,
    localeUsed: titleResult.localeUsed,
  };
}

export function localizeCourseDocument(course, locale = DEFAULT_LOCALE) {
  if (!course || typeof course !== 'object') {
    return course;
  }

  const plainCourse =
    typeof course.toObject === 'function'
      ? course.toObject({ virtuals: true })
      : { ...course };
  const safeLocale = getSafeLocale(locale);
  const titleResult = resolveLocalizedFieldResult(plainCourse.title, safeLocale);
  const descriptionResult = resolveLocalizedFieldResult(plainCourse.description, safeLocale);

  if ((titleResult.usedEnglishFallback || descriptionResult.usedEnglishFallback) && safeLocale !== DEFAULT_LOCALE) {
    console.warn('Missing translation for locale:', safeLocale);
  }

  return {
    ...plainCourse,
    translations: buildCmsTranslationsFromLegacy(plainCourse, ['title', 'description']),
    titleTranslations: expandLocalizedField(plainCourse.title),
    descriptionTranslations: expandLocalizedField(plainCourse.description),
    title: titleResult.value,
    description: descriptionResult.value,
    modules: Array.isArray(plainCourse.modules)
      ? plainCourse.modules.map((module) => localizeModuleDocument(module, safeLocale))
      : plainCourse.modules,
    lessons: Array.isArray(plainCourse.lessons)
      ? plainCourse.lessons.map((lesson) => localizeLessonDocument(lesson, safeLocale))
      : plainCourse.lessons,
    localeUsed:
      titleResult.localeUsed === descriptionResult.localeUsed
        ? titleResult.localeUsed
        : DEFAULT_LOCALE,
    attributes: Array.isArray(plainCourse.attributes)
      ? Object.values(
          plainCourse.attributes.reduce((acc, attr) => {
            if (!acc[attr.key]) {
              acc[attr.key] = { key: attr.key, value: {} };
            }
            acc[attr.key].value[attr.language] = attr.value;
            return acc;
          }, {})
        )
      : [],
  };
}

export function localizeLessonDocument(lesson, locale = DEFAULT_LOCALE) {
  if (!lesson || typeof lesson !== 'object') {
    return lesson;
  }

  const plainLesson =
    typeof lesson.toObject === 'function'
      ? lesson.toObject({ virtuals: true })
      : { ...lesson };
  const safeLocale = getSafeLocale(locale);
  const titleResult = resolveLocalizedFieldResult(plainLesson.title, safeLocale);
  const descriptionResult = resolveLocalizedFieldResult(plainLesson.description, safeLocale);

  if ((titleResult.usedEnglishFallback || descriptionResult.usedEnglishFallback) && safeLocale !== DEFAULT_LOCALE) {
    console.warn('Missing translation for locale:', safeLocale);
  }

  return {
    ...plainLesson,
    translations: buildCmsTranslationsFromLegacy(plainLesson, ['title', 'description']),
    titleTranslations: expandLocalizedField(plainLesson.title),
    descriptionTranslations: expandLocalizedField(plainLesson.description),
    title: titleResult.value,
    description: descriptionResult.value,
    localeUsed: titleResult.localeUsed,
  };
}

export function localizeQuestionDocument(question, locale = DEFAULT_LOCALE) {
  if (!question || typeof question !== 'object') {
    return question;
  }

  const plainQuestion =
    typeof question.toObject === 'function'
      ? question.toObject({ virtuals: true })
      : { ...question };
  const safeLocale = getSafeLocale(locale);
  const textResult = resolveLocalizedFieldResult(plainQuestion.text || plainQuestion.questionText, safeLocale);
  const explanationResult = resolveLocalizedFieldResult(plainQuestion.explanation, safeLocale);
  const optionTranslations = normalizeLocalizedArray(plainQuestion.options, { preserveEmpty: true });
  const localizedOptions = optionTranslations.length
    ? optionTranslations.map((option) => resolveLocalizedField(option, safeLocale))
    : (plainQuestion.answers || []).map((answer) => resolveLocalizedField(answer?.text, safeLocale));

  return {
    ...plainQuestion,
    textTranslations: expandLocalizedField(plainQuestion.text || plainQuestion.questionText),
    questionTextTranslations: expandLocalizedField(plainQuestion.text || plainQuestion.questionText),
    explanationTranslations: expandLocalizedField(plainQuestion.explanation),
    optionTranslations: optionTranslations.map((option) => ({
      ...createEmptyLocalizedField(),
      ...option,
    })),
    text: textResult.value,
    questionText: textResult.value,
    explanation: explanationResult.value,
    options: localizedOptions,
    answers: Array.isArray(plainQuestion.answers)
      ? plainQuestion.answers.map((answer) => localizeAnswerDocument(answer, safeLocale))
      : plainQuestion.answers,
    quizId: plainQuestion.quizId || plainQuestion.quiz,
    localeUsed: textResult.localeUsed,
  };
}

export function localizeQuizDocument(quiz, locale = DEFAULT_LOCALE) {
  if (!quiz || typeof quiz !== 'object') {
    return quiz;
  }

  const plainQuiz =
    typeof quiz.toObject === 'function'
      ? quiz.toObject({ virtuals: true })
      : { ...quiz };
  const safeLocale = getSafeLocale(locale);
  const titleResult = resolveLocalizedFieldResult(plainQuiz.title, safeLocale);
  const descriptionResult = resolveLocalizedFieldResult(plainQuiz.description, safeLocale);

  return {
    ...plainQuiz,
    translations: buildCmsTranslationsFromLegacy(plainQuiz, ['title', 'description']),
    titleTranslations: expandLocalizedField(plainQuiz.title),
    descriptionTranslations: expandLocalizedField(plainQuiz.description),
    title: titleResult.value,
    description: descriptionResult.value,
    courseId: plainQuiz.courseId || plainQuiz.course,
    lessonId: plainQuiz.lessonId || plainQuiz.lesson,
    topicId: plainQuiz.topicId || plainQuiz.topic,
    passingMarks: plainQuiz.passingMarks ?? plainQuiz.passingScore,
    questions: Array.isArray(plainQuiz.questions)
      ? plainQuiz.questions.map((question) => localizeQuestionDocument(question, safeLocale))
      : plainQuiz.questions,
    localeUsed:
      titleResult.localeUsed === descriptionResult.localeUsed
        ? titleResult.localeUsed
        : titleResult.localeUsed || descriptionResult.localeUsed || DEFAULT_LOCALE,
  };
}

export function localizeAnswerDocument(answer, locale = DEFAULT_LOCALE) {
  if (!answer || typeof answer !== 'object') {
    return answer;
  }

  const plainAnswer =
    typeof answer.toObject === 'function'
      ? answer.toObject({ virtuals: true })
      : { ...answer };
  const safeLocale = getSafeLocale(locale);
  const textResult = resolveLocalizedFieldResult(plainAnswer.text, safeLocale);

  return {
    ...plainAnswer,
    translations: buildCmsTranslationsFromLegacy(plainAnswer, ['text']),
    text: textResult.value,
    localeUsed: textResult.localeUsed,
  };
}

export function localizeCertificateDocument(certificate, locale = DEFAULT_LOCALE) {
  if (!certificate || typeof certificate !== 'object') {
    return certificate;
  }

  const plainCertificate =
    typeof certificate.toObject === 'function'
      ? certificate.toObject({ virtuals: true })
      : { ...certificate };
  const safeLocale = getSafeLocale(locale);
  const nameResult = resolveLocalizedFieldResult(plainCertificate.name, safeLocale);
  const descriptionResult = resolveLocalizedFieldResult(plainCertificate.description, safeLocale);

  return {
    ...plainCertificate,
    translations: buildCmsTranslationsFromLegacy(plainCertificate, ['name', 'description']),
    name: nameResult.value,
    description: descriptionResult.value,
    localeUsed:
      nameResult.localeUsed === descriptionResult.localeUsed
        ? nameResult.localeUsed
        : nameResult.localeUsed || descriptionResult.localeUsed || DEFAULT_LOCALE,
  };
}

export function prepareCourseWritePayload(payload = {}, existingCourse = null) {
  const mergedTranslations = mergeTranslationPayload(existingCourse?.translations, payload.translations);
  const basePayload = prepareSlugWritePayload({
    ...payload,
    translations: mergedTranslations,
    title: mergeLocalizedField(payload.title, existingCourse?.title) ?? payload.title,
    description: mergeLocalizedField(payload.description, existingCourse?.description) ?? payload.description,
  }, existingCourse, {
    slugField: 'slug',
    historyField: 'slugHistory',
    titleField: 'title',
  });

  if (payload.attributes && Array.isArray(payload.attributes)) {
    const formattedAttributes = [];
    payload.attributes.forEach((attr) => {
      const key = typeof attr.key === 'string' ? attr.key.trim() : '';
      if (!key || !attr.value || typeof attr.value !== 'object') return;

      Object.entries(attr.value).forEach(([lang, val]) => {
        const value = typeof val === 'string' ? val.trim() : '';
        if (value) {
          formattedAttributes.push({
            key,
            language: lang,
            value,
          });
        }
      });
    });
    basePayload.attributes = formattedAttributes;
  }

  return basePayload;
}

export function prepareLessonWritePayload(payload = {}, existingLesson = null) {
  const mergedTranslations = mergeTranslationPayload(existingLesson?.translations, payload.translations);
  return prepareSlugWritePayload({
    ...payload,
    translations: mergedTranslations,
    title: mergeLocalizedField(payload.title, existingLesson?.title) ?? payload.title,
    description: mergeLocalizedField(payload.description, existingLesson?.description) ?? payload.description,
  }, existingLesson, {
    slugField: 'slug',
    historyField: 'slugHistory',
    titleField: 'title',
  });
}

export function prepareModuleWritePayload(payload = {}, existingModule = null) {
  return {
    ...payload,
    title: mergeLocalizedField(payload.title, existingModule?.title) ?? payload.title,
  };
}

export function prepareQuestionWritePayload(payload = {}, existingQuestion = null) {
  const nextText = payload.text ?? payload.questionText;
  const mergedTranslations = mergeTranslationPayload(existingQuestion?.translations, payload.translations);

  return {
    ...payload,
    translations: mergedTranslations,
    text: mergeLocalizedField(nextText, existingQuestion?.text) ?? nextText,
    explanation: mergeLocalizedField(payload.explanation, existingQuestion?.explanation) ?? payload.explanation,
    options: mergeLocalizedArray(payload.options, existingQuestion?.options),
  };
}

export function prepareQuizWritePayload(payload = {}, existingQuiz = null) {
  const mergedTranslations = mergeTranslationPayload(existingQuiz?.translations, payload.translations);
  return prepareSlugWritePayload({
    ...payload,
    translations: mergedTranslations,
    title: mergeLocalizedField(payload.title, existingQuiz?.title) ?? payload.title,
    description: mergeLocalizedField(payload.description, existingQuiz?.description) ?? payload.description,
  }, existingQuiz, {
    slugField: 'slug',
    historyField: 'slugHistory',
    titleField: 'title',
  });
}

export function prepareTopicWritePayload(payload = {}, existingTopic = null) {
  const mergedTranslations = mergeTranslationPayload(existingTopic?.translations, payload.translations);

  return prepareSlugWritePayload({
    ...payload,
    translations: mergedTranslations,
    title: mergeLocalizedField(payload.title, existingTopic?.title) ?? payload.title,
    description: mergeLocalizedField(payload.description, existingTopic?.description) ?? payload.description,
    summary: mergeLocalizedField(payload.summary, existingTopic?.summary) ?? payload.summary,
  }, existingTopic, {
    slugField: 'slug',
    historyField: 'slugHistory',
    titleField: 'title',
  });
}

export function prepareCertificateWritePayload(payload = {}, existingCertificate = null) {
  const mergedTranslations = mergeTranslationPayload(existingCertificate?.translations, payload.translations);

  return {
    ...payload,
    translations: mergedTranslations,
    name: mergeLocalizedField(payload.name, existingCertificate?.name) ?? payload.name,
    description: mergeLocalizedField(payload.description, existingCertificate?.description) ?? payload.description,
  };
}

export function applyTranslationPatch(existing, translations, fieldMap = []) {
  const mergedTranslations = mergeTranslationPayload(existing?.translations, translations);
  const next = { ...existing, translations: mergedTranslations };

  fieldMap.forEach((field) => {
    next[field] = applyTranslationsToLocalizedField(existing?.[field], mergedTranslations, field);
  });

  return next;
}
