import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, Clock, Building2, UserCheck, Image as ImageIcon, MapPin, X, Camera } from 'lucide-react';
import { issuesApi, getAttachmentUrl } from '../services/api';
import { Issue, IssueStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments] = useState<{ id: string; name: string }[]>([
    { id: 'PW_ROADS', name: 'Public Works & Roads' },
    { id: 'ELEC_LIGHTS', name: 'Electrical & Street Lighting' },
    { id: 'WATER_SAN', name: 'Water Supply & Sanitation' },
    { id: 'WASTE_MGMT', name: 'Waste Management & Environment' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [remarks, setRemarks] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'assign' | 'status' | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>('IN_PROGRESS');

  // Lightbox Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{ url: string; fileName: string } | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.list({ limit: 100 });
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

  const handleAssign = async (issue: Issue) => {
    if (!selectedDepartmentId) {
      alert('Please select a target municipal department.');
      return;
    }
    try {
      await issuesApi.assign(issue.id, selectedDepartmentId, remarks || 'Assigned to field maintenance department');
      setRemarks('');
      setSelectedDepartmentId('');
      setActionType(null);
      setSelectedIssue(null);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Department assignment failed.');
    }
  };

  const handleUpdateStatus = async (issue: Issue) => {
    try {
      await issuesApi.updateStatus(
        issue.id,
        newStatus,
        remarks || `Status updated to ${newStatus}`,
        newStatus === 'RESOLVED' ? resolutionPhotoUrl : undefined,
        newStatus === 'RESOLVED' ? resolutionNotes : undefined
      );
      setRemarks('');
      setResolutionPhotoUrl('');
      setResolutionNotes('');
      setActionType(null);
      setSelectedIssue(null);
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Status update failed.');
    }
  };

  // Analytics Metrics
  const totalReports = issues.length;
  const pendingApproval = issues.filter((i) => i.status === 'SUBMITTED').length;
  const inProgressCount = issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACKNOWLEDGED').length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-amber-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Municipal Operations Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Administrative Triage & Department Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review submitted citizen reports, assign field maintenance crews, and manage audit lifecycles.</p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all shadow-md"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Operations Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Submissions</span>
            <div className="text-2xl font-bold text-white mt-1">{totalReports}</div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-300">Pending Approval</span>
            <div className="text-2xl font-bold text-white mt-1">{pendingApproval}</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300">In Progress / Assigned</span>
            <div className="text-2xl font-bold text-white mt-1">{inProgressCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-300">Resolution Rate</span>
            <div className="text-2xl font-bold text-white mt-1">{resolutionRate}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Moderation Triage Queue Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-base font-bold text-white">Active Operations Queue ({issues.length})</h3>
            <p className="text-xs text-slate-400">Click actions to approve, reassign, or update field work status</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-500 text-sm">Loading queue items...</div>
        ) : issues.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">No items in moderation queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Issue Details & Address</th>
                  <th className="p-4">Status & Priority</th>
                  <th className="p-4">Photos</th>
                  <th className="p-4">Reported Date</th>
                  <th className="p-4">Upvotes</th>
                  <th className="p-4 text-right">Official Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white text-sm">{issue.title}</div>
                      <div className="text-slate-400 text-xs line-clamp-2 mt-0.5">{issue.description}</div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{issue.location.address || `${issue.location.latitude.toFixed(4)}, ${issue.location.longitude.toFixed(4)}`}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col space-y-1.5">
                        <StatusBadge status={issue.status} />
                        <StatusBadge priority={issue.priority} />
                      </div>
                    </td>

                    <td className="p-4">
                      {issue.attachments && issue.attachments.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: getAttachmentUrl(issue.attachments[0].file_path), fileName: issue.attachments[0].file_name })}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-indigo-600/20 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View ({issue.attachments.length})</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 italic">No media</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-mono font-bold text-indigo-400">
                      👍 {issue.upvote_count}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {issue.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setActionType('approve');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setActionType('reject');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActionType('assign');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all font-semibold"
                      >
                        Reassign Dept
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setActionType('status');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-600 hover:text-white transition-all font-semibold"
                      >
                        Update Status
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white capitalize">
              {actionType === 'approve' && 'Approve Report Submission'}
              {actionType === 'reject' && 'Reject Invalid Report'}
              {actionType === 'assign' && 'Assign Target Department'}
              {actionType === 'status' && 'Update Lifecycle Status'}
            </h3>
            <p className="text-xs text-slate-400">
              Issue Title: <span className="text-white font-semibold">{selectedIssue.title}</span>
            </p>

            {/* Department Assignment Dropdown */}
            {actionType === 'assign' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Municipal Department *</label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lifecycle Status Dropdown */}
            {actionType === 'status' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED (Approved)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Worker On-Site)</option>
                    <option value="RESOLVED">RESOLVED (Work Completed)</option>
                    <option value="REJECTED">REJECTED (Invalid Report)</option>
                  </select>
                </div>

                {newStatus === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> Resolution Proof & Completion Notes
                    </span>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Completion "After" Photo URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/repaired_pothole.jpg"
                        value={resolutionPhotoUrl}
                        onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Worker Completion Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Patching completed by Crew #4 using hot asphalt."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {actionType === 'reject' ? 'Rejection Reason (Mandatory) *' : 'Official Remarks (Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'reject'}
                placeholder="Enter official notes or remarks..."
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionType === 'approve') handleApprove(selectedIssue);
                  else if (actionType === 'reject') handleReject(selectedIssue);
                  else if (actionType === 'assign') handleAssign(selectedIssue);
                  else if (actionType === 'status') handleUpdateStatus(selectedIssue);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                Confirm {actionType.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">{previewImage.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/60 rounded-2xl p-2 max-h-[70vh] overflow-hidden">
              <img src={previewImage.url} alt={previewImage.fileName} className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
