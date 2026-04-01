import mongoose, { Schema, Document } from 'mongoose';
import { hasEnglishTranslation, localizedTextArrayField, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';

export interface IQuestion extends Document {
  tenant?: mongoose.Types.ObjectId;
  quiz?: mongoose.Types.ObjectId; // Optional for question bank usage
  text: LocalizedText;
  type: 'single' | 'multiple' | 'boolean' | 'short';
  points: number;
  options?: LocalizedText[];
  correctAnswerIndex?: number;
  answers?: mongoose.Types.ObjectId[];
  explanation?: LocalizedText;
  tags?: string[];
  order: number;
}

const QuestionSchema: Schema = new Schema({
  // Tenant is optional for single-tenant installs (e.g. local dev)
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Question text must include an English translation.',
    },
  }),
  type: { 
    type: String, 
    enum: ['single', 'multiple', 'boolean', 'short'], 
    default: 'single' 
  },
  points: { type: Number, default: 1 },
  options: localizedTextArrayField(),
  correctAnswerIndex: { type: Number },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
  explanation: localizedTextField(),
  tags: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

QuestionSchema.index({ tenant: 1, quiz: 1, order: 1 });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
