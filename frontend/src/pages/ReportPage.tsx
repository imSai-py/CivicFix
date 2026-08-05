import React, { useState, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, AlertCircle, ArrowRight, X, Sparkles } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-8 my-6">
      {/* Step Header matching Stitch Screen 4 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold text-on-surface">Report Issue</h1>
          <span className="font-label text-sm text-secondary neon-text-secondary tracking-widest uppercase font-bold">Step 01 // 03</span>
        </div>
        <p className="font-body text-on-surface-variant text-sm">Document the problem to help us route it to the right department.</p>
      </section>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Evidence Photo Dropzone matching Stitch Screen 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Evidence</h2>
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-secondary/40 bg-surface-dim">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-background/80 text-on-surface hover:text-rose-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="w-full h-48 rounded-xl bg-surface-container flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:bg-surface-container-high neon-border-primary group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-8 h-8 text-primary neon-text-primary" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-headline font-semibold text-on-surface text-sm">Snap a Photo</span>
                <span className="font-body text-xs text-on-surface-variant mt-0.5">Or select from gallery</span>
              </div>
            </label>
          )}
        </section>

        {/* 2. Classification Cards matching Stitch Screen 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Classification</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`p-4 rounded-xl flex flex-col items-start gap-3 transition-all active:scale-95 text-left ${
                    isSelected
                      ? 'bg-surface-container neon-border-secondary border-secondary/50 shadow-[inset_0_0_12px_rgba(0,255,204,0.1)]'
                      : 'bg-surface-container border border-outline/30 hover:border-secondary/30 hover:bg-surface-container-high'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-secondary/20 text-secondary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-headline font-semibold text-on-surface text-xs line-clamp-1">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Issue Title & Description */}
        <section className="space-y-4">
          <div>
            <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Issue Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Broken Streetlight on 5th Ave"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container border border-outline/30 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          <div>
            <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the hazard details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container border border-outline/30 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-secondary transition-all"
            />
          </div>
        </section>

        {/* 4. Location Context matching Stitch Screen 4 */}
        <section className="flex flex-col gap-3">
          <h2 className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Location Context</h2>
          <div className="bg-surface-container border border-outline/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-secondary neon-text-secondary" />
              </div>
              <div>
                <span className="font-headline font-semibold text-sm text-on-surface block">GPS Coordinates</span>
                <span className="font-body text-xs text-on-surface-variant">
                  {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Detecting position...'}
                </span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Enter custom address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-48 bg-surface-dim border border-outline/30 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
        </section>

        {/* 5. Submit Action Button matching Stitch Screen 4 */}
        <section className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-surface-container border border-primary/50 text-primary font-headline font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 neon-btn-glow transition-all active:scale-95 group hover:border-primary"
          >
            <span className="neon-text-primary">{isSubmitting ? 'Submitting...' : 'Proceed & Submit Report'}</span>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </form>
    </div>
  );
};
