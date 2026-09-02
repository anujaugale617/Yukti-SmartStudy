
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  User, 
  Award, 
  FileText, 
  CheckSquare, 
  GraduationCap, 
  UserCheck, 
  Plus,
  ExternalLink,
  Bot
} from 'lucide-react';
import api from '../services/api';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate, getPriorityColor, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export const SubjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [details, setDetails] = useState({ attendance: null, assignments: [], exams: [], notes: [] });
  const [loading, setLoading] = useState(true);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects/' + id);
      if (res.success) {
        setSubject(res.subject);
        setDetails(res.details || {});
      }
    } catch (err) {
      toast.error('Failed to load subject details');
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectDetails();
  }, [id]);

  if (loading || !subject) {
    return <LoadingState count={3} message="Loading course modules..." />;
  }

  const att = details.attendance;
  const attendancePct = att && att.totalClasses > 0 ? Math.round((att.attendedClasses / att.totalClasses) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <button
        type="button"
        onClick={() => navigate('/subjects')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </button>

      {/* Hero Subject Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: subject.color || '#3b82f6' }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-slate-400">{subject.credits} Academic Credits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{subject.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 flex items-center gap-2 font-medium">
              <User className="w-4 h-4 text-slate-400" /> Faculty: {subject.teacher || 'Department Professor'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/ai-assistant')}
              className="px-4 py-2.5 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" /> Ask AI About Subject
            </button>
          </div>
        </div>

        {subject.description && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Course Description</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{subject.description}</p>
          </div>
        )}
      </div>

      {/* Linked Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Attendance Status
            </h3>
            <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (attendancePct >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400')}>
              {attendancePct}%
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Total Lectures</span>
              <strong className="text-slate-800 dark:text-slate-100">{att?.totalClasses || 0}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>Attended</span>
              <strong className="text-emerald-600">{att?.attendedClasses || 0}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Absent</span>
              <strong className="text-rose-600">{Math.max(0, (att?.totalClasses || 0) - (att?.attendedClasses || 0))}</strong>
            </div>
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" /> Upcoming Exams
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{details.exams.length}</span>
          </div>

          <div className="space-y-2.5">
            {details.exams.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No exams scheduled</p>
            ) : (
              details.exams.map((e) => (
                <div key={e._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{e.title}</p>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{e.type}</span>
                    <span>{formatDate(e.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes & Study Files */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Notes & Materials
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{details.notes.length}</span>
          </div>

          <div className="space-y-2.5">
            {details.notes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No notes uploaded yet</p>
            ) : (
              details.notes.map((n) => (
                <div key={n._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{n.title}</span>
                  <a
                    href={n.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-[11px] font-bold"
                  >
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
