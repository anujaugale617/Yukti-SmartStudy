
import React from 'react';
import { Clock, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TodaySchedule = ({ classes = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Today's Schedule</h3>
        </div>
        <button
          onClick={() => navigate('/timetable')}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          View Timetable
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No classes scheduled for today!</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Use this time for self-study or revision.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c, idx) => (
            <div 
              key={c._id || idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.subjectId?.color || '#3b82f6' }}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.subjectId?.name || 'Class'}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> {c.startTime} - {c.endTime}
                    </span>
                    {c.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {c.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {c.subjectId?.code || 'CS'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
