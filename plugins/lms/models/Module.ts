import mongoose, { Schema, Document } from 'mongoose';
import { hasEnglishTranslation, localizedTextField } from '@/plugins/lms/models/localizedField';
import type { LocalizedText } from '@/plugins/lms/models/localizedField';

export interface IModule extends Document {
  tenant: mongoose.Types.ObjectId;
  title: LocalizedText;
  course: mongoose.Types.ObjectId;
  lessons: mongoose.Types.ObjectId[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: localizedTextField({
    required: true,
    validate: {
      validator: hasEnglishTranslation,
      message: 'Module title must include an English translation.',
    },
  }),
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

ModuleSchema.index({ tenant: 1, course: 1, order: 1 });

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
