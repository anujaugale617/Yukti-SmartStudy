
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  totalClasses: { type: Number, default: 0, min: 0 },
  attendedClasses: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

// Compound unique index so one attendance record per subject per user
attendanceSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
