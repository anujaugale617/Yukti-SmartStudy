
import React from 'react';
import { Bell, Check, Trash2, Calendar, CheckSquare, GraduationCap, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'assignment': return <CheckSquare className="w-5 h-5 text-amber-500" />;
      case 'exam': return <GraduationCap className="w-5 h-5 text-purple-500" />;
      case 'attendance': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      default: return <Sparkles className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">Automated deadline reminders, exam countdowns, and attendance alerts</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50"
          >
            <Check className="w-4 h-4 text-emerald-500" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          message="No notifications or alerts pending for your account."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={'flex items-start justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ' + (
                n.read 
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80' 
                  : 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200/80 dark:border-primary-900/60 shadow-xs'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{formatDate(n.createdAt)}</span>
                    {n.link && (
                      <>
                        <span>�</span>
                        <button
                          onClick={() => { if (!n.read) markAsRead(n._id); navigate(n.link); }}
                          className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
                        >
                          View Details ?
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n._id)}
                    title="Mark as read"
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(n._id)}
                  title="Delete notification"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
