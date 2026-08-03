import React, { useEffect, useState, useRef } from 'react';
import { Camera, Upload, MapPin, Send, AlertCircle, CheckCircle, Trash2, Shield, X, Flame, AlertTriangle, Info, Tag } from 'lucide-react';
import { categoriesApi, issuesApi } from '../services/api';
import { Category, IssuePriority } from '../types';
import { CustomDropdown, DropdownOption } from '../components/CustomDropdown';

interface ReportPageProps {
  onSuccessNavigate: () => void;
  onSwitchToLogin: () => void;
  isAuthenticated: boolean;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  onSuccessNavigate,
  onSwitchToLogin,
  isAuthenticated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [address, setAddress] = useState('');

  // Categories & Loading State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Media Attachment & Camera State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load active issue categories from backend
    categoriesApi
      .list()
      .then((res) => {
        const catList = res.data || [];
        setCategories(catList);
        if (catList.length > 0) {
          setCategoryId(catList[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });

    // Detect user geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.log('Geolocation note:', err.message)
      );
    }
  }, []);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Unable to access camera. Please allow camera permissions or attach an image file.');
    }
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      }, 'image/jpeg', 0.9);
    }
    stopCameraStream();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isAuthenticated) {
      onSwitchToLogin();
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a valid issue category.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Issue Report
      const issueRes = await issuesApi.create({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address.trim() || undefined,
        },
        priority,
      });

      const newIssueId = issueRes.data.id;

      // 2. Upload Photo Attachment if selected
      if (selectedFile && newIssueId) {
        await issuesApi.uploadAttachment(newIssueId, selectedFile);
      }

      setSuccessMessage('Civic issue report submitted successfully! Redirecting to public feed...');
      setTimeout(() => {
        onSuccessNavigate();
      }, 1500);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        'Failed to submit issue report. Please try again.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dropdown Options Configuration
  const categoryOptions: DropdownOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
    description: c.description || undefined,
    icon: <Tag className="w-3.5 h-3.5 text-indigo-400" />,
  }));

  const priorityOptions: DropdownOption[] = [
    {
      value: 'LOW',
      label: 'Low Urgency',
      badgeColor: 'bg-slate-400',
      icon: <Info className="w-3.5 h-3.5 text-slate-400" />,
    },
    {
      value: 'MEDIUM',
      label: 'Medium Urgency',
      badgeColor: 'bg-amber-400',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      value: 'HIGH',
      label: 'High Urgency',
      badgeColor: 'bg-orange-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
    },
    {
      value: 'CRITICAL',
      label: 'Critical Emergency',
      badgeColor: 'bg-rose-500',
      icon: <Flame className="w-3.5 h-3.5 text-rose-500" />,
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel p-8 rounded-3xl text-center shadow-2xl border border-indigo-500/20">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Report Civic Issue</h2>
        <p className="text-xs text-slate-400 mb-6">Please sign in to your citizen account to submit infrastructure reports.</p>
        <button
          onClick={onSwitchToLogin}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 glow-indigo">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Report Civic Issue</h1>
            <p className="text-xs text-slate-400">Submit municipal infrastructure issues directly to local authorities.</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 text-center">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Issue Title *</label>
          <input
            type="text"
            required
            minLength={5}
            maxLength={150}
            placeholder="e.g. Dangerous Pothole on Main Street"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category & Urgency Modern Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomDropdown
            label="Category *"
            options={categoryOptions}
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            placeholder="Select category"
          />

          <CustomDropdown
            label="Urgency Priority"
            options={priorityOptions}
            value={priority}
            onChange={(val) => setPriority(val as IssuePriority)}
            placeholder="Select urgency"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Description *</label>
          <textarea
            required
            rows={4}
            minLength={10}
            maxLength={2000}
            placeholder="Provide specific details about the issue location, size, or public hazard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Location Section */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
              <MapPin className="w-4 h-4" />
              <span>Location Details</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                  });
                }
              }}
              className="text-[11px] text-indigo-400 hover:underline font-semibold"
            >
              Auto-detect My Location
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Street Address (Optional)</label>
            <input
              type="text"
              placeholder="742 Evergreen Terrace, Ward 5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
            />
          </div>
        </div>

        {/* Camera & Photo Attachment Section */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <label className="block text-xs font-semibold text-slate-300">Photo Evidence (Camera or File)</label>

          {/* Action Buttons: Open Camera vs Upload File */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startCameraStream}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo with Camera</span>
            </button>

            <label className="cursor-pointer flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Attach Image File</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Live Camera Viewfinder Modal */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-indigo-500/50 p-2 space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-semibold text-indigo-300">
                <span>Live Viewfinder</span>
                <button type="button" onClick={stopCameraStream} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded-xl" />
              <button
                type="button"
                onClick={capturePhotoFromCamera}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo Now</span>
              </button>
            </div>
          )}

          {/* Photo Preview Thumbnail */}
          {previewUrl && (
            <div className="relative inline-block mt-2">
              <img
                src={previewUrl}
                alt="Photo Preview"
                className="w-32 h-32 object-cover rounded-2xl border-2 border-indigo-500/40 shadow-lg"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="block text-[10px] text-slate-400 mt-1 truncate max-w-[128px]">
                {selectedFile?.name || 'Captured Photo'}
              </span>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Report...' : 'Submit Civic Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
