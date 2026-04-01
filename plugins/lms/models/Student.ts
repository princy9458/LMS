import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  tenant: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  bio?: string;
  skillTags: string[];
  resumeUrl?: string;
  enrollments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String },
  skillTags: [{ type: String }],
  resumeUrl: { type: String },
  enrollments: [{ type: Schema.Types.ObjectId, ref: 'Enrollment' }]
}, { timestamps: true });

StudentSchema.index({ tenant: 1, user: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
