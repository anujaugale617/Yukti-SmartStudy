
import React from 'react';
import { UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AttendanceWidget = ({ overall = { percentage: 100 }, records = [] }) => {
  const navigate = useNavigate();
  const isWarning = overall.percentage < 75;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance Overview</h3>
        </div>
        <button
          onClick={() => navigate('/attendance')}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Details
        </button>
      </div>

      {/* Overall Progress Gauge */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-4">
        <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${isWarning ? 'text-rose-500' : 'text-emerald-500'} transition-all duration-1000`}
              strokeDasharray={`${overall.percentage || 0}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-slate-800 dark:text-slate-100">
            {overall.percentage}%
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {isWarning ? 'Attendance Risk Alert' : 'Overall Safe Status'}
            </span>
            {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {overall.attendedClasses} attended out of {overall.totalClasses} total classes.
          </p>
        </div>
      </div>

      {/* Subject mini-bars */}
      <div className="space-y-2.5">
        {records.slice(0, 3).map((r) => (
          <div key={r._id || r.subject?._id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {r.subject?.name}
              </span>
              <span className={`font-bold ${r.percentage < 75 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                {r.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${r.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, r.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
