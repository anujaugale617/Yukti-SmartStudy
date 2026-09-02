
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Note = require('../models/Note');

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    const [attendance, assignments, exams, notes] = await Promise.all([
      Attendance.findOne({ subjectId: subject._id, userId: req.user._id }),
      Assignment.find({ subjectId: subject._id, userId: req.user._id }).sort({ dueDate: 1 }),
      Exam.find({ subjectId: subject._id, userId: req.user._id }).sort({ date: 1 }),
      Note.find({ subjectId: subject._id, userId: req.user._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      subject,
      details: {
        attendance,
        assignments,
        exams,
        notes
      }
    });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, teacher, credits, description, color } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Please provide subject name and code' });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      code,
      teacher: teacher || '',
      credits: Number(credits) || 3,
      description: description || '',
      color: color || '#3b82f6'
    });

    // Auto initialize attendance record
    await Attendance.create({
      userId: req.user._id,
      subjectId: subject._id,
      totalClasses: 0,
      attendedClasses: 0
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Promise.all([
      Subject.deleteOne({ _id: req.params.id }),
      Attendance.deleteMany({ subjectId: req.params.id }),
      Assignment.deleteMany({ subjectId: req.params.id }),
      Exam.deleteMany({ subjectId: req.params.id }),
      Note.deleteMany({ subjectId: req.params.id })
    ]);

    res.json({ success: true, message: 'Subject and linked records removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
