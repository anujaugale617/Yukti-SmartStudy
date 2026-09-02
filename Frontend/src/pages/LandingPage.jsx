
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Bot, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="h-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-800 dark:text-white">Yukti</span>
            <span className="text-[10px] ml-1.5 uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">Smart Study</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 overflow-hidden flex-1 flex items-center">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-xs font-bold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Designed for Computer Engineering & University Students
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Intelligent Study Management & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-600">AI-Powered Revision</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage your entire semester curriculum in one unified hub: track attendance benchmarks, organize lecture notes, simulate exam quizzes, study with 3D flashcards, and learn with your AI Study Assistant.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2 group"
            >
              Launch Your Semester Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-2xl shadow-sm transition-all"
            >
              Demo Login
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 text-left">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Subject Hub</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Syllabus tracking, timetable grid, and consolidated notes library.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 w-fit mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Study Assistant</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Conversational tutor grounded in your active courses and upcoming exams.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quizzes & Flashcards</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instant active-recall testing with explanations and timer scores.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 w-fit mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Attendance & Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">75% criteria threshold alerts and overall productivity scoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <p>Yukti � Smart Study Management System &copy; 2026. Major Project in Computer Engineering.</p>
      </footer>
    </div>
  );
};
