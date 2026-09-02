
const Quiz = require('../models/Quiz');

const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate('subjectId', 'name code color')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('subjectId', 'name code color');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { subjectId, title, topic, difficulty, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide title and questions' });
    }

    const quiz = await Quiz.create({
      userId: req.user._id,
      subjectId: subjectId || null,
      title,
      topic: topic || '',
      difficulty: difficulty || 'Medium',
      questions,
      totalQuestions: questions.length,
      score: null
    });

    const populated = await Quiz.findById(quiz._id).populate('subjectId', 'name code color');
    res.status(201).json({ success: true, quiz: populated });
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of selected answers or object map { questionIndex: selectedOption }
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const userAns = Array.isArray(answers) ? answers[idx] : answers[idx];
      q.userAnswer = userAns || null;
      if (userAns && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100);
    quiz.score = scorePct;
    quiz.completedAt = new Date();
    await quiz.save();

    const populated = await Quiz.findById(quiz._id).populate('subjectId', 'name code color');
    res.json({
      success: true,
      quiz: populated,
      result: {
        score: scorePct,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed: scorePct >= 60
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Quiz.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  deleteQuiz
};
