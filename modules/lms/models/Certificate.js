import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  templateUrl: {
    type: String,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  // Issued certificates can optionally store the user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  certificateId: {
    type: String,
  },
  certificateUrl: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
