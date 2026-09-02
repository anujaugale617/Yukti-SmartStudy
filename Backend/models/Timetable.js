
const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  day: { 
    type: String, 
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
  },
  startTime: { type: String, required: true }, // e.g. '09:00'
  endTime: { type: String, required: true },   // e.g. '10:00'
  room: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
