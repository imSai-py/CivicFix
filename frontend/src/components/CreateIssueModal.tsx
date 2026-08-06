import React, { useEffect, useState } from 'react';
import { X, Send, MapPin, AlertCircle } from 'lucide-react';
import { categoriesApi, issuesApi } from '../services/api';
import { Category, IssuePriority } from '../types';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [address, setAddress] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoriesApi.list().then((res) => {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }).catch(console.error);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);
          },
          () => {}
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await issuesApi.create({
        title,
        description,
        category_id: categoryId,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address || undefined,
        },
        priority,
      });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to submit issue report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0e101d] w-full max-w-xl rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,204,0.25)] border border-[#00ffcc]/40 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white font-headline">Report Civic Infrastructure Issue</h2>
          <p className="text-xs text-slate-400 font-body">Submit non-emergency municipal reports directly to city departments.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label uppercase font-bold text-slate-300 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={150}
              placeholder="e.g. Dangerous Pothole on 5th Avenue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label uppercase font-bold text-slate-300 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ffcc] transition-all"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141629] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-label uppercase font-bold text-slate-300 mb-1">Urgency Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ffcc] transition-all"
              >
                <option value="LOW" className="bg-[#141629] text-white">Low</option>
                <option value="MEDIUM" className="bg-[#141629] text-white">Medium</option>
                <option value="HIGH" className="bg-[#141629] text-white">High</option>
                <option value="CRITICAL" className="bg-[#141629] text-white">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-label uppercase font-bold text-slate-300 mb-1">Problem Description *</label>
            <textarea
              required
              rows={3}
              minLength={10}
              maxLength={2000}
              placeholder="Provide specific details about the infrastructure problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
            />
          </div>

          {/* Location Inputs */}
          <div className="p-4 rounded-2xl bg-[#141629] border border-[#232745] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-label font-bold text-[#00ffcc]">
              <MapPin className="w-4 h-4 text-[#00ffcc]" />
              <span>Location Coordinates</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-label text-slate-400 mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-[#0c0c18] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label text-slate-400 mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-[#0c0c18] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-label text-slate-400 mb-0.5">Physical Address (Optional)</label>
              <input
                type="text"
                placeholder="742 Evergreen Terrace, Market St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0c0c18] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-label uppercase font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#ff2d78] text-white font-label font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_0_15px_#ff2d78] disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
