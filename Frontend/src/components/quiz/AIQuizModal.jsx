
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Sparkles } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AIQuizModal = ({ isOpen, onClose, subjects = [], onQuizGenerated }) => {
  const [subjectId, setSubjectId] = useState(subjects[0]?._id || '');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSub = subjects.find(s => s._id === subjectId);
    const subjectName = selectedSub ? selectedSub.name : 'Computer Science';

    setLoading(true);
    try {
      const res = await api.post('/ai/generate-quiz', {
        subject: subjectName,
        topic,
        numberOfQuestions,
        difficulty,
        noteContent
      });

      if (res.success && res.questions?.length > 0) {
        const savedQuiz = await api.post('/quizzes', {
          subjectId: subjectId || null,
          title: 'AI ' + difficulty + ' Quiz: ' + (topic || subjectName),
          topic: topic || 'Key Concepts',
          difficulty,
          questions: res.questions
        });

        toast.success('AI Quiz generated and ready!');
        if (onQuizGenerated) onQuizGenerated(savedQuiz.quiz);
        onClose();
      } else {
        toast.error('Could not generate quiz. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate AI quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate AI Practice Quiz" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Subject</label>
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
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Keywords</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Binary Search Trees, TCP Handshake, ACID"
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Questions Count</label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Optional Notes Snippet</label>
          <textarea
            rows={2}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Paste syllabus notes to generate targeted questions..."
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
            <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
