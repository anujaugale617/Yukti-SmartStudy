
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SubjectDetailPage } from './pages/SubjectDetailPage';
import { TimetablePage } from './pages/TimetablePage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ExamsPage } from './pages/ExamsPage';
import { AttendancePage } from './pages/AttendancePage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { GoalsPage } from './pages/GoalsPage';
import { NotesPage } from './pages/NotesPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Student Portal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:id" element={<SubjectDetailPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/study-planner" element={<StudyPlannerPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
