
const Assignment = require('../models/Assignment');

const getAssignments = async (req, res, next) => {
  try {
    const { status, priority, subjectId, search } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (subjectId && subjectId !== 'All') query.subjectId = subjectId;
    if (search) query.title = { $regex: search, $options: 'i' };

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code color')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const { subjectId, title, description, dueDate, priority, status, attachment } = req.body;
    if (!subjectId || !title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide subject, title and due date' });
    }

    const assignment = await Assignment.create({
      userId: req.user._id,
      subjectId,
      title,
      description: description || '',
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Not Started',
      attachment: attachment || ''
    });

    const populated = await Assignment.findById(assignment._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, assignment: populated });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code color');

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await Assignment.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    next(error);
  }
};

const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Not Started', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    ).populate('subjectId', 'name code color');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus
};
