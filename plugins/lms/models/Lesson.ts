import mongoose, { Schema, Document } from 'mongoose';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';

export interface ILesson extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  course: mongoose.Types.ObjectId;
  module?: mongoose.Types.ObjectId;
  content: LocalizedText;
  subtitles?: LocalizedText;
  type: 'video' | 'text' | 'pdf';
  videoUrl?: string;
  videoProvider?: 's3' | 'cloudflare' | 'mux' | 'local';
  videoExternalId?: string;
  duration?: number;
  isPreview: boolean;
  quizzes: mongoose.Types.ObjectId[];
  topics: mongoose.Types.ObjectId[];
  order: number;
  unlockType?: 'completion' | 'time' | 'none';
  unlockAfterDays?: number;
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
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: Schema.Types.ObjectId, ref: 'Module' },
  content: localizedTextField(),
  subtitles: localizedTextField(),
  type: { type: String, enum: ['video', 'text', 'pdf'], default: 'text' },
  videoUrl: { type: String },
  videoProvider: { type: String, enum: ['s3', 'cloudflare', 'mux', 'local'], default: 'local' },
  videoExternalId: { type: String },
  duration: { type: Number },
  isPreview: { type: Boolean, default: false },
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
  topics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  order: { type: Number, default: 0 },
  unlockType: { type: String, enum: ['completion', 'time', 'none'], default: 'none' },
  unlockAfterDays: { type: Number, default: 0 }
}, { timestamps: true });

LessonSchema.index({ tenant: 1, course: 1, order: 1 });
LessonSchema.index({ tenant: 1, module: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
