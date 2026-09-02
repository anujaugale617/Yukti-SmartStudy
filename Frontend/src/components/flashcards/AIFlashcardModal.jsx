
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AIFlashcardModal = ({ isOpen, onClose, subjects = [], onGenerated }) => {
  const [subjectId, setSubjectId] = useState(subjects[0]?._id || '');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(6);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSub = subjects.find(s => s._id === subjectId);
    const subjectName = selectedSub ? selectedSub.name : 'Engineering';

    setLoading(true);
    try {
      const res = await api.post('/ai/generate-flashcards', {
        subject: subjectName,
        topic,
        count,
        noteContent
      });

      if (res.success && res.flashcards?.length > 0) {
        for (const card of res.flashcards) {
          await api.post('/flashcards', {
            subjectId: subjectId || null,
            topic: card.topic || topic || subjectName,
            question: card.question,
            answer: card.answer
          });
        }

        toast.success(res.flashcards.length + ' AI Flashcards created!');
        if (onGenerated) onGenerated();
        onClose();
      } else {
        toast.error('Could not generate flashcards. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate AI Flashcards" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Key Concepts</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. ACID Properties, Deadlocks, Paging, OSI Layers"
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Number of Cards</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value={4}>4 Cards</option>
            <option value={6}>6 Cards</option>
            <option value={10}>10 Cards</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes Excerpt (Optional)</label>
          <textarea
            rows={2}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Paste syllabus excerpts for custom cards..."
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
