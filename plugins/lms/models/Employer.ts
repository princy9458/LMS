import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployer extends Document {
  tenant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  companyName: string;
  logo?: string;
  industry?: string;
  website?: string;
  isVerified: boolean;
  jobs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EmployerSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  logo: { type: String },
  industry: { type: String },
  website: { type: String },
  isVerified: { type: Boolean, default: false },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

EmployerSchema.index({ tenant: 1, user: 1 }, { unique: true });
EmployerSchema.index({ companyName: 'text' });

export default mongoose.models.Employer || mongoose.model<IEmployer>('Employer', EmployerSchema);
