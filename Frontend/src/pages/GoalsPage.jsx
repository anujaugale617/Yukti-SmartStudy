
import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate, getPriorityColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    progress: 0
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [res, subRes] = await Promise.all([
        api.get('/goals'),
        api.get('/subjects')
      ]);
      if (res.success) setGoals(res.goals || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      title: '',
      description: '',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Medium',
      progress: 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setEditingGoal(g);
    setFormData({
      subjectId: g.subjectId?._id || g.subjectId || '',
      title: g.title,
      description: g.description || '',
      targetDate: new Date(g.targetDate).toISOString().split('T')[0],
      priority: g.priority || 'Medium',
      progress: g.progress || 0
    });
    setModalOpen(true);
  };

  const handleProgressChange = async (id, newProgress) => {
    try {
      const res = await api.put('/goals/' + id, { progress: newProgress });
      if (res.success) {
        setGoals(prev => prev.map(g => g._id === id ? res.goal : g));
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        const res = await api.put('/goals/' + editingGoal._id, formData);
        if (res.success) {
          toast.success('Study goal updated');
          fetchGoals();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/goals', formData);
        if (res.success) {
          toast.success('Study goal created');
          fetchGoals();
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
      const res = await api.delete('/goals/' + deleteId);
      if (res.success) {
        toast.success('Goal deleted');
        fetchGoals();
      }
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Academic Goals</h1>
          <p className="text-xs text-slate-500 mt-1">Set long-term milestones, coding practice targets, and attendance recovery benchmarks</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {loading ? (
        <LoadingState count={3} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals created yet"
          message="Set milestones for coding competitions, research papers, or syllabus completion."
          actionLabel="Create Goal"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((g) => {
            const isCompleted = g.progress === 100 || g.status === 'Completed';
            return (
              <div
                key={g._id}
                className={'bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ' + (
                  isCompleted 
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                    : 'border-slate-200/80 dark:border-slate-800'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={'text-[10px] px-2.5 py-0.5 rounded-full font-bold ' + getPriorityColor(g.priority)}>
                      {g.priority} Priority
                    </span>
                    <span className={'text-xs font-black ' + (isCompleted ? 'text-emerald-600' : 'text-primary-600 dark:text-primary-400')}>
                      {g.progress}% Complete
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">{g.title}</h3>
                  {g.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{g.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{g.subjectId?.name || 'General Target'}</span>
                    <span>�</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(g.targetDate)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                      <div
                        className={'h-full rounded-full transition-all duration-300 ' + (isCompleted ? 'bg-emerald-500' : 'bg-primary-600')}
                        style={{ width: g.progress + '%' }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={g.progress}
                      onChange={(e) => handleProgressChange(g._id, Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className={'text-xs font-semibold ' + (isCompleted ? 'text-emerald-600' : 'text-slate-500')}>
                    {isCompleted ? '? Completed Milestone' : 'In Progress'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(g)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 rounded-xl"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(g._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGoal ? 'Edit Goal' : 'Create Academic Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject (Optional)</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">General Goal</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Master B+ Tree Indexing & EXPLAIN Plans"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Target Metrics</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Quantifiable targets (e.g. 50 questions, 1 research paper draft)..."
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
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message="Are you sure you want to remove this academic goal?"
      />
    </div>
  );
};
