
import React, { useState, useEffect } from 'react';
import { Clock, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate, getPriorityColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export const StudyPlannerPage = () => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    duration: 45,
    priority: 'Medium'
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [res, subRes] = await Promise.all([
        api.get('/study-tasks'),
        api.get('/subjects')
      ]);
      if (res.success) setTasks(res.tasks || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load study tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      duration: 45,
      priority: 'Medium'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const res = await api.put('/study-tasks/' + editingTask._id, formData);
        if (res.success) {
          toast.success('Study task updated');
          fetchTasks();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/study-tasks', formData);
        if (res.success) {
          toast.success('Study session scheduled!');
          fetchTasks();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch('/study-tasks/' + id + '/toggle');
      if (res.success) {
        toast.success(res.task.completed ? 'Study session completed! ??' : 'Task reopened');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete('/study-tasks/' + deleteId);
      if (res.success) {
        toast.success('Study task deleted');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const totalStudyMinutes = tasks.filter(t => t.completed).reduce((a, c) => a + (c.duration || 45), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Daily Study Planner</h1>
          <p className="text-xs text-slate-500 mt-1">Plan and log focused deep-work study sprints, algorithm practices, and revision blocks</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Study Session
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Study Session Productivity</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Completed <strong>{tasks.filter(t => t.completed).length}</strong> of <strong>{tasks.length}</strong> planned study tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary-50 dark:bg-primary-950/60 rounded-xl text-center border border-primary-100 dark:border-primary-900">
            <span className="text-lg font-black text-primary-600 dark:text-primary-400">{Math.round((totalStudyMinutes / 60) * 10) / 10}h</span>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Time</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No study tasks planned"
          message="Block out 45-minute focused sprints to master key engineering topics."
          actionLabel="Add Study Task"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t._id}
              className={'flex items-center justify-between p-4 rounded-2xl border transition-all ' + (
                t.completed
                  ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
              )}
            >
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleToggle(t._id)}
                  className={'w-6 h-6 rounded-lg flex items-center justify-center border transition-all ' + (
                    t.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
                  )}
                >
                  {t.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={'text-sm font-bold ' + (t.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100')}>
                      {t.title}
                    </h4>
                    <span className={'text-[10px] px-2 py-0.2 rounded-full font-bold ' + getPriorityColor(t.priority)}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{t.subjectId?.name || 'General Study'}</span>
                    <span>�</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {t.startTime} ({t.duration} mins)
                    </span>
                    <span>�</span>
                    <span>{formatDate(t.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(t._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Study Session">
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Study Goal / Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Practice 5 Graph Traversal problems on LeetCode"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
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
              Add to Schedule
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to remove this study task?"
      />
    </div>
  );
};
