import mongoose, { Schema, Document } from 'mongoose';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';
import { makeUniqueSlug, slugifyText } from '@/modules/lms/utils/slug';

export interface IQuiz extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  slug: string;
  slugHistory?: string[];
  description?: LocalizedText;
  translations?: Record<string, Record<string, string>>;
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  topic?: mongoose.Types.ObjectId;
  passingScore: number;
  passingMarks?: number;
  totalPoints: number;
  timeLimit?: number; // in minutes
  questions: mongoose.Types.ObjectId[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Quiz title must include an English translation.',
    },
  }),
  slug: { type: String, required: true, trim: true },
  slugHistory: { type: [String], default: [] },
  description: localizedTextField(),
  translations: { type: Object, default: {} },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  topic: { type: Schema.Types.ObjectId, ref: 'Topic' },
  passingScore: { type: Number, default: 80 },
  passingMarks: { type: Number },
  totalPoints: { type: Number, default: 0 },
  timeLimit: { type: Number },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

QuizSchema.index({ tenant: 1, course: 1 });
QuizSchema.index({ tenant: 1, lesson: 1 });
QuizSchema.index({ tenant: 1, topic: 1 });
QuizSchema.index({ tenant: 1, slug: 1 }, { unique: true });
QuizSchema.index({ tenant: 1, slugHistory: 1 });
QuizSchema.index({ '$**': 'text' });

QuizSchema.pre('validate', function syncQuizFields(next) {
  if (this.passingMarks !== undefined && this.passingScore === undefined) {
    this.passingScore = this.passingMarks;
  }
  if (this.passingScore !== undefined && this.passingMarks === undefined) {
    this.passingMarks = this.passingScore;
  }
  next();
});

QuizSchema.pre('validate', async function ensureQuizSlug(this: IQuiz & { title?: LocalizedText; slug?: string }, next) {
  const title = this.title;
  const source = typeof title === 'object' && title && typeof (title as any).en === 'string'
    ? String((title as any).en || '')
    : '';
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

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
