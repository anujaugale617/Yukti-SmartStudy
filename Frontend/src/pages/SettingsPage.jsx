
import React, { useState } from 'react';
import { Settings, Sun, Moon, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { logout, seedDemoData } = useAuth();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await seedDemoData();
    setSeeding(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">Configure appearance themes, demo datasets, and notification thresholds</p>
      </div>

      <div className="space-y-4">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Appearance Theme</h3>
          <p className="text-xs text-slate-400 mb-4">Choose your preferred visual mode</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'system', label: 'System Mode', icon: Settings },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={'p-4 rounded-2xl border text-center transition-all ' + (
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-900 dark:text-primary-200 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  )}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Data Seeder for Viva / Demonstration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" /> Viva / Demo Data Population
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Instantly populate your account with 5 core Computer Engineering subjects (Data Structures, Networks, DBMS, Operating Systems, AI), complete with timetable, active assignments, exam countdowns, attendance records, study tasks, and flashcards.
          </p>

          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={'w-4 h-4 ' + (seeding ? 'animate-spin' : '')} />
            {seeding ? 'Seeding 5 Engineering Courses...' : 'One-Click Seed Realistic Demo Data'}
          </button>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Sign Out</h3>
            <p className="text-xs text-slate-400">Log out of your active student session on this device</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-200 dark:border-rose-900"
          >
            <LogOut className="w-4 h-4 inline mr-1" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};
