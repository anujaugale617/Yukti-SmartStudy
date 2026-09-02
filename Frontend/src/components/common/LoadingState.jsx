
import React from 'react';

export const LoadingState = ({ message = 'Loading data...', count = 3 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse py-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-20 bg-slate-200/70 dark:bg-slate-800/60 rounded-2xl w-full"></div>
      ))}
      <p className="text-center text-xs text-slate-400 font-medium">{message}</p>
    </div>
  );
};
