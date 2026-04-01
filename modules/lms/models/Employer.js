import mongoose from 'mongoose';

const EmployerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  website: {
    type: String,
  },
  logoUrl: {
    type: String,
  },
});

export default mongoose.models.Employer || mongoose.model('Employer', EmployerSchema);
