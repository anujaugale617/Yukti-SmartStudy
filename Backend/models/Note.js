
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true }, // 'pdf', 'docx', 'pptx', 'image', etc.
  fileName: { type: String, required: true },
  fileSize: { type: Number, default: 0 }, // in bytes
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
