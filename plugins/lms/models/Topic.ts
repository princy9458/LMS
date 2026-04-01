import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: string;
  course?: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  content: string;
  order: number;
  quizzes?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: { type: String, required: true, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  content: { type: String },
  order: { type: Number, default: 0 },
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }]
}, { timestamps: true });

TopicSchema.index({ tenant: 1, course: 1, order: 1 });
TopicSchema.index({ tenant: 1, lesson: 1, order: 1 });

export default mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
