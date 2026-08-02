import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { issuesApi } from '../services/api';
import { Issue } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.list({ per_page: 50 });
      setIssues(res.data.items || []);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (issue: Issue) => {
    try {
      await issuesApi.approve(issue.id, remarks || 'Report approved by department official.');
      setRemarks('');
      setActionType(null);
      setSelectedIssue(null);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Approval failed.');
    }
  };

  const handleReject = async (issue: Issue) => {
    if (!remarks) {
      alert('Mandatory rejection remarks required.');
      return;
    }
    try {
      await issuesApi.reject(issue.id, remarks);
      setRemarks('');
      setActionType(null);
      setSelectedIssue(null);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Rejection failed.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Official Moderation Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Department Operations Console</h1>
        </div>

        <button
          onClick={fetchQueue}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Moderation Queue Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Active Queue Submissions ({issues.length})</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading queue items...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No items in moderation queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Issue Details</th>
                  <th className="p-4">Status & Priority</th>
                  <th className="p-4">Reported Date</th>
                  <th className="p-4">Upvotes</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{issue.title}</div>
                      <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">{issue.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={issue.status} />
                        <StatusBadge priority={issue.priority} />
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono font-semibold text-indigo-400">
                      👍 {issue.upvote_count}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActionType('approve');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActionType('reject');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all font-medium"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation Confirmation Modal */}
      {selectedIssue && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">
              {actionType === 'approve' ? 'Approve Report' : 'Reject Report'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Issue: <span className="text-white font-semibold">{selectedIssue.title}</span>
            </p>

            <div className="mb-4">
              <label className="block text-xs text-slate-300 mb-1">
                {actionType === 'reject' ? 'Rejection Reason (Mandatory) *' : 'Official Remarks (Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'reject'}
                placeholder="Enter remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedIssue(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => (actionType === 'approve' ? handleApprove(selectedIssue) : handleReject(selectedIssue))}
                className={`px-4 py-2 rounded-xl text-xs font-medium text-white transition-all ${
                  actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
