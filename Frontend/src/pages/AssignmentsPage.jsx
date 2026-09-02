
import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Filter, CheckCircle2, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate, getPriorityColor, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Not Started'
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (subjectFilter !== 'All') params.append('subjectId', subjectFilter);
      if (search) params.append('search', search);

      const [res, subRes] = await Promise.all([
        api.get('/assignments?' + params.toString()),
        api.get('/subjects')
      ]);

      if (res.success) setAssignments(res.assignments || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, priorityFilter, subjectFilter, search]);

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Not Started'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setEditingAssignment(a);
    setFormData({
      subjectId: a.subjectId?._id || a.subjectId || '',
      title: a.title,
      description: a.description || '',
      dueDate: new Date(a.dueDate).toISOString().split('T')[0],
      priority: a.priority || 'Medium',
      status: a.status || 'Not Started'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        const res = await api.put('/assignments/' + editingAssignment._id, formData);
        if (res.success) {
          toast.success('Assignment updated');
          fetchAssignments();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/assignments', formData);
        if (res.success) {
          toast.success('Assignment created');
          fetchAssignments();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
    try {
      const res = await api.patch('/assignments/' + id + '/status', { status: nextStatus });
      if (res.success) {
        toast.success(nextStatus === 'Completed' ? 'Assignment marked complete! ??' : 'Status updated');
        fetchAssignments();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete('/assignments/' + deleteId);
      if (res.success) {
        toast.success('Assignment deleted');
        fetchAssignments();
      }
    } catch (err) {
      toast.error('Failed to delete assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Assignment Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">Keep track of problem sets, lab reports, and case studies with overdue detection</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="All">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="All">All Subjects</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Assignment List */}
      {loading ? (
        <LoadingState count={3} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          message="You have no pending assignments matching the selected filters."
          actionLabel="Create Assignment"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const isOverdue = a.status !== 'Completed' && new Date(a.dueDate) < new Date();
            return (
              <div
                key={a._id}
                className={'flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ' + (
                  a.status === 'Completed'
                    ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
                )}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(a._id, a.status)}
                    className={'w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 ' + (
                      a.status === 'Completed'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
                    )}
                  >
                    {a.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={'text-sm font-bold ' + (a.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100')}>
                        {a.title}
                      </h4>
                      <span className={'text-[10px] px-2 py-0.2 rounded-full font-bold ' + getPriorityColor(a.priority)}>
                        {a.priority}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{a.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{a.subjectId?.name || 'Subject'}</span>
                      <span>�</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {formatDate(a.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(a._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAssignment ? 'Edit Assignment' : 'Add Assignment'}>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement Banker's Algorithm Simulation"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Guidelines</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Submission instructions and deliverables..."
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
              {editingAssignment ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to remove this assignment record?"
      />
    </div>
  );
};
