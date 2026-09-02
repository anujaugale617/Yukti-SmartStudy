
const Exam = require('../models/Exam');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Flashcard = require('../models/Flashcard');

const getSmartRecommendations = async (userId) => {
  const recommendations = [];
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingExams = await Exam.find({
    userId,
    date: { $gte: now, $lte: sevenDays }
  }).populate('subjectId', 'name code color').sort({ date: 1 });

  if (upcomingExams.length > 0) {
    const nextExam = upcomingExams[0];
    const diffDays = Math.max(1, Math.ceil((new Date(nextExam.date) - now) / (1000 * 60 * 60 * 24)));
    recommendations.push({
      id: 'rec-exam-' + nextExam._id,
      type: 'exam',
      priority: 'high',
      title: 'Prepare for ' + (nextExam.subjectId?.name || nextExam.title) + ' Exam',
      description: 'Your ' + nextExam.type + ' exam is in ' + diffDays + ' day(s). Practice with an AI quiz now.',
      actionText: 'Start AI Quiz',
      actionLink: '/quizzes',
      subject: nextExam.subjectId?.name,
      badge: 'In ' + diffDays + ' days'
    });
  }

  const attendances = await Attendance.find({ userId }).populate('subjectId', 'name code');
  for (const att of attendances) {
    if (att.totalClasses > 0) {
      const pct = Math.round((att.attendedClasses / att.totalClasses) * 100);
      if (pct < 75) {
        const needed = Math.max(1, Math.ceil((0.75 * att.totalClasses - att.attendedClasses) / 0.25));
        recommendations.push({
          id: 'rec-att-' + att._id,
          type: 'attendance',
          priority: 'high',
          title: 'Attendance Warning: ' + (att.subjectId?.name || 'Subject'),
          description: 'Current attendance is ' + pct + '% (below 75%). Attend the next ' + needed + ' classes to reach 75%.',
          actionText: 'View Attendance',
          actionLink: '/attendance',
          subject: att.subjectId?.name,
          badge: pct + '% Attendance'
        });
        break;
      }
    }
  }

  const pendingAssignments = await Assignment.find({
    userId,
    status: { $ne: 'Completed' },
    dueDate: { $gte: now }
  }).populate('subjectId', 'name code').sort({ dueDate: 1 });

  if (pendingAssignments.length > 0) {
    const nextAssignment = pendingAssignments[0];
    const diffHours = Math.round((new Date(nextAssignment.dueDate) - now) / (1000 * 60 * 60));
    recommendations.push({
      id: 'rec-assign-' + nextAssignment._id,
      type: 'assignment',
      priority: nextAssignment.priority === 'High' ? 'high' : 'medium',
      title: 'Complete Assignment: ' + nextAssignment.title,
      description: 'Due in ' + (diffHours < 24 ? diffHours + ' hours' : Math.ceil(diffHours / 24) + ' days') + ' for ' + (nextAssignment.subjectId?.name || 'Subject'),
      actionText: 'Assignments',
      actionLink: '/assignments',
      subject: nextAssignment.subjectId?.name,
      badge: nextAssignment.priority + ' Priority'
    });
  }

  const unmastered = await Flashcard.countDocuments({ userId, mastered: false });
  if (unmastered > 0) {
    recommendations.push({
      id: 'rec-flash',
      type: 'study',
      priority: 'medium',
      title: 'Active Recall Revision',
      description: 'You have ' + unmastered + ' flashcards waiting for review.',
      actionText: 'Review Flashcards',
      actionLink: '/flashcards',
      badge: unmastered + ' cards'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-default',
      type: 'study',
      priority: 'low',
      title: 'Maintain Consistent Study Habits ??',
      description: 'You are all caught up! Use the AI Assistant to explore new topics or test yourself.',
      actionText: 'AI Assistant',
      actionLink: '/ai-assistant',
      badge: 'All Caught Up'
    });
  }

  return recommendations;
};

module.exports = { getSmartRecommendations };
