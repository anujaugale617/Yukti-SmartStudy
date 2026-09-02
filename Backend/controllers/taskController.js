
const StudyTask = require('../models/StudyTask');

const getTasks = async (req, res, next) => {
  try {
    const tasks = await StudyTask.find({ userId: req.user._id })
      .populate('subjectId', 'name code color')
      .sort({ date: 1, startTime: 1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { subjectId, title, date, startTime, duration, priority } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide task title' });
    }

    const task = await StudyTask.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      title,
      date: date || new Date(),
      startTime: startTime || '18:00',
      duration: Number(duration) || 60,
      priority: priority || 'Medium',
      completed: false
    });

    const populated = await StudyTask.findById(task._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    let task = await StudyTask.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Study task not found' });
    }

    task = await StudyTask.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const toggleTask = async (req, res, next) => {
  try {
    let task = await StudyTask.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Study task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    const populated = await StudyTask.findById(task._id).populate('subjectId', 'name code color');
    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await StudyTask.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Study task not found' });
    }

    await StudyTask.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Study task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask
};
