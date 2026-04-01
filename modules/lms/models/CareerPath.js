import mongoose from 'mongoose';

const CareerPathSchema = new mongoose.Schema({
  careerName: {
    type: String,
    required: [true, 'Please provide a career name'],
  },
  description: {
    type: String,
  },
  requiredSkills: [{
    type: String,
  }],
  recommendedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
});

export default mongoose.models.CareerPath || mongoose.model('CareerPath', CareerPathSchema);
