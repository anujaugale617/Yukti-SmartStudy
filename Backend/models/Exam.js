
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['Internal', 'Practical', 'Midterm', 'End Semester', 'Viva', 'Quiz'], 
    default: 'Midterm' 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. '10:00 AM'
  venue: { type: String, default: '', trim: true },
  syllabus: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
