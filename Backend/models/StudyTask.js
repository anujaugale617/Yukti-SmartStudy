
const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
  startTime: { type: String, default: '18:00' },
  duration: { type: Number, default: 60 }, // minutes
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('StudyTask', studyTaskSchema);
