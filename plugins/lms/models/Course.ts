import mongoose, { Schema, Document } from 'mongoose';
import { getTranslatedField, hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';

export interface ICourse extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  slug: string;
  description: LocalizedText;
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
  description: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Course description must include an English translation.',
    },
  }),
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
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

// Combined index: Tenant isolation + slug
CourseSchema.index({ tenant: 1, slug: 1 }, { unique: true });
CourseSchema.index({ '$**': 'text' });

CourseSchema.pre('validate', function(this: ICourse, next) {
  const slugSourceTitle = getTranslatedField(this.title, 'en');

  // Auto-generate slug if missing
  if (!this.slug && slugSourceTitle) {
    this.slug = slugSourceTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
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

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
