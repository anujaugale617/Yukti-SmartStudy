
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  userAnswer: { type: String, default: null }
});

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true, trim: true },
  topic: { type: String, default: '', trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  questions: [questionSchema],
  score: { type: Number, default: null }, // calculated after submission
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
