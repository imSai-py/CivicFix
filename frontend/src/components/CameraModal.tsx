import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Disable Body Scrolling when Camera is Active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        currentStream = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError('Camera access denied or unavailable. You can choose a photo from Gallery below.');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
      onClose();
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-[99999] h-screen w-screen bg-slate-950 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
      {/* Top Controls Overlay with Prominent Cancel Button */}
      <div className="absolute top-0 left-0 right-0 z-[100000] p-4 pt-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-label uppercase font-bold hover:text-white hover:border-[#ff2d78] transition-all flex items-center gap-1.5 shadow-xl active:scale-95"
          >
            <X className="w-4 h-4 text-[#ff2d78]" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] animate-ping"></div>
            <span className="font-label text-xs uppercase tracking-widest text-[#00ffcc] font-bold hidden sm:inline">
              Live Viewfinder
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-black/60 text-white hover:text-rose-400 border border-white/20 backdrop-blur-md transition-all active:scale-95"
          title="Close Camera"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Video Viewfinder Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-6 text-center space-y-4 max-w-sm mx-auto z-10">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <p className="font-headline font-semibold text-sm text-slate-200">{cameraError}</p>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-[#00ffcc] text-slate-950 font-label text-xs uppercase tracking-wider font-bold shadow-[0_0_15px_#00ffcc]"
            >
              Open Gallery / Files
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewfinder Corner Overlays */}
        <div className="absolute inset-8 pointer-events-none border-2 border-[#00ffcc]/30 rounded-3xl flex flex-col justify-between p-4 z-20">
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-2 border-l-2 border-[#00ffcc]"></div>
            <div className="w-6 h-6 border-t-2 border-r-2 border-[#00ffcc]"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-2 border-l-2 border-[#00ffcc]"></div>
            <div className="w-6 h-6 border-b-2 border-r-2 border-[#00ffcc]"></div>
          </div>
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Shutter & Gallery Action Controls (z-[100000] ensures higher than BottomNav) */}
      <div className="relative z-[100000] p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between px-8 sm:px-16 border-t border-white/10">
        {/* Bottom Left: Gallery Icon */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          title="Open Gallery / Photos"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:border-[#00ffcc] group-hover:bg-[#00ffcc]/20 transition-all shadow-lg">
            <ImageIcon className="w-7 h-7 text-white group-hover:text-[#00ffcc]" />
          </div>
          <span className="font-label text-[10px] text-slate-300 uppercase tracking-wider font-bold">Gallery</span>
        </button>

        {/* Bottom Center: Shutter Button */}
        <button
          type="button"
          onClick={handleCapturePhoto}
          disabled={!!cameraError}
          className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform shadow-[0_0_25px_rgba(255,255,255,0.6)] disabled:opacity-50"
          title="Take Photo"
        >
          <div className="w-full h-full rounded-full bg-[#ff2d78] shadow-[0_0_20px_#ff2d78] flex items-center justify-center hover:scale-105 transition-transform">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </button>

        {/* Bottom Right: Flip Camera */}
        <button
          type="button"
          onClick={toggleCameraFacing}
          disabled={!!cameraError}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform disabled:opacity-50"
          title="Switch Front / Rear Camera"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:border-[#00ffcc] group-hover:bg-[#00ffcc]/20 transition-all shadow-lg">
            <RefreshCw className="w-6 h-6 text-white group-hover:text-[#00ffcc]" />
          </div>
          <span className="font-label text-[10px] text-slate-300 uppercase tracking-wider font-bold">Flip</span>
        </button>

        {/* Hidden File Input for Gallery */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
