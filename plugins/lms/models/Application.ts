import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  tenant: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: 'Pending' | 'Reviewed' | 'Rejected' | 'Accepted';
  notes?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Rejected', 'Accepted'], default: 'Pending' },
  notes: { type: String },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ApplicationSchema.index({ tenant: 1, job: 1, student: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
