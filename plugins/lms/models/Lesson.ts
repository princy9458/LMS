import mongoose, { Schema, Document } from 'mongoose';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import { makeUniqueSlug, slugifyText } from '@/modules/lms/utils/slug';

export interface ILesson extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  course: mongoose.Types.ObjectId;
  translations?: Record<string, Record<string, string>>;
  slug: string;
  slugHistory?: string[];
  order: number;
  unlockType?: 'completion' | 'time' | 'none';
  unlockAfterDays?: number;
  description?: LocalizedText;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Lesson title must include an English translation.',
    },
  }),
  slug: { type: String, required: true, trim: true },
  slugHistory: { type: [String], default: [] },
  translations: { type: Object, default: {} },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, default: 0 },
  unlockType: { type: String, enum: ['completion', 'time', 'none'], default: 'none' },
  unlockAfterDays: { type: Number, default: 0 },
  description: localizedTextField()
}, { timestamps: true });

LessonSchema.index({ tenant: 1, course: 1, order: 1 });
LessonSchema.index({ tenant: 1, module: 1, order: 1 });
LessonSchema.index({ tenant: 1, slug: 1 }, { unique: true });
LessonSchema.index({ tenant: 1, slugHistory: 1 });

LessonSchema.pre('validate', async function(this: ILesson, next) {
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

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
