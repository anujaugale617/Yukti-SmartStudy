
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Download, Trash2, Tag, Upload, File, FileCode, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedNoteForSummary, setSelectedNoteForSummary] = useState(null);
  const [summaryText, setSummaryText] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (subjectFilter !== 'All') params.append('subjectId', subjectFilter);

      const [res, subRes] = await Promise.all([
        api.get('/notes?' + params.toString()),
        api.get('/subjects')
      ]);

      if (res.success) setNotes(res.notes || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, subjectFilter]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title) {
      toast.error('Please fill required fields');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('subjectId', formData.subjectId);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);
    if (selectedFile) {
      data.append('file', selectedFile);
    }

    try {
      const res = await api.post('/notes/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        toast.success('Note and material uploaded successfully!');
        fetchNotes();
        setModalOpen(false);
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateSummary = async (note) => {
    setSelectedNoteForSummary(note);
    setSummaryModalOpen(true);
    setGeneratingSummary(true);
    setSummaryText('');

    try {
      const res = await api.post('/ai/summary', {
        title: note.title,
        content: note.description,
        subject: note.subjectId?.name
      });
      if (res.success && res.summary) {
        setSummaryText(res.summary);
      } else {
        setSummaryText('Unable to generate summary at this moment.');
      }
    } catch (err) {
      toast.error('Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete('/notes/' + deleteId);
      if (res.success) {
        toast.success('Note removed');
        fetchNotes();
      }
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '450 KB';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Study Notes & Repository</h1>
          <p className="text-xs text-slate-500 mt-1">Upload lecture slides, cheatsheets, and lab manuals with AI instant summarization</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start"
        >
          <Plus className="w-4 h-4" /> Upload Study Material
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, algorithms, keywords..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

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

      {/* Notes Grid */}
      {loading ? (
        <LoadingState count={3} />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes found"
          message="Upload your semester notes, formula sheets, or lab records."
          actionLabel="Upload Material"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((n) => (
            <div
              key={n._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: n.subjectId?.color || '#3b82f6' }}
              />

              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {n.fileType?.toUpperCase() || 'PDF'} � {formatFileSize(n.fileSize)}
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDate(n.createdAt)}</span>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3">{n.title}</h3>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  {n.subjectId?.name || 'Computer Engineering'}
                </p>

                {n.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{n.description}</p>
                )}

                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {n.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSummary(n)}
                  className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 text-primary-700 dark:text-primary-300 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary-500" /> AI Summary
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={n.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={n.fileName}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleteId(n._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Study Note / Material">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Note Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Unit 3 - B+ Trees & Indexing Summary"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">File (PDF, DOC, DOCX, PPT, PPTX, Image)</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. indexing, b-plus-trees, midterm-prep"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Key Notes</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of algorithms and concepts covered..."
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
              disabled={uploading}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Save & Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Summary Modal */}
      <Modal 
        isOpen={summaryModalOpen} 
        onClose={() => setSummaryModalOpen(false)} 
        title={'AI Summary: ' + (selectedNoteForSummary?.title || 'Material')}
        maxWidth="max-w-2xl"
      >
        {generatingSummary ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Yukti AI is generating structured study summary...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
              {summaryText}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="px-5 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note and its associated file?"
      />
    </div>
  );
};
