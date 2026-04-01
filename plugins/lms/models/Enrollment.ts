import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  tenant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progressPercent: number;
  completedLessons: mongoose.Types.ObjectId[];
  completedTopics: mongoose.Types.ObjectId[];
  completedQuizzes: mongoose.Types.ObjectId[];
  currentLesson?: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progressPercent: { type: Number, default: 0 },
  completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  completedTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  completedQuizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
  currentLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

EnrollmentSchema.index({ tenant: 1, user: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
