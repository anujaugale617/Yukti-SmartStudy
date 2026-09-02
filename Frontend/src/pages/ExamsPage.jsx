
import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Calendar, Clock, MapPin, Trash2, Edit2, BookOpen } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    type: 'Midterm',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 AM - 12:00 PM',
    venue: 'Main Examination Hall',
    syllabus: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, subRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects')
      ]);
      if (res.success) setExams(res.exams || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      title: '',
      type: 'Midterm',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM - 12:00 PM',
      venue: 'Main Examination Hall',
      syllabus: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (e) => {
    setEditingExam(e);
    setFormData({
      subjectId: e.subjectId?._id || e.subjectId || '',
      title: e.title,
      type: e.type || 'Midterm',
      date: new Date(e.date).toISOString().split('T')[0],
      time: e.time || '',
      venue: e.venue || '',
      syllabus: e.syllabus || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        const res = await api.put('/exams/' + editingExam._id, formData);
        if (res.success) {
          toast.success('Exam schedule updated');
          fetchData();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/exams', formData);
        if (res.success) {
          toast.success('Exam scheduled');
          fetchData();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete('/exams/' + deleteId);
      if (res.success) {
        toast.success('Exam removed');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Examination Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">Countdown timers, venue details, and syllabus milestones for your semester exams</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <LoadingState count={3} />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams scheduled"
          message="Keep yourself prepared by recording internal tests, practicals, midterms, and finals."
          actionLabel="Schedule Exam"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((e) => {
            const now = new Date();
            const examDate = new Date(e.date);
            const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
            const isPast = diffDays < 0;

            return (
              <div
                key={e._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: e.subjectId?.color || '#8b5cf6' }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {e.type}
                    </span>
                    <span className={'text-xs font-extrabold px-3 py-1 rounded-xl ' + (
                      isPast 
                        ? 'bg-slate-100 text-slate-500' 
                        : diffDays <= 3 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    )}>
                      {isPast ? 'Completed' : diffDays === 0 ? 'Today!' : diffDays + ' Days Remaining'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-3">{e.title}</h3>
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                    {e.subjectId?.name} ({e.subjectId?.code})
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(e.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{e.time}</span>
                    </div>
                    {e.venue && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Venue: {e.venue}</span>
                      </div>
                    )}
                  </div>

                  {e.syllabus && (
                    <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary-500" /> Syllabus Modules:
                      </p>
                      <p className="leading-relaxed text-slate-500 dark:text-slate-400">{e.syllabus}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(e)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 rounded-xl"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(e._id)}
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

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingExam ? 'Edit Exam' : 'Schedule Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exam Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Midterm Theory Examination"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exam Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Internal">Internal Assessment</option>
                <option value="Practical">Practical / Lab Exam</option>
                <option value="Midterm">Midterm Examination</option>
                <option value="End Semester">End Semester Theory</option>
                <option value="Viva">Viva Voce</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="10:00 AM - 01:00 PM"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue / Room</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Auditorium / Hall B"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Syllabus Overview</label>
            <textarea
              rows={3}
              value={formData.syllabus}
              onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
              placeholder="Units 1 to 4 topics..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              {editingExam ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Exam"
        message="Are you sure you want to remove this examination from your schedule?"
      />
    </div>
  );
};
