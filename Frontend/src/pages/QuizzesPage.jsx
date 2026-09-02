
import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Sparkles, Play, Trash2, Award, Clock } from 'lucide-react';
import api from '../services/api';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { AIQuizModal } from '../components/quiz/AIQuizModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const [res, subRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/subjects')
      ]);
      if (res.success) setQuizzes(res.quizzes || []);
      if (subRes.success) setSubjects(subRes.subjects || []);
    } catch (err) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete('/quizzes/' + deleteId);
      if (res.success) {
        toast.success('Quiz removed');
        fetchQuizzes();
      }
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  if (activeQuiz) {
    return (
      <div className="space-y-6">
        <QuizRunner
          quiz={activeQuiz}
          onFinish={() => { setActiveQuiz(null); fetchQuizzes(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Interactive Quizzes & Self-Testing</h1>
          <p className="text-xs text-slate-500 mt-1">Generate AI-powered multiple-choice quizzes with timer, scoring, and instant explanations</p>
        </div>
        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Quiz
        </button>
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          message="Use the AI Quiz Generator to create custom practice tests on any computer science subject."
          actionLabel="Generate AI Quiz"
          onAction={() => setAiModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((q) => {
            const hasScore = q.score !== null;
            return (
              <div
                key={q._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: q.subjectId?.color || '#3b82f6' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.difficulty} Difficulty
                    </span>
                    {hasScore && (
                      <span className={'text-xs font-black px-2.5 py-0.5 rounded-full ' + (q.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400')}>
                        Score: {q.score}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">{q.title}</h3>
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                    {q.subjectId?.name || 'General Computer Science'}
                  </p>

                  <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> {q.questions?.length || q.totalQuestions} Questions
                    </span>
                    <span>�</span>
                    <span>{formatDate(q.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(q)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> {hasScore ? 'Retake Quiz' : 'Start Quiz'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteId(q._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      <AIQuizModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        subjects={subjects}
        onQuizGenerated={(newQuiz) => { fetchQuizzes(); setActiveQuiz(newQuiz); }}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this practice quiz?"
      />
    </div>
  );
};
