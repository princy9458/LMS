import mongoose, { Schema, Document } from 'mongoose';
import { getTranslatedField, hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';
import { makeUniqueSlug, slugifyText } from '@/modules/lms/utils/slug';

export interface ICourseAttribute {
  key: string;
  language: string;
  value: string;
}

export interface ICourse extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  slug: string;
  description: LocalizedText;
  translations?: Record<string, Record<string, string>>;
  slugHistory?: string[];
  price: number;
  currency: string;
  isPaid: boolean;
  accessType: 'free' | 'subscription' | 'one-time';
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor?: mongoose.Types.ObjectId;
  instructorName?: string;
  modules: mongoose.Types.ObjectId[];
  lessons?: mongoose.Types.ObjectId[];
  totalLessons?: number;
  skillsEarned?: string[];
  attributes?: ICourseAttribute[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Course title must include an English translation.',
    },
  }),
  slug: { type: String, required: true },
  slugHistory: { type: [String], default: [] },
  description: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Course description must include an English translation.',
    },
  }),
  translations: { type: Object, default: {} },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  isPaid: { type: Boolean, default: false },
  accessType: { type: String, enum: ['free', 'subscription', 'one-time'], default: 'free' },
  thumbnail: { type: String },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  instructor: { type: Schema.Types.ObjectId, ref: 'User' },
  instructorName: { type: String, trim: true },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  totalLessons: { type: Number, default: 0 },
  skillsEarned: [{ type: String, trim: true }],
  attributes: [{
    key: { type: String, required: true },
    language: { type: String, required: true },
    value: { type: String, required: true }
  }],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

// Combined index: Tenant isolation + slug
CourseSchema.index({ tenant: 1, slug: 1 }, { unique: true });
CourseSchema.index({ tenant: 1, slugHistory: 1 });
CourseSchema.index({ '$**': 'text' });

CourseSchema.pre('validate', async function(this: ICourse, next) {
  const slugSourceTitle = getTranslatedField(this.title, 'en');

  if (!this.slug && slugSourceTitle) {
    this.slug = slugifyText(slugSourceTitle);
  }

  if (this.slug) {
    this.slug = await makeUniqueSlug(this.constructor as any, this.slug, {
      tenant: this.tenant,
      excludeId: this._id,
    });
  }

  // Keep difficultyLevel and level in sync
  if (this.difficultyLevel && !this.level) {
    this.level = this.difficultyLevel;
  }
  if (this.level && !this.difficultyLevel) {
    this.difficultyLevel = this.level;
  }

  next();
});

CourseSchema.pre('save', function(this: ICourse, next) {
  if (this.lessons) {
    this.totalLessons = this.lessons.length;
  }
  next();
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
