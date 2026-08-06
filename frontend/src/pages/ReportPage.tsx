import React, { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, AlertCircle, ArrowRight, X, AlertTriangle, Lightbulb, Droplets, Trash2, Waves, Wrench, ShieldAlert } from 'lucide-react';
import { issuesApi, categoriesApi } from '../services/api';
import { Category } from '../types';

interface ReportPageProps {
  isAuthenticated: boolean;
  onSuccessNavigate: () => void;
  onSwitchToLogin: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  isAuthenticated,
  onSuccessNavigate,
  onSwitchToLogin,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.list();
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();

    // Auto-detect Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.log('Geolocation error:', err.message)
      );
    }
  }, []);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('pothole') || lower.includes('road')) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (lower.includes('light') || lower.includes('electric') || lower.includes('street')) {
      return <Lightbulb className="w-4 h-4" />;
    }
    if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak')) {
      return <Droplets className="w-4 h-4" />;
    }
    if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash')) {
      return <Trash2 className="w-4 h-4" />;
    }
    if (lower.includes('drain') || lower.includes('flood')) {
      return <Waves className="w-4 h-4" />;
    }
    return <Wrench className="w-4 h-4" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onSwitchToLogin();
      return;
    }

    if (!title || !description || !categoryId) {
      setErrorMessage('Please fill in title, description, and select a category.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create Issue
      const issueRes = await issuesApi.create({
        title,
        description,
        category_id: categoryId,
        location: {
          latitude: latitude || 37.7749,
          longitude: longitude || -122.4194,
          address: address || 'Auto-detected Geolocation',
        },
      });

      const createdIssue = issueRes.data;

      // 2. Upload Attachment if file selected
      if (file) {
        try {
          await issuesApi.uploadAttachment(createdIssue.id, file);
        } catch (uploadErr) {
          console.error('File upload failed:', uploadErr);
        }
      }

      setSuccessMessage('Report submitted successfully! Municipal officials have been notified.');
      setTimeout(() => {
        onSuccessNavigate();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to submit issue report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 my-6 px-1 sm:px-0">
      {/* Header with Meaningful Municipal Dispatch Badge */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="font-headline text-3xl font-bold text-white">Report Issue</h1>
          <span className="font-label text-xs text-[#00ffcc] tracking-widest uppercase font-bold px-3 py-1 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 shadow-[0_0_12px_#00ffcc] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>DIRECT MUNICIPAL DISPATCH</span>
          </span>
        </div>
        <p className="font-body text-slate-400 text-sm">Document the problem to help us route it to the right department.</p>
      </section>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Evidence Photo Dropzone */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-slate-400 font-bold">Evidence</h2>
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[#00ffcc]/40 bg-slate-950">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-950/80 text-white hover:text-rose-400 transition-colors border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="w-full h-48 rounded-2xl bg-[#0e101d] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-[#141629] border border-[#ff2d78]/50 hover:border-[#ff2d78] shadow-[0_0_20px_rgba(255,45,120,0.15)] group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-full bg-[#ff2d78]/15 border border-[#ff2d78]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,45,120,0.4)]">
                <Camera className="w-8 h-8 text-[#ff2d78]" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-headline font-semibold text-white text-sm">Snap a Photo</span>
                <span className="font-body text-xs text-slate-400 mt-0.5">Or select from gallery</span>
              </div>
            </label>
          )}
        </section>

        {/* 2. Category Classification Cards with Meaningful Icons */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-slate-400 font-bold">Classification</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 text-left ${
                    isSelected
                      ? 'bg-[#0e101d] border border-[#00ffcc] text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.3)] font-bold'
                      : 'bg-[#0e101d] border border-[#1b1e34] text-slate-300 hover:border-[#00ffcc]/40 hover:bg-[#141629]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#00ffcc]/20 text-[#00ffcc]' : 'bg-[#171a2e] text-slate-400'
                  }`}>
                    {getCategoryIcon(c.name)}
                  </div>
                  <span className="font-headline text-xs line-clamp-2 leading-tight">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Issue Title & Description */}
        <section className="space-y-4">
          <div>
            <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Issue Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dangerous Pothole on 5th Ave"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
            />
          </div>

          <div>
            <label className="block font-label text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the hazard details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#141629] border border-[#232745] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc] transition-all"
            />
          </div>
        </section>

        {/* 4. Location Context */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-slate-400 font-bold">Location Context</h2>
          <div className="bg-[#0e101d] border border-[#1b1e34] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#00ffcc]/15 border border-[#00ffcc]/30 text-[#00ffcc] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#00ffcc]" />
              </div>
              <div>
                <span className="font-headline font-semibold text-sm text-white block">GPS Coordinates</span>
                <span className="font-body text-xs text-slate-400">
                  {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Detecting position...'}
                </span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter custom address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full sm:w-48 bg-[#141629] border border-[#232745] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ffcc]"
            />
          </div>
        </section>

        {/* 5. Submit Action Button */}
        <section className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1e0f24] border-2 border-[#ff2d78] text-white font-headline font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,45,120,0.4)] hover:shadow-[0_0_35px_rgba(255,45,120,0.7)] transition-all active:scale-95 group cursor-pointer"
          >
            <span>{isSubmitting ? 'Submitting...' : 'Proceed & Submit Report'}</span>
            <ArrowRight className="w-5 h-5 text-[#ff2d78] group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </form>
    </div>
  );
};
