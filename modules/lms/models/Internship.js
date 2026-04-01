import mongoose from 'mongoose';

const InternshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an internship title'],
  },
  company: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
  requiredSkills: [{
    type: String,
  }],
  stipend: {
    type: String,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
  },
});

export default mongoose.models.Internship || mongoose.model('Internship', InternshipSchema);
