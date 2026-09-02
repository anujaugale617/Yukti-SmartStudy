
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

const getAttendance = async (req, res, next) => {
  try {
    const attendances = await Attendance.find({ userId: req.user._id })
      .populate('subjectId', 'name code color credits');
    
    // Calculate overall statistics
    let totalClasses = 0;
    let attendedClasses = 0;
    const records = attendances.map(a => {
      totalClasses += a.totalClasses || 0;
      attendedClasses += a.attendedClasses || 0;
      const percentage = a.totalClasses > 0 
        ? Math.round((a.attendedClasses / a.totalClasses) * 100) 
        : 100;
      return {
        _id: a._id,
        subject: a.subjectId,
        totalClasses: a.totalClasses,
        attendedClasses: a.attendedClasses,
        absentClasses: Math.max(0, a.totalClasses - a.attendedClasses),
        percentage,
        status: percentage >= 75 ? 'Good' : 'Critical'
      };
    });

    const overallPercentage = totalClasses > 0 
      ? Math.round((attendedClasses / totalClasses) * 100) 
      : 100;

    res.json({
      success: true,
      overall: {
        totalClasses,
        attendedClasses,
        absentClasses: Math.max(0, totalClasses - attendedClasses),
        percentage: overallPercentage,
        status: overallPercentage >= 75 ? 'Safe' : 'Low Attendance Alert'
      },
      records
    });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { totalClasses, attendedClasses } = req.body;
    let attendance = await Attendance.findOne({ _id: req.params.id, userId: req.user._id });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (Number(attendedClasses) > Number(totalClasses)) {
      return res.status(400).json({ success: false, message: 'Attended classes cannot exceed total classes' });
    }

    attendance.totalClasses = Math.max(0, Number(totalClasses));
    attendance.attendedClasses = Math.max(0, Number(attendedClasses));
    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate('subjectId', 'name code color');
    res.json({ success: true, attendance: populated });
  } catch (error) {
    next(error);
  }
};

const markAttendanceClass = async (req, res, next) => {
  try {
    const { action } = req.body; // 'present' or 'absent'
    let attendance = await Attendance.findOne({ _id: req.params.id, userId: req.user._id });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    attendance.totalClasses += 1;
    if (action === 'present') {
      attendance.attendedClasses += 1;
    }
    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate('subjectId', 'name code color');
    res.json({ success: true, attendance: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  updateAttendance,
  markAttendanceClass
};
