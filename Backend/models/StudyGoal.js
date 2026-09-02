
const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  targetDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' }
}, { timestamps: true });

module.exports = mongoose.model('StudyGoal', studyGoalSchema);
