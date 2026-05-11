import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  tenant?: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  text: string;
  translations?: Record<string, Record<string, string>>;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  text: { type: String, required: true },
  translations: { type: Object, default: {} },
  isCorrect: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

AnswerSchema.index({ tenant: 1, question: 1, order: 1 });

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
