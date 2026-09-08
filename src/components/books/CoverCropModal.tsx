import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Crop,
  Check,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Focus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CoverCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialPosition?: string;
  bookTitle?: string;
  onSave: (position: string, croppedDataUrl?: string) => void | Promise<void>;
}

export const CoverCropModal: React.FC<CoverCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialPosition = 'center',
  bookTitle,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [imgCrossOrigin, setImgCrossOrigin] = useState<'anonymous' | undefined>('anonymous');

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  // Rendered image dimensions and offset in the preview container
  const [renderedBounds, setRenderedBounds] = useState<{ width: number; height: number; left: number; top: number }>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  // Zoom scale (1x to 2.5x)
  const [zoom, setZoom] = useState<number>(1);

  // Crop box position in relative container pixels (relative to rendered image)
  const [boxPos, setBoxPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [boxSize, setBoxSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; boxX: number; boxY: number }>({
    pointerX: 0,
    pointerY: 0,
    boxX: 0,
    boxY: 0,
  });

  // Current percentage position
  const [focalPercent, setFocalPercent] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Parse initial position into {x, y}
  const parseInitialPercent = useCallback((pos: string): { x: number; y: number } => {
    const p = pos.trim().toLowerCase();
    if (p === 'top') return { x: 50, y: 0 };
    if (p === 'bottom') return { x: 50, y: 100 };
    if (p === 'left') return { x: 0, y: 50 };
    if (p === 'right') return { x: 100, y: 50 };
    if (p === 'top-left' || p === 'left-top') return { x: 0, y: 0 };
    if (p === 'top-right' || p === 'right-top') return { x: 100, y: 0 };
    if (p === 'bottom-left' || p === 'left-bottom') return { x: 0, y: 100 };
    if (p === 'bottom-right' || p === 'right-bottom') return { x: 100, y: 100 };
    if (p === 'center') return { x: 50, y: 50 };

    const match = p.match(/(\d+)%\s+(\d+)%/);
    if (match) {
      return {
        x: Math.min(100, Math.max(0, parseInt(match[1], 10))),
        y: Math.min(100, Math.max(0, parseInt(match[2], 10))),
      };
    }
    return { x: 50, y: 50 };
  }, []);

  // Compute rendered bounds of the image inside the display container
  const updateLayout = useCallback(() => {
    if (!containerRef.current || !naturalSize.width || !naturalSize.height) return;

    const contRect = containerRef.current.getBoundingClientRect();
    const contW = contRect.width;
    const contH = contRect.height;
    const imgAspect = naturalSize.width / naturalSize.height;
    const contAspect = contW / contH;

    let rendW = 0;
    let rendH = 0;
    let rendLeft = 0;
    let rendTop = 0;

    if (imgAspect > contAspect) {
      rendW = contW;
      rendH = contW / imgAspect;
      rendLeft = 0;
      rendTop = (contH - rendH) / 2;
    } else {
      rendH = contH;
      rendW = contH * imgAspect;
      rendTop = 0;
      rendLeft = (contW - rendW) / 2;
    }

    setRenderedBounds({
      width: rendW,
      height: rendH,
      left: rendLeft,
      top: rendTop,
    });

    // 3:4 target book aspect ratio = 0.75
    const targetAspect = 3 / 4;
    let bW = 0;
    let bH = 0;

    if (imgAspect >= targetAspect) {
      // Wider than 3:4
      bH = rendH / zoom;
      bW = bH * targetAspect;
    } else {
      // Taller than 3:4
      bW = rendW / zoom;
      bH = bW / targetAspect;
    }

    // Ensure crop box never exceeds image dimensions
    bW = Math.min(bW, rendW);
    bH = Math.min(bH, rendH);
    setBoxSize({ width: bW, height: bH });

    // Place box according to focalPercent
    const maxX = Math.max(0, rendW - bW);
    const maxY = Math.max(0, rendH - bH);
    const currentX = (focalPercent.x / 100) * maxX;
    const currentY = (focalPercent.y / 100) * maxY;

    setBoxPos({
      x: Math.max(0, Math.min(maxX, currentX)),
      y: Math.max(0, Math.min(maxY, currentY)),
    });
  }, [naturalSize, zoom, focalPercent.x, focalPercent.y]);

  // When natural image is loaded or updated
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      const parsed = parseInitialPercent(initialPosition);
      setFocalPercent(parsed);
      setZoom(1);
    }
  }, [isOpen, initialPosition, parseInitialPercent]);

  // Recalculate layout on window resize or size changes
  useEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      boxX: boxPos.x,
      boxY: boxPos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;

    const maxX = Math.max(0, renderedBounds.width - boxSize.width);
    const maxY = Math.max(0, renderedBounds.height - boxSize.height);

    const newX = Math.max(0, Math.min(maxX, dragStartRef.current.boxX + deltaX));
    const newY = Math.max(0, Math.min(maxY, dragStartRef.current.boxY + deltaY));

    setBoxPos({ x: newX, y: newY });

    const pctX = maxX > 0 ? Math.round((newX / maxX) * 100) : 50;
    const pctY = maxY > 0 ? Math.round((newY / maxY) * 100) : 50;
    setFocalPercent({ x: pctX, y: pctY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  // Preset jumping
  const applyPreset = (px: number, py: number) => {
    setFocalPercent({ x: px, y: py });
    const maxX = Math.max(0, renderedBounds.width - boxSize.width);
    const maxY = Math.max(0, renderedBounds.height - boxSize.height);
    setBoxPos({
      x: Math.round((px / 100) * maxX),
      y: Math.round((py / 100) * maxY),
    });
  };

  // Generate cropped image data URL if user requests hard crop
  const generateCroppedCanvas = async (): Promise<string | undefined> => {
    if (!naturalSize.width || !naturalSize.height || !renderedBounds.width) return undefined;
    try {
      const scale = naturalSize.width / renderedBounds.width;
      const sourceX = boxPos.x * scale;
      const sourceY = boxPos.y * scale;
      const sourceW = boxSize.width * scale;
      const sourceH = boxSize.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 800; // standard 3:4 target
      const ctx = canvas.getContext('2d');
      if (!ctx || !imageRef.current) return undefined;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        imageRef.current,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        canvas.width,
        canvas.height
      );
      return canvas.toDataURL('image/jpeg', 0.88);
    } catch {
      return undefined;
    }
  };

  const handleApplyPositionOnly = async () => {
    setIsApplying(true);
    try {
      const formatted = `${focalPercent.x}% ${focalPercent.y}%`;
      await onSave(formatted);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyHardCrop = async () => {
    setIsApplying(true);
    try {
      const croppedUrl = await generateCroppedCanvas();
      const formatted = `${focalPercent.x}% ${focalPercent.y}%`;
      await onSave(formatted, croppedUrl);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleImageError = () => {
    if (imgCrossOrigin === 'anonymous') {
      setImgCrossOrigin(undefined);
    }
  };

  const currentCssPosition = `${focalPercent.x}% ${focalPercent.y}%`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Book Cover Framing & Crop"
      description="Drag the 3:4 rectangular frame across your image to select exactly which section displays as the cover."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        
        {/* Main Work Area: Interactive Canvas + Live 3:4 Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Left / Center: Interactive Dragging Canvas */}
          <div className="md:col-span-8 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Move className="w-3.5 h-3.5 text-indigo-500" />
                <span>Drag rectangle to position cover window</span>
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                {focalPercent.x}% {focalPercent.y}%
              </span>
            </div>

            {/* Viewport Frame */}
            <div
              ref={containerRef}
              className="relative w-full h-[280px] sm:h-[340px] bg-slate-950 rounded-2xl overflow-hidden select-none border border-slate-300 dark:border-white/10 shadow-inner flex items-center justify-center cursor-crosshair touch-none"
            >
              {/* Underlying Original Image */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Source preview"
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin={imgCrossOrigin}
                className="max-w-full max-h-full object-contain pointer-events-none"
              />

              {/* Rendered Image Boundary Layer & Crop Box */}
              {renderedBounds.width > 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${renderedBounds.left}px`,
                    top: `${renderedBounds.top}px`,
                    width: `${renderedBounds.width}px`,
                    height: `${renderedBounds.height}px`,
                  }}
                >
                  {/* Movable 3:4 Crop Rectangle */}
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing rounded-lg border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-shadow ${
                      isDragging ? 'border-indigo-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.75)]' : ''
                    }`}
                    style={{
                      left: `${boxPos.x}px`,
                      top: `${boxPos.y}px`,
                      width: `${boxSize.width}px`,
                      height: `${boxSize.height}px`,
                    }}
                  >
                    {/* Rule of Thirds Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-white/20">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-white/30" />
                      <div className="border-r border-white/30" />
                      <div />
                    </div>

                    {/* Corner Accent Handles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm shadow" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm shadow" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm shadow" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-600 rounded-sm shadow" />

                    {/* Central Indicator Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/20 flex items-center gap-1 shadow-md">
                        <Focus className="w-3 h-3 text-indigo-400" />
                        <span>3:4 Cover Area</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Alignment Jump Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 0)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Top</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 50)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1"
                >
                  <Focus className="w-3 h-3" />
                  <span>Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 100)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1"
                >
                  <ArrowDown className="w-3 h-3" />
                  <span>Bottom</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(0, 50)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1"
                  title="Left Edge"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(100, 50)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1"
                  title="Right Edge"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.2).toFixed(1))))}
                  disabled={zoom <= 1}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 w-9 text-center">
                  {zoom.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.2).toFixed(1))))}
                  disabled={zoom >= 2.5}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoom !== 1 && (
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="p-1 text-slate-400 hover:text-indigo-500 ml-0.5"
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Real-time Live 3:4 Preview Card */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Live Book Preview</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">3:4 Ratio</span>
            </div>

            {/* 3:4 Card Frame */}
            <div className="relative aspect-[3/4] w-36 sm:w-44 rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-slate-900 group">
              <img
                src={imageUrl}
                alt="Framed cover preview"
                className="w-full h-full object-cover transition-all duration-75"
                style={{
                  objectPosition: currentCssPosition,
                  transform: zoom > 1 ? `scale(${zoom})` : undefined,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 py-1 px-2 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent text-[10px] text-slate-200 font-medium truncate text-center">
                {bookTitle || 'Book Cover Preview'}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              This is how your cover will look on your dashboard cards and detail page.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleApplyPositionOnly}
              disabled={isApplying}
              leftIcon={<Focus className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
              className="text-xs"
            >
              Apply Framing ({currentCssPosition})
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyHardCrop}
              isLoading={isApplying}
              disabled={isApplying}
              leftIcon={<Crop className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Crop & Apply Image
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
