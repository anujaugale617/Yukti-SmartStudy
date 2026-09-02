
import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, BookOpen, Layers, CheckSquare, GraduationCap } from 'lucide-react';
import api from '../services/api';
import { ChatWindow } from '../components/ai/ChatWindow';

export const AIAssistantPage = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.success) setSubjects(res.subjects || []);
      } catch (e) {}
    };
    loadSubjects();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          Yukti AI Study Assistant <Sparkles className="w-5 h-5 text-primary-500" />
        </h1>
        <p className="text-xs text-slate-500">
          Your personal academic tutor: Ask complex computer engineering questions, formulate revision strategies, and prepare for viva
        </p>
      </div>

      <ChatWindow subjects={subjects} />
    </div>
  );
};
