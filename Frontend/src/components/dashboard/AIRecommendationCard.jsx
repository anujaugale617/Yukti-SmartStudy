
import React from 'react';
import { Sparkles, ArrowRight, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIRecommendationCard = ({ recommendation }) => {
  const navigate = useNavigate();
  if (!recommendation) return null;

  const getIcon = () => {
    switch (recommendation.type) {
      case 'exam': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'attendance': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'assignment': return <BookOpen className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <div className="rounded-2xl border border-primary-200/80 dark:border-primary-900/60 bg-gradient-to-br from-primary-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/30 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-primary-100 dark:border-slate-700">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary-600 dark:text-primary-400">
                Smart Recommendation
              </span>
              {recommendation.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300">
                  {recommendation.badge}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{recommendation.title}</h4>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
        {recommendation.description}
      </p>

      <button
        type="button"
        onClick={() => navigate(recommendation.actionLink || '/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group"
      >
        <span>{recommendation.actionText || 'Take Action'}</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
