
const {
  generateAIQuiz,
  generateAIFlashcards,
  generateAISummary,
  generateAIStudyPlan,
  chatWithAIAssistant
} = require('../services/aiService');
const { getSmartRecommendations } = require('../services/recommendationService');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');

const generateQuizHandler = async (req, res, next) => {
  try {
    const { subject, topic, numberOfQuestions, difficulty, noteContent } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const result = await generateAIQuiz({
      subject,
      topic,
      numberOfQuestions: Number(numberOfQuestions) || 5,
      difficulty: difficulty || 'Medium',
      noteContent
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const generateFlashcardsHandler = async (req, res, next) => {
  try {
    const { subject, topic, count, noteContent } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const result = await generateAIFlashcards({
      subject,
      topic,
      count: Number(count) || 6,
      noteContent
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const generateSummaryHandler = async (req, res, next) => {
  try {
    const { title, content, subject } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title or topic is required' });
    }

    const result = await generateAISummary({ title, content, subject });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const generateStudyPlanHandler = async (req, res, next) => {
  try {
    const { subject, examDate, weakTopics, daysAvailable } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }

    const result = await generateAIStudyPlan({
      subject,
      examDate,
      weakTopics,
      daysAvailable: Number(daysAvailable) || 7
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const chatHandler = async (req, res, next) => {
  try {
    const { message, subject, conversationHistory } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Build rich student context from database
    const [subjects, exams, attendances] = await Promise.all([
      Subject.find({ userId: req.user._id }).select('name code'),
      Exam.find({ userId: req.user._id, date: { $gte: new Date() } }).populate('subjectId', 'name').sort({ date: 1 }).limit(3),
      Attendance.find({ userId: req.user._id }).populate('subjectId', 'name')
    ]);

    const lowAttendance = attendances
      .filter(a => a.totalClasses > 0 && Math.round((a.attendedClasses / a.totalClasses) * 100) < 75)
      .map(a => ({
        subjectName: a.subjectId?.name,
        percentage: Math.round((a.attendedClasses / a.totalClasses) * 100)
      }));

    const formattedExams = exams.map(e => ({
      title: e.title,
      subject: e.subjectId?.name,
      daysRemaining: Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    const studentContext = {
      subjects,
      exams: formattedExams,
      lowAttendance
    };

    const result = await chatWithAIAssistant({
      message,
      subject,
      conversationHistory: conversationHistory || [],
      studentContext
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getRecommendationsHandler = async (req, res, next) => {
  try {
    const recommendations = await getSmartRecommendations(req.user._id);
    res.json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuizHandler,
  generateFlashcardsHandler,
  generateSummaryHandler,
  generateStudyPlanHandler,
  chatHandler,
  getRecommendationsHandler
};
