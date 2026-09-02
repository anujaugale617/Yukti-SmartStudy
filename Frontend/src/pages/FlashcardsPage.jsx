
import React, { useState, useEffect } from 'react';
import { Layers, Plus, Sparkles, Filter, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import { FlashcardDeck } from '../components/flashcards/FlashcardDeck';
import { AIFlashcardModal } from '../components/flashcards/AIFlashcardModal';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import toast from 'react-hot-toast';

export const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [masteredFilter, setMasteredFilter] = useState('All');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    question: '',
    answer: ''
  });

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (subjectFilter !== 'All') params.append('subjectId', subjectFilter);
      if (masteredFilter !== 'All') params.append('mastered', masteredFilter === 'Mastered');

      const [res, subRes] = await Promise.all([
        api.get('/flashcards?' + params.toString()),
        api.get('/subjects')
      ]);

      if (res.success) setFlashcards(res.flashcards || []);
      if (subRes.success) {
        setSubjects(subRes.subjects || []);
        if (subRes.subjects.length > 0 && !formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: subRes.subjects[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [subjectFilter, masteredFilter]);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/flashcards', formData);
      if (res.success) {
        toast.success('Flashcard created!');
        fetchFlashcards();
        setCreateModalOpen(false);
        setFormData({ subjectId: subjects[0]?._id || '', topic: '', question: '', answer: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create flashcard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Active Recall Flashcards</h1>
          <p className="text-xs text-slate-500 mt-1">Study definitions, complex proofs, and viva concepts with 3D flip card decks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 inline mr-1" /> New Card
          </button>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" /> Generate AI Cards
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
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

        <select
          value={masteredFilter}
          onChange={(e) => setMasteredFilter(e.target.value)}
          className="text-xs py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="All">All Cards</option>
          <option value="Mastered">Mastered Only</option>
          <option value="Revision">Needs Revision</option>
        </select>
      </div>

      {/* Flashcard 3D Deck */}
      {loading ? (
        <LoadingState count={3} />
      ) : (
        <FlashcardDeck cards={flashcards} onCardUpdated={fetchFlashcards} />
      )}

      {/* AI Modal */}
      <AIFlashcardModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        subjects={subjects}
        onGenerated={fetchFlashcards}
      />

      {/* Manual Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Study Flashcard">
        <form onSubmit={handleCreateCard} className="space-y-4">
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. Graph Algorithms"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Front: Question / Concept</label>
            <textarea
              rows={2}
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. What is the time complexity of Dijkstra's algorithm with a Fibonacci heap?"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Back: Answer / Explanation</label>
            <textarea
              rows={3}
              required
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="e.g. O(E + V log V)..."
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Save Card
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
