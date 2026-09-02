
const StudyGoal = require('../models/StudyGoal');

const getGoals = async (req, res, next) => {
  try {
    const goals = await StudyGoal.find({ userId: req.user._id })
      .populate('subjectId', 'name code color')
      .sort({ targetDate: 1 });
    res.json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { subjectId, title, description, targetDate, priority, progress } = req.body;
    if (!title || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide goal title and target date' });
    }

    const goal = await StudyGoal.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      title,
      description: description || '',
      targetDate,
      priority: priority || 'Medium',
      progress: progress !== undefined ? Number(progress) : 0,
      status: Number(progress) >= 100 ? 'Completed' : (Number(progress) > 0 ? 'In Progress' : 'Not Started')
    });

    const populated = await StudyGoal.findById(goal._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, goal: populated });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    let goal = await StudyGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const updates = { ...req.body };
    if (updates.progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, Number(updates.progress)));
      if (updates.progress === 100) updates.status = 'Completed';
      else if (updates.progress > 0) updates.status = 'In Progress';
      else updates.status = 'Not Started';
    }

    goal = await StudyGoal.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const goal = await StudyGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await StudyGoal.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Goal removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
