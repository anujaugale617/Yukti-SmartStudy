
const Notification = require('../models/Notification');
const Exam = require('../models/Exam');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');

const checkAndGenerateUserNotifications = async (userId) => {
  try {
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const urgentAssignments = await Assignment.find({
      userId,
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: in2Days }
    }).populate('subjectId', 'name');

    for (const a of urgentAssignments) {
      const title = 'Assignment Due Soon: ' + a.title;
      const existing = await Notification.findOne({ userId, title, createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } });
      if (!existing) {
        await Notification.create({
          userId,
          title,
          message: '"' + a.title + '" for ' + (a.subjectId?.name || 'Subject') + ' is due on ' + new Date(a.dueDate).toLocaleDateString(),
          type: 'assignment',
          link: '/assignments'
        });
      }
    }

    const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const upcomingExams = await Exam.find({
      userId,
      date: { $gte: now, $lte: in5Days }
    }).populate('subjectId', 'name');

    for (const e of upcomingExams) {
      const title = 'Upcoming Exam: ' + (e.subjectId?.name || e.title);
      const existing = await Notification.findOne({ userId, title, createdAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) } });
      if (!existing) {
        await Notification.create({
          userId,
          title,
          message: e.type + ' Exam for ' + (e.subjectId?.name || e.title) + ' is on ' + new Date(e.date).toLocaleDateString() + ' at ' + e.time,
          type: 'exam',
          link: '/exams'
        });
      }
    }

    const attendances = await Attendance.find({ userId }).populate('subjectId', 'name');
    for (const att of attendances) {
      if (att.totalClasses >= 5) {
        const pct = Math.round((att.attendedClasses / att.totalClasses) * 100);
        if (pct < 75) {
          const title = 'Attendance Alert: ' + (att.subjectId?.name || 'Subject');
          const existing = await Notification.findOne({ userId, title, createdAt: { $gte: new Date(now.getTime() - 72 * 60 * 60 * 1000) } });
          if (!existing) {
            await Notification.create({
              userId,
              title,
              message: 'Attendance in ' + att.subjectId?.name + ' is ' + pct + '% (below 75%).',
              type: 'attendance',
              link: '/attendance'
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('Notification generator warning:', err.message);
  }
};

module.exports = { checkAndGenerateUserNotifications };
