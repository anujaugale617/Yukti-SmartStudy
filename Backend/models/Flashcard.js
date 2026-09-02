
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  topic: { type: String, default: 'General', trim: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  mastered: { type: Boolean, default: false },
  lastReviewed: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
