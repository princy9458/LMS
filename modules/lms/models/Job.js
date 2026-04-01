import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  requiredSkills: [{
    type: String,
  }],
  salaryRange: {
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

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
