import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Download, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  History,
  Move,
  Info,
  FolderPlus
} from 'lucide-react';
import { GeneratedImage } from '../types/creator';
import { SocialShareModal } from './SocialShareModal';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage | null;
  imagesList?: GeneratedImage[];
  onSelectImage?: (img: GeneratedImage) => void;
  isSavedInLibrary?: boolean;
  onToggleSaveToLibrary?: (img: GeneratedImage) => void;
  onSaveToPortfolio?: (img: GeneratedImage) => void;
  onEditMarketerImage?: (img: GeneratedImage) => void;
  onViewVersionHistory?: (img: GeneratedImage) => void;
  onDownloadImage?: (url: string, id: string) => void;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  image,
  imagesList = [],
  onSelectImage,
  isSavedInLibrary = false,
  onToggleSaveToLibrary,
  onSaveToPortfolio,
  onEditMarketerImage,
  onViewVersionHistory,
  onDownloadImage
}: ImageLightboxModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [image?.id, image?.url]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && imagesList.length > 0 && image) {
        const currentIndex = imagesList.findIndex(img => img.id === image.id || img.url === image.url);
        if (currentIndex !== -1 && currentIndex < imagesList.length - 1) {
          onSelectImage?.(imagesList[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft' && imagesList.length > 0 && image) {
        const currentIndex = imagesList.findIndex(img => img.id === image.id || img.url === image.url);
        if (currentIndex > 0) {
          onSelectImage?.(imagesList[currentIndex - 1]);
        }
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, image, imagesList]);

  if (!isOpen || !image) return null;

  const currentIndex = imagesList.findIndex(img => img.id === image.id || img.url === image.url);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < imagesList.length - 1;

  // Zoom Handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Dragging / Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col justify-between animate-fadeIn select-none">
      {/* Lightbox Top Header Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 font-extrabold text-xs">
            v{image.version || 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate max-w-md md:max-w-xl">
              {image.caption || image.prompt}
            </h3>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Style: <span className="text-indigo-300 capitalize">{image.style}</span> • Aspect: {image.aspectRatio}
            </p>
          </div>
        </div>

        {/* Zoom & Action Controls Header */}
        <div className="flex items-center gap-2">
          {/* Zoom Control Group */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-indigo-300 px-2 min-w-[3.5rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition border-l border-slate-800"
              title="Reset Zoom & Pan (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowMetadataPanel(!showMetadataPanel)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              showMetadataPanel ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle Details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Close Lightbox (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox Center Image Stage with Pan & Zoom */}
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-8 ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Navigation Previous Button */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectImage?.(imagesList[currentIndex - 1]);
            }}
            className="absolute left-4 z-30 p-3 rounded-2xl bg-slate-900/80 hover:bg-indigo-600 text-white border border-slate-700/80 shadow-2xl backdrop-blur transition hover:scale-110"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Next Button */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectImage?.(imagesList[currentIndex + 1]);
            }}
            className="absolute right-4 z-30 p-3 rounded-2xl bg-slate-900/80 hover:bg-indigo-600 text-white border border-slate-700/80 shadow-2xl backdrop-blur transition hover:scale-110"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Canvas with CSS Transform for Zoom & Pan */}
        <div
          className="relative max-w-full max-h-full transition-transform duration-75 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={image.url}
            alt={image.prompt}
            referrerPolicy="no-referrer"
            className="max-w-[90vw] max-h-[78vh] object-contain rounded-xl shadow-2xl border border-slate-800/80 pointer-events-none"
          />

          {zoomLevel > 1 && (
            <div className="absolute top-3 left-3 bg-slate-950/80 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur flex items-center gap-1">
              <Move className="w-3 h-3" /> Click & Drag to Pan
            </div>
          )}
        </div>

        {/* Right Details Drawer (if toggled) */}
        {showMetadataPanel && (
          <div className="absolute right-6 top-6 bottom-6 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-40 overflow-y-auto space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" /> Asset Metadata
              </h4>
              <button
                onClick={() => setShowMetadataPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Prompt</label>
                <p className="text-slate-200 mt-0.5 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {image.prompt}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Style Preset</label>
                <p className="text-indigo-300 font-bold capitalize mt-0.5">{image.style}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Aspect Ratio</label>
                <p className="text-slate-300 font-mono mt-0.5">{image.aspectRatio}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Created Date</label>
                <p className="text-slate-300 mt-0.5">
                  {new Date(image.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>

              {(image.metadata?.cameraLens || image.metadata?.cameraParams) && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Camera Settings</label>
                  <p className="text-slate-300 mt-0.5 font-mono text-[11px]">
                    {image.metadata?.cameraLens || (typeof image.metadata?.cameraParams === 'string' ? image.metadata?.cameraParams : '35mm Prime f/1.8')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Bottom Action Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPrompt}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            {copied ? 'Prompt Copied' : 'Copy Prompt'}
          </button>

          {onToggleSaveToLibrary && (
            <button
              onClick={() => onToggleSaveToLibrary(image)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                isSavedInLibrary
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-lg'
                  : 'bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border-slate-800'
              }`}
            >
              {isSavedInLibrary ? <BookmarkCheck className="w-4 h-4 text-emerald-200" /> : <Bookmark className="w-4 h-4 text-indigo-400" />}
              {isSavedInLibrary ? 'Saved in Firebase' : 'Save to Library'}
            </button>
          )}

          {onSaveToPortfolio && (
            <button
              onClick={() => onSaveToPortfolio(image)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-800 flex items-center gap-1.5 transition"
            >
              <FolderPlus className="w-4 h-4 text-blue-400" />
              Save to Portfolio
            </button>
          )}
        </div>

        {/* Center / Right Action Group */}
        <div className="flex items-center gap-2">
          {/* Twitter & Social Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            Share to Twitter / Social
          </button>

          {onEditMarketerImage && (
            <button
              onClick={() => {
                onClose();
                onEditMarketerImage(image);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Marketer Refine
            </button>
          )}

          {onViewVersionHistory && (
            <button
              onClick={() => {
                onClose();
                onViewVersionHistory(image);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <History className="w-3.5 h-3.5" />
              Timeline
            </button>
          )}

          {onDownloadImage && (
            <button
              onClick={() => onDownloadImage(image.url, image.id)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Social Share Modal Integration */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={{
          title: image.caption || image.prompt,
          content: image.prompt,
          imageUrl: image.url,
          mediaType: 'image',
          tags: [image.style, 'AIArt', 'CreatorStudio']
        }}
      />
    </div>
  );
}
