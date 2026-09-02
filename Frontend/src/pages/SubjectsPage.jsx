
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Edit2, Trash2, ArrowRight, User } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import toast from 'react-hot-toast';

export const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher: '',
    credits: 3,
    description: '',
    color: '#3b82f6'
  });

  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      if (res.success) setSubjects(res.subjects);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '', teacher: '', credits: 3, description: '', color: '#3b82f6' });
    setModalOpen(true);
  };

  const handleOpenEdit = (e, sub) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      teacher: sub.teacher || '',
      credits: sub.credits || 3,
      description: sub.description || '',
      color: sub.color || '#3b82f6'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        const res = await api.put('/subjects/' + editingSubject._id, formData);
        if (res.success) {
          toast.success('Subject updated successfully');
          fetchSubjects();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/subjects', formData);
        if (res.success) {
          toast.success('Subject created successfully');
          fetchSubjects();
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
      const res = await api.delete('/subjects/' + deleteId);
      if (res.success) {
        toast.success('Subject removed');
        fetchSubjects();
      }
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.teacher && s.teacher.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Semester Subjects</h1>
          <p className="text-xs text-slate-500 mt-1">Manage all your enrolled courses, faculty, and linked academic assets</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Add New Subject
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by subject name, course code, or professor..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <LoadingState count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="Create your first enrolled subject to start managing your semester."
          actionLabel="Add Subject"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate('/subjects/' + s._id)}
              className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: s.color || '#3b82f6' }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mt-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {s.code}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEdit(e, s)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(s._id); }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {s.name}
                </h3>

                {s.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[140px]">{s.teacher || 'Faculty'}</span>
                </div>
                <span className="font-semibold text-slate-600 dark:text-slate-400">{s.credits} Credits</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSubject ? 'Edit Subject' : 'Add New Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS301"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professor / Teacher Name</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              placeholder="e.g. Dr. Sunita Deshmukh"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color Tag</label>
            <div className="flex items-center gap-3">
              {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={'w-6 h-6 rounded-full border-2 transition-transform ' + (formData.color === c ? 'scale-125 border-slate-900 dark:border-white' : 'border-transparent')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Syllabus Overview / Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key syllabus modules and examination structure..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
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
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All linked timetable entries, attendance records, notes, and exams will also be removed."
      />
    </div>
  );
};
