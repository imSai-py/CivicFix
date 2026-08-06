import React, { useEffect, useRef, useState } from 'react';
import { X, Image as ImageIcon, RefreshCw, AlertCircle, Zap, ZapOff } from 'lucide-react';

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
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Lock Body Scroll when Camera is Open
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
        setCameraError('Camera access unavailable. Choose a photo from Gallery below.');
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
    }, 'image/jpeg', 0.95);
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
    <div className="fixed inset-0 z-[99999] h-screen w-screen bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* 1. TOP BAR (X close on left, Flash toggle in center) */}
      <div className="absolute top-0 left-0 right-0 z-[100000] px-4 pt-4 pb-8 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Top Left: Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-white hover:opacity-80 active:scale-90 transition-all"
          title="Close Camera"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Top Center: Flash Toggle */}
        <button
          type="button"
          onClick={() => setFlashOn(!flashOn)}
          className="p-2 text-white hover:opacity-80 active:scale-90 transition-all"
          title="Toggle Flash"
        >
          {flashOn ? (
            <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
          ) : (
            <ZapOff className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Spacer for symmetry */}
        <div className="w-10"></div>
      </div>

      {/* 2. MAIN CAMERA VIEWFINDER */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-6 text-center space-y-4 max-w-sm mx-auto z-10">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="font-headline font-semibold text-sm text-slate-200">{cameraError}</p>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-label text-xs uppercase tracking-wider font-bold"
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

        {/* Floating Shutter Button directly over bottom center of Viewfinder */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={handleCapturePhoto}
            disabled={!!cameraError}
            className="w-20 h-20 rounded-full border-[5px] border-white p-1 flex items-center justify-center active:scale-90 transition-transform shadow-2xl disabled:opacity-50 cursor-pointer"
            title="Snap Photo"
          >
            <div className="w-full h-full rounded-full bg-white active:bg-slate-300 transition-colors"></div>
          </button>
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 3. BOTTOM BLACK BAR (Gallery on Far-Left, Flip Camera on Far-Right) */}
      <div className="relative z-[100000] h-20 bg-black flex items-center justify-between px-6 border-t border-white/10 shrink-0">
        {/* Bottom-Left: Gallery Thumbnail Icon */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="w-11 h-11 rounded-xl bg-[#1c1c1e] border border-white/20 flex items-center justify-center active:scale-90 transition-transform overflow-hidden shadow-md cursor-pointer"
          title="Open Gallery"
        >
          <ImageIcon className="w-6 h-6 text-white" />
        </button>

        {/* Bottom-Right: Flip Camera Icon */}
        <button
          type="button"
          onClick={toggleCameraFacing}
          disabled={!!cameraError}
          className="w-11 h-11 rounded-full bg-[#1c1c1e] border border-white/20 flex items-center justify-center active:scale-90 transition-transform shadow-md disabled:opacity-50 cursor-pointer"
          title="Flip Camera"
        >
          <RefreshCw className="w-5 h-5 text-white" />
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
