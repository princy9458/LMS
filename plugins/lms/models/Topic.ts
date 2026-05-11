import mongoose, { Schema, Document } from 'mongoose';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import { makeUniqueSlug, slugifyText } from '@/modules/lms/utils/slug';

export interface ITopic extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  slug: string;
  slugHistory?: string[];
  description?: LocalizedText;
  translations?: Record<string, Record<string, string>>;
  course?: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  videoUrl?: string;
  duration?: number;
  keyPoints?: string[];
  notes?: string[];
  resources?: { title: string; url: string }[];
  codeExample?: string;
  summary?: LocalizedText;
  quizId?: mongoose.Types.ObjectId;
  content: string;
  contentHtml?: string;
  order: number;
  quizzes?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Topic title must include an English translation.',
    },
    set: (v: any) => localizedTextField().set(v)
  },
  slug: { type: String, required: true, trim: true },
  slugHistory: { type: [String], default: [] },
  description: {
    type: Schema.Types.Mixed,
    set: (v: any) => localizedTextField().set(v)
  },
  translations: { type: Object, default: {} },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  keyPoints: { type: [String], default: [] },
  notes: { type: [String], default: [] },
  resources: {
    type: [
      {
        title: { type: String, default: '' },
        url: { type: String, default: '' },
      },
    ],
    default: [],
  },
  codeExample: { type: String, default: '' },
  summary: {
    type: Schema.Types.Mixed,
    set: (v: any) => localizedTextField().set(v)
  },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  content: { type: String },
  contentHtml: { type: String },
  order: { type: Number, default: 0 },
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }]
}, { timestamps: true });

TopicSchema.index({ tenant: 1, course: 1, order: 1 });
TopicSchema.index({ tenant: 1, lesson: 1, order: 1 });
TopicSchema.index({ tenant: 1, slug: 1 }, { unique: true });
TopicSchema.index({ tenant: 1, slugHistory: 1 });

TopicSchema.pre('validate', async function(this: ITopic, next) {
  const source = hasEnglishTranslation(this.title) ? String((this.title as any)?.en || '') : '';
  if (!this.slug && source) {
    this.slug = slugifyText(source);
  }
  if (this.slug) {
    this.slug = await makeUniqueSlug(this.constructor as any, this.slug, {
      tenant: this.tenant,
      excludeId: this._id,
    });
  }
  next();
});

// Force refresh model in development
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Topic;
}

export default mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
