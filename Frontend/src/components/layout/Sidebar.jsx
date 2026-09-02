
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckSquare, 
  GraduationCap, 
  UserCheck, 
  Clock, 
  Target, 
  HelpCircle, 
  Layers, 
  Bot, 
  BarChart3, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/timetable', label: 'Timetable', icon: Calendar },
  { path: '/notes', label: 'Notes & Files', icon: FileText },
  { path: '/assignments', label: 'Assignments', icon: CheckSquare },
  { path: '/exams', label: 'Exams', icon: GraduationCap },
  { path: '/attendance', label: 'Attendance', icon: UserCheck },
  { path: '/study-planner', label: 'Study Planner', icon: Clock },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { path: '/flashcards', label: 'Flashcards', icon: Layers },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Bot, isSpecial: true },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">Yukti</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-600 dark:text-primary-400">Smart Study</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/70 dark:text-primary-400 font-semibold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }
                ${item.isSpecial ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${item.isSpecial ? 'text-primary-600 dark:text-primary-400 animate-pulse' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && item.isSpecial && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">AI</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Student'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.semester || 'Third Year'}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
