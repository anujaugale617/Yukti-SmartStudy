
const Exam = require('../models/Exam');

const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ userId: req.user._id })
      .populate('subjectId', 'name code color')
      .sort({ date: 1 });
    res.json({ success: true, count: exams.length, exams });
  } catch (error) {
    next(error);
  }
};

const createExam = async (req, res, next) => {
  try {
    const { subjectId, title, type, date, time, venue, syllabus } = req.body;
    if (!subjectId || !title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide subject, title, date and time' });
    }

    const exam = await Exam.create({
      userId: req.user._id,
      subjectId,
      title,
      type: type || 'Midterm',
      date,
      time,
      venue: venue || '',
      syllabus: syllabus || ''
    });

    const populated = await Exam.findById(exam._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, exam: populated });
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, exam });
  } catch (error) {
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await Exam.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Exam removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExams,
  createExam,
  updateExam,
  deleteExam
};
