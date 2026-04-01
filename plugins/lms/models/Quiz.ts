import mongoose, { Schema, Document } from 'mongoose';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';

export interface IQuiz extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: LocalizedText;
  description?: LocalizedText;
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
  description: localizedTextField(),
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

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
