
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { PromptChips } from './PromptChips';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ChatWindow = ({ subjects = [] }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **Yukti AI Study Assistant** ??.\n\nI can help you understand complex algorithms, formulate exam revision plans, summarize notes, and practice for your semester viva examinations. What are we studying today?',
      createdAt: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: textToSend.trim(),
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/ai/chat', {
        message: textToSend.trim(),
        subject: selectedSubject,
        conversationHistory: history
      });

      if (res.success && res.reply) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.reply,
          createdAt: new Date()
        }]);
      } else {
        toast.error('Could not retrieve AI response.');
      }
    } catch (err) {
      toast.error(err.message || 'Chat service encountered an issue');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered a momentary connection issue. Please try asking again!',
        createdAt: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col h-[75vh] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Yukti AI Assistant <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active & Academic Context
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={'flex items-start gap-3 ' + (m.role === 'user' ? 'flex-row-reverse' : '')}
          >
            <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' + (
              m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            )}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={'max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ' + (
              m.role === 'user'
                ? 'bg-primary-600 text-white font-medium rounded-tr-none'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
            )}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800/70 flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-medium">Yukti AI is formulating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
        <PromptChips onSelectPrompt={(text) => handleSend(text)} />
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 mt-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your engineering syllabus, exams, algorithms..."
            className="flex-1 text-xs sm:text-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-2xl transition-colors shadow-md flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
