const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const examRoutes = require('./routes/examRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const goalRoutes = require('./routes/goalRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quizRoutes = require('./routes/quizRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();

// ============================================
// Security and Utility Middlewares
// ============================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ============================================
// Serve Uploaded Files
// ============================================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// Root Route
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Yukti Backend Server is running',
  });
});

// ============================================
// Health Check
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Yukti - Smart Study Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);

app.use('/api/subjects', subjectRoutes);

app.use('/api/timetable', timetableRoutes);

app.use('/api/assignments', assignmentRoutes);

app.use('/api/exams', examRoutes);

app.use('/api/attendance', attendanceRoutes);

app.use('/api/goals', goalRoutes);

app.use('/api/study-tasks', taskRoutes);

app.use('/api/notes', noteRoutes);

app.use('/api/quizzes', quizRoutes);

app.use('/api/flashcards', flashcardRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/seed', seedRoutes);

// ============================================
// Error Handling Middlewares
// ============================================

app.use(notFound);

app.use(errorHandler);

module.exports = app;