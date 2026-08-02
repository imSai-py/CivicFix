import React from 'react';
import { IssuePriority, IssueStatus } from '../types';

interface StatusBadgeProps {
  status?: IssueStatus;
  priority?: IssuePriority;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority }) => {
  if (status) {
    const statusStyles: Record<IssueStatus, string> = {
      SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      ACKNOWLEDGED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      IN_PROGRESS: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>
        {status}
      </span>
    );
  }

  if (priority) {
    const priorityStyles: Record<IssuePriority, string> = {
      LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityStyles[priority]}`}>
        {priority}
      </span>
    );
  }

  return null;
};
