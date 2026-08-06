import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, RotateCw, Check, Move, AlertCircle } from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropSave: (croppedFile: File) => Promise<void>;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropSave,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setErrorMsg(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const img = imageRef.current;
      const canvas = document.createElement('canvas');
      const outputSize = 400; // 400x400 High-Res Output Canvas
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Create circular clipping mask
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Clear background
      ctx.fillStyle = '#0e101d';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // UI crop box container size is 250px
      const cropBoxSize = 250;
      const naturalAspect = img.naturalWidth / img.naturalHeight;

      let baseWidth = cropBoxSize;
      let baseHeight = cropBoxSize;

      if (naturalAspect > 1) {
        baseWidth = cropBoxSize;
        baseHeight = cropBoxSize / naturalAspect;
      } else {
        baseHeight = cropBoxSize;
        baseWidth = cropBoxSize * naturalAspect;
      }

      // Scale ratio between UI crop box (250px) and Output Canvas (400px)
      const ratio = outputSize / cropBoxSize;

      const drawWidth = baseWidth * scale * ratio;
      const drawHeight = baseHeight * scale * ratio;
      const drawX = position.x * ratio;
      const drawY = position.y * ratio;

      ctx.save();
      ctx.translate(outputSize / 2 + drawX, outputSize / 2 + drawY);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setErrorMsg('Failed to process image crop.');
            setIsSaving(false);
            return;
          }
          const file = new File([blob], `avatar_${Date.now()}.png`, { type: 'image/png' });
          try {
            await onCropSave(file);
            onClose();
          } catch (err: any) {
            setErrorMsg(err.message || 'Failed to save cropped avatar.');
          } finally {
            setIsSaving(false);
          }
        },
        'image/png',
        0.95
      );
    } catch (err: any) {
      console.error('Crop error:', err);
      setErrorMsg('Failed to generate cropped image.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e101d] rounded-3xl border border-[#00ffcc]/40 p-6 max-w-md w-full space-y-6 shadow-[0_0_40px_rgba(0,255,204,0.25)] relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1b1e34] pb-3">
          <div className="flex items-center space-x-2">
            <Move className="w-5 h-5 text-[#00ffcc]" />
            <h3 className="font-headline font-bold text-lg text-white">Crop Profile Picture</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Circular Viewfinder & Image Drag Container */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="font-label text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
            <Move className="w-3 h-3 text-[#00ffcc]" /> Drag to adjust position inside circle
          </p>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-[#00ffcc] shadow-[0_0_25px_rgba(0,255,204,0.4)] cursor-grab active:cursor-grabbing bg-slate-950 select-none flex items-center justify-center"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Avatar Crop Preview"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="max-w-none max-h-none pointer-events-none w-full h-full object-contain"
              draggable={false}
            />
            {/* Inner Grid Overlay */}
            <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"></div>
          </div>
        </div>

        {/* Editing Controls (Zoom Slider & Rotate Button) */}
        <div className="space-y-4 bg-[#141629] p-4 rounded-2xl border border-[#232745]">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-label font-bold text-slate-300">
              <span className="flex items-center gap-1 text-[#00ffcc]">
                <ZoomIn className="w-4 h-4" /> Zoom
              </span>
              <span className="font-mono text-[11px]">{scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-[#00ffcc] cursor-pointer"
            />
          </div>

          {/* Action Buttons: Rotate & Reset */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-xl bg-[#0c0c18] border border-[#232745] text-slate-300 hover:text-[#00ffcc] hover:border-[#00ffcc]/40 font-label text-xs uppercase font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate ({rotation}°)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScale(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
              }}
              className="font-label text-[11px] text-slate-400 hover:text-white uppercase font-bold underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Submit & Cancel Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl font-label text-xs uppercase font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-[#00ffcc] text-slate-950 font-label font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_#00ffcc] disabled:opacity-50"
          >
            {isSaving ? (
              <span>Applying Crop...</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-slate-950 font-black" />
                <span>Apply & Save Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
