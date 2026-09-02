
import React from 'react';
import { Sparkles, Calendar, BookOpen, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WelcomeSection = ({ user, onQuickQuiz }) => {
  const navigate = useNavigate();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-700 text-white p-6 sm:p-8 shadow-lg shadow-primary-500/10 mb-8">
      {/* Background Decorative Rings */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-40 -top-10 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold tracking-wider uppercase mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Student'} ??
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Welcome to your Yukti academic workspace. Track assignments, test yourself with AI quizzes, and optimize your study schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ai-assistant')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold transition-colors border border-white/20 shadow-sm"
          >
            <Bot className="w-4 h-4" /> Ask AI Assistant
          </button>
          <button
            type="button"
            onClick={onQuickQuiz || (() => navigate('/quizzes'))}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-md shadow-black/10"
          >
            <Sparkles className="w-4 h-4 text-primary-600" /> Start AI Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
