
import React from 'react';
import { getPriorityColor, getStatusColor } from '../../utils/helpers';

export const Badge = ({ children, variant = 'status', type }) => {
  const colorClass = variant === 'priority' 
    ? getPriorityColor(type || children)
    : getStatusColor(type || children);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {children}
    </span>
  );
};
