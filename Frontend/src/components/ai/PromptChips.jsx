
import React from 'react';
import { Sparkles, HelpCircle, FileText, Calendar, Zap } from 'lucide-react';

export const PromptChips = ({ onSelectPrompt }) => {
  const prompts = [
    { label: 'Explain simply with example', icon: Sparkles, text: 'Explain this concept in simple, beginner-friendly terms with a practical real-world example.' },
    { label: 'Summarize exam topics', icon: FileText, text: 'Give me a structured summary of the most important exam topics, formulas, and viva questions.' },
    { label: 'Create 7-day study plan', icon: Calendar, text: 'Help me design an optimal 7-day revision schedule with daily 45-minute study sprints.' },
    { label: 'Top viva questions', icon: HelpCircle, text: 'What are the top 5 conceptual questions an external examiner is likely to ask during the viva examination?' },
    { label: 'Time & space complexity', icon: Zap, text: 'Explain the algorithmic time and space complexity tradeoffs compared with alternative solutions.' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {prompts.map((p, idx) => {
        const Icon = p.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(p.text)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-600 dark:hover:text-primary-400 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
          >
            <Icon className="w-3 h-3 text-primary-500" />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
