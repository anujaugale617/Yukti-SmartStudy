
const Timetable = require('../models/Timetable');

const getTimetable = async (req, res, next) => {
  try {
    const classes = await Timetable.find({ userId: req.user._id })
      .populate('subjectId', 'name code color')
      .sort({ day: 1, startTime: 1 });
    res.json({ success: true, count: classes.length, timetable: classes });
  } catch (error) {
    next(error);
  }
};

const getTodayClasses = async (req, res, next) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const classes = await Timetable.find({ userId: req.user._id, day: currentDay })
      .populate('subjectId', 'name code color')
      .sort({ startTime: 1 });
    res.json({ success: true, day: currentDay, count: classes.length, classes });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { subjectId, day, startTime, endTime, room } = req.body;
    if (!subjectId || !day || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide subject, day, start and end time' });
    }

    const newClass = await Timetable.create({
      userId: req.user._id,
      subjectId,
      day,
      startTime,
      endTime,
      room: room || ''
    });

    const populated = await Timetable.findById(newClass._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, timetableClass: populated });
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    let item = await Timetable.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Timetable class not found' });
    }

    item = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, timetableClass: item });
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const item = await Timetable.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Timetable class not found' });
    }

    await Timetable.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Timetable class removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimetable,
  getTodayClasses,
  createClass,
  updateClass,
  deleteClass
};
