import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  tenant: mongoose.Types.ObjectId;
  title: string;
  employer: mongoose.Types.ObjectId;
  description: string;
  salaryRange?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  requirements: string[];
  applications: mongoose.Types.ObjectId[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true, trim: true },
  employer: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  description: { type: String, required: true },
  salaryRange: { type: String },
  location: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
  requirements: [{ type: String }],
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

JobSchema.index({ tenant: 1, title: 'text', description: 'text' });
JobSchema.index({ employer: 1 });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
