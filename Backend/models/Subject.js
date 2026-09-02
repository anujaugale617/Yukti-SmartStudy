
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  teacher: { type: String, default: '', trim: true },
  credits: { type: Number, default: 3, min: 1, max: 10 },
  description: { type: String, default: '', trim: true },
  color: { type: String, default: '#3b82f6' }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
