import mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  answers: [
    {
      questionIndex: Number,
      selectedOptionIndex: Number,
      isCorrect: Boolean,
    },
  ],
  attemptDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
