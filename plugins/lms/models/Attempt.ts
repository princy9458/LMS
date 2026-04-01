import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
  tenant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  score: number;
  passed: boolean;
  answers: any[];
  duration: number; // in seconds
  createdAt: Date;
}

const AttemptSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  answers: { type: Array, default: [] },
  duration: { type: Number, default: 0 }
}, { timestamps: { createdAt: true, updatedAt: false } });

AttemptSchema.index({ tenant: 1, user: 1, quiz: 1 });

export default mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);
