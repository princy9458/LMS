import mongoose, { Schema, Document } from 'mongoose';

export interface IInternship extends Document {
  tenant: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  title: string;
  description: string;
  duration: string;
  stipend: string;
  location: string;
  requirements: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  employer: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  location: { type: String, required: true, default: 'Remote' },
  requirements: [{ type: String }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

InternshipSchema.index({ tenant: 1, title: 'text' });
InternshipSchema.index({ employer: 1 });

export default mongoose.models.Internship || mongoose.model<IInternship>('Internship', InternshipSchema);
