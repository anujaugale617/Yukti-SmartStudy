
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  college: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  year: { type: String, required: true, default: 'Third Year' },
  semester: { type: String, required: true, default: 'Semester 5' },
  profileImage: { type: String, default: '' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      assignments: { type: Boolean, default: true },
      exams: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
