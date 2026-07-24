import React, { useState } from 'react';
import { GeneratedImage, MarketingOverlayConfig, DetailedImageMetadata } from '../types/creator';
import { 
  Wand2, 
  Sparkles, 
  Layers, 
  Tag, 
  Palette, 
  Maximize2, 
  RotateCcw, 
  Save, 
  X, 
  RefreshCw, 
  Check, 
  Download,
  Sliders,
  Type,
  Layout,
  History,
  Zap,
  Printer,
  Scaling,
  CheckCircle2,
  Columns,
  Split,
  Eye,
  Archive,
  FileJson
} from 'lucide-react';
import { downloadImageDirectly } from '../utils/download';

interface MarketerImageEditorModalProps {
  image: GeneratedImage;
  allImages: GeneratedImage[];
  onClose: () => void;
  onSaveEditedImage: (newImage: GeneratedImage) => void;
  onDownload: (url: string, id: string) => void;
}

const STYLES = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸' },
  { id: '3d-game', name: '3D Game Engine', icon: '🎮' },
  { id: 'concept-art', name: 'Concept Art', icon: '🎨' },
  { id: 'cyberpunk', name: 'Cyberpunk Sci-Fi', icon: '🌆' },
  { id: 'cinematic', name: 'Cinematic Film', icon: '📽️' },
  { id: 'anime', name: 'Anime / Manga', icon: '🏮' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square (Instagram)' },
  { id: '16:9', label: '16:9 Banner (YouTube/Web)' },
  { id: '9:16', label: '9:16 Story (TikTok/Reels)' },
  { id: '4:3', label: '4:3 Grid' }
];

const UPSCALE_FACTORS = [
  { id: '2x', name: '2x HD', dpi: '150 DPI', desc: 'Digital Web & Screen', res: '2048 x 2048' },
  { id: '4x', name: '4x Print Ready', dpi: '300 DPI', desc: 'Professional Print & Merch', res: '4096 x 4096' },
  { id: '8x', name: '8x Billboard', dpi: '600 DPI', desc: 'Large Format & Display Master', res: '8192 x 8192' }
];

const UPSCALE_MODES = [
  { id: 'Generative Detail Enhancer', name: 'Generative Micro-Details', desc: 'Enhances micro-textures, skin/surface depth, and natural clarity' },
  { id: 'Vector & Line Sharpener', name: 'Line & Edge Sharpener', desc: 'Crisp hard edges for logos, illustrations, graphics, and vector designs' },
  { id: 'Denoise & Color Pop', name: 'Denoise & Color Boost', desc: 'Cleans artifact noise, expands dynamic range, and enriches colors' }
];

export function MarketerImageEditorModal({
  image,
  allImages,
  onClose,
  onSaveEditedImage,
  onDownload
}: MarketerImageEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'ai_edit' | 'upscale' | 'overlay' | 'style_aspect' | 'version_history'>('ai_edit');
  const [editInstruction, setEditInstruction] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(image.style || 'photorealistic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(image.aspectRatio || '1:1');
  
  // Upscale state
  const [upscaleFactor, setUpscaleFactor] = useState<'2x' | '4x' | '8x'>('4x');
  const [upscaleMode, setUpscaleMode] = useState<string>('Generative Detail Enhancer');
  const [isUpscaling, setIsUpscaling] = useState(false);

  // Marketing Overlay state
  const [overlay, setOverlay] = useState<MarketingOverlayConfig>(image.marketingOverlay || {
    headline: '',
    ctaText: '',
    badgeText: '',
    themeColor: 'indigo',
    position: 'bottom'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(image.url);
  const [previewPrompt, setPreviewPrompt] = useState(image.prompt);
  const [previewCaption, setPreviewCaption] = useState(image.caption || image.prompt);
  const [previewMetadata, setPreviewMetadata] = useState<DetailedImageMetadata | undefined>(image.metadata);

  // Side-by-Side & Comparison View state
  const [viewMode, setViewMode] = useState<'single' | 'side_by_side' | 'split_slider'>('single');
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Export full Campaign Asset Package & Manifest
  const handleExportCampaignManifest = () => {
    const packageManifest = {
      assetId: image.id,
      title: previewCaption,
      originalPrompt: image.prompt,
      currentPrompt: previewPrompt,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      metadata: previewMetadata || image.metadata,
      marketingOverlay: overlay,
      imageUrl: previewImageUrl,
      exportedAt: new Date().toISOString(),
      vaultStorageStatus: "Saved to Persistent Vault"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packageManifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campaign_asset_manifest_${image.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Lineage / Version Tree computation
  const lineVersions = allImages.filter(
    (img) => img.id === image.id || img.parentId === image.id || (image.parentId && (img.id === image.parentId || img.parentId === image.parentId))
  );

  const handleApplyAIEdit = async () => {
    if (!editInstruction.trim()) return;
    setIsEditing(true);

    try {
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: image.prompt,
          originalStyle: image.style,
          editInstruction,
          style: selectedStyle,
          aspectRatio: selectedAspectRatio,
          marketingOverlay: overlay
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        setPreviewImageUrl(data.imageUrl);
        setPreviewPrompt(data.prompt);
        setPreviewCaption(data.caption);
      }
    } catch (e) {
      console.error("Edit failed:", e);
    } finally {
      setIsEditing(false);
    }
  };

  const handleApplyUpscale = async () => {
    setIsUpscaling(true);
    try {
      const res = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: previewImageUrl,
          prompt: previewPrompt,
          style: selectedStyle,
          aspectRatio: selectedAspectRatio,
          upscaleFactor,
          upscaleMode
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        setPreviewImageUrl(data.imageUrl);
        if (data.caption) setPreviewCaption(data.caption);
        if (data.metadata) setPreviewMetadata(data.metadata);
      }
    } catch (e) {
      console.error("Upscale error:", e);
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleSaveAsNewVersion = () => {
    const nextVersion = (image.version || 1) + 1;
    const editedImg: GeneratedImage = {
      id: `img_edited_${Date.now()}`,
      url: previewImageUrl,
      prompt: previewPrompt,
      caption: previewCaption,
      style: selectedStyle,
      aspectRatio: selectedAspectRatio,
      createdAt: Date.now(),
      parentId: image.id,
      version: nextVersion,
      marketingOverlay: overlay,
      metadata: previewMetadata,
      editHistory: [
        ...(image.editHistory || []),
        {
          action: previewMetadata?.isUpscaled 
            ? `AI Upscaled ${previewMetadata.upscaleFactor} (${previewMetadata.upscaleDpi})`
            : (editInstruction ? `Refined: ${editInstruction}` : 'Marketer Style/Overlay Edit'),
          instruction: editInstruction || `Upscale ${upscaleFactor} ${upscaleMode}`,
          timestamp: Date.now()
        }
      ]
    };

    onSaveEditedImage(editedImg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Live Canvas Preview with Comparison Modes */}
        <div className="md:w-1/2 bg-slate-950 p-5 flex flex-col items-center justify-between relative border-r border-slate-800/80 min-h-[420px] overflow-y-auto">
          
          {/* Comparison View Mode Toolbar */}
          <div className="w-full max-w-md mb-3 flex items-center justify-between bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-2">View:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                  viewMode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Single
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side_by_side')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                  viewMode === 'side_by_side' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5 text-indigo-300" /> Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split_slider')}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold flex items-center gap-1 ${
                  viewMode === 'split_slider' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5 text-amber-300" /> Split Slider
              </button>
            </div>
          </div>

          {/* SINGLE VIEW MODE */}
          {viewMode === 'single' && (
            <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center bg-black">
              <img
                src={previewImageUrl}
                alt={previewPrompt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />

              {/* Upscaled HD Print Badge Overlay */}
              {previewMetadata?.isUpscaled && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-sm border border-emerald-300/50">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>UPSCALED {previewMetadata.upscaleFactor} • {previewMetadata.upscaleDpi || '300 DPI'}</span>
                </div>
              )}

              {/* Rendered Marketing Overlay on Preview Canvas */}
              {(overlay.headline || overlay.ctaText || overlay.badgeText) && (
                <div className={`absolute inset-x-0 p-4 flex flex-col gap-2 ${
                  overlay.position === 'top' ? 'top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent' : 'bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent'
                }`}>
                  {overlay.badgeText && (
                    <span className="self-start px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow">
                      {overlay.badgeText}
                    </span>
                  )}
                  {overlay.headline && (
                    <h4 className="text-sm md:text-base font-black text-white leading-tight drop-shadow-md">
                      {overlay.headline}
                    </h4>
                  )}
                  {overlay.ctaText && (
                    <button className="self-start px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-lg border border-indigo-400/40">
                      {overlay.ctaText}
                    </button>
                  )}
                </div>
              )}

              {(isEditing || isUpscaling) && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                  <span className="text-xs font-bold">
                    {isUpscaling ? 'Super-Resolving Asset Pixels with Gemini AI...' : 'Synthesizing Marketer AI Edit...'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SIDE-BY-SIDE COMPARISON VIEW MODE */}
          {viewMode === 'side_by_side' && (
            <div className="w-full max-w-md grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Original (v1)</div>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black">
                  <img src={image.url} alt="Original" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 font-mono">Original</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider text-center">Refined / Upscaled</div>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-indigo-500/50 bg-black shadow-lg">
                  <img src={previewImageUrl} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] text-white font-bold">
                    {previewMetadata?.isUpscaled ? `Upscaled ${previewMetadata.upscaleFactor}` : 'Edited Version'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* INTERACTIVE SPLIT SLIDER VIEW MODE */}
          {viewMode === 'split_slider' && (
            <div className="w-full max-w-md space-y-2">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black shadow-2xl select-none">
                {/* Background: Modified Image */}
                <img src={previewImageUrl} alt="Refined" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-contain" />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-[9px] text-white font-extrabold z-10 shadow">
                  Refined / Upscaled
                </span>

                {/* Foreground Clip: Original Image */}
                <div 
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-amber-400 shadow-2xl"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img src={image.url} alt="Original" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[9px] text-slate-200 font-extrabold z-10">
                    Original
                  </span>
                </div>

                {/* Split Handle */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 border-2 border-black shadow-xl flex items-center justify-center text-black pointer-events-none z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <Split className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Slider Range Control */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-slate-400 font-bold">Original</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-emerald-400 font-bold">Upscaled</span>
              </div>
            </div>
          )}

          {/* Quick Info Bar & Storage Vault Action Row */}
          <div className="w-full max-w-md mt-3 space-y-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Asset Version: <strong className="text-white">v{image.version || 1}</strong></span>
                <span>Style: <strong className="text-indigo-300 capitalize">{selectedStyle}</strong></span>
                <span>Aspect: <strong className="text-white">{selectedAspectRatio}</strong></span>
              </div>
              {previewMetadata?.isUpscaled && (
                <div className="flex justify-between text-emerald-300 text-[10px] font-semibold pt-1 border-t border-slate-800">
                  <span>Res: <strong>{previewMetadata.upscaleResolution}</strong></span>
                  <span>Quality: <strong>{previewMetadata.upscaleDpi}</strong></span>
                </div>
              )}
              <p className="text-[11px] text-slate-300 italic truncate">"{previewCaption}"</p>
            </div>

            {/* Campaign Vault Storage Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onDownload(previewImageUrl, image.id)}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Save Image File
              </button>
              <button
                type="button"
                onClick={handleExportCampaignManifest}
                className="py-2 px-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/40 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 transition"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-300" /> Export Campaign Manifest
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Marketer Tool Controls */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[92vh]">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                <Wand2 className="w-3 h-3" /> Marketer Asset Refinement Studio
              </div>
              <h3 className="text-xl font-black text-white mt-1">Edit & Iterative Campaign Studio</h3>
              <p className="text-xs text-slate-400">
                Keep marketing assets on platform and continuously improve them with AI refinement instructions, AI upscaling, and brand text overlays.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('ai_edit')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shrink-0 ${
                  activeTab === 'ai_edit' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Inpaint
              </button>
              <button
                onClick={() => setActiveTab('upscale')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shrink-0 ${
                  activeTab === 'upscale' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Upscale AI
              </button>
              <button
                onClick={() => setActiveTab('overlay')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shrink-0 ${
                  activeTab === 'overlay' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Ad Text
              </button>
              <button
                onClick={() => setActiveTab('style_aspect')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shrink-0 ${
                  activeTab === 'style_aspect' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Format
              </button>
              <button
                onClick={() => setActiveTab('version_history')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shrink-0 ${
                  activeTab === 'version_history' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Versions
              </button>
            </div>

            {/* TAB 1: AI Prompt Inpainting & Edit Instructions */}
            {activeTab === 'ai_edit' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Marketer AI Edit Instructions:</label>
                  <textarea
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder="E.g., 'Add a glowing Black Friday 50% OFF banner on top', 'Change background to a modern tech office', 'Make lighting warmer with autumn leaves'"
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Quick Marketer Edit Presets:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Add a glowing '50% OFF SPECIAL OFFER' banner",
                      "Change background to a modern luxury showroom",
                      "Add warm golden hour sunset lighting and reflections",
                      "Add sleek metallic branding border with glowing accents"
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditInstruction(preset)}
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-left transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyAIEdit}
                  disabled={isEditing || !editInstruction.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Sparkles className="w-4 h-4" /> Synthesize AI Edit
                </button>
              </div>
            )}

            {/* TAB 2: AI Super-Resolution & Image Upscaling Tool */}
            {activeTab === 'upscale' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Printer className="w-4 h-4 text-indigo-400" />
                    <span>300 DPI Print & High-Res Asset Enhancer</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uses Gemini AI super-resolution algorithms to increase pixel density, clarify micro-textures, and sharpen edges for physical printing, merchandise, and high-res digital ads.
                  </p>
                </div>

                {/* Upscale Factor Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Scaling className="w-3.5 h-3.5 text-indigo-400" />
                    1. Select Upscale Multiplier:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {UPSCALE_FACTORS.map((fac) => (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setUpscaleFactor(fac.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          upscaleFactor === fac.id
                            ? 'bg-indigo-600/30 border-indigo-500 ring-1 ring-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{fac.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            {fac.dpi}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{fac.desc}</div>
                        <div className="text-[9px] text-indigo-300/80 font-mono mt-0.5">{fac.res}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upscale Mode Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    2. Select Enhancement Strategy:
                  </label>
                  <div className="space-y-2">
                    {UPSCALE_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setUpscaleMode(mode.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          upscaleMode === mode.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${upscaleMode === mode.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{mode.name}</div>
                          <div className="text-[10px] text-slate-400">{mode.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Upscale Button */}
                <button
                  type="button"
                  onClick={handleApplyUpscale}
                  disabled={isUpscaling}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl transition"
                >
                  {isUpscaling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Super-Resolving Asset Pixels...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      Upscale Asset to {upscaleFactor} ({upscaleFactor === '8x' ? '600 DPI' : upscaleFactor === '4x' ? '300 DPI' : '150 DPI'})
                    </>
                  )}
                </button>

                {/* Upscaled Result Card */}
                {previewMetadata?.isUpscaled && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Asset Super-Resolved Successfully</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase">
                        {previewMetadata.upscaleDpi || '300 DPI'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Resolution:</span>
                        <div className="font-bold text-white">{previewMetadata.upscaleResolution}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Multiplier:</span>
                        <div className="font-bold text-emerald-300">{previewMetadata.upscaleFactor}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDownload(previewImageUrl, image.id)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download HD Print File
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Ad Copy & Marketing Text Overlay */}
            {activeTab === 'overlay' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Campaign Headline Text:</label>
                  <input
                    type="text"
                    value={overlay.headline || ''}
                    onChange={(e) => setOverlay({ ...overlay, headline: e.target.value })}
                    placeholder="E.g., SUMMERCAMP 2026 SALE"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300">Call to Action (CTA):</label>
                    <input
                      type="text"
                      value={overlay.ctaText || ''}
                      onChange={(e) => setOverlay({ ...overlay, ctaText: e.target.value })}
                      placeholder="E.g., SHOP NOW"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Discount Badge:</label>
                    <input
                      type="text"
                      value={overlay.badgeText || ''}
                      onChange={(e) => setOverlay({ ...overlay, badgeText: e.target.value })}
                      placeholder="E.g., 50% OFF"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300">Overlay Banner Position:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setOverlay({ ...overlay, position: 'bottom' })}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        overlay.position === 'bottom' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Bottom Banner
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverlay({ ...overlay, position: 'top' })}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        overlay.position === 'top' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Top Banner
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Style & Aspect Ratio Re-Framing */}
            {activeTab === 'style_aspect' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Transform Visual Style:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyle(st.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                          selectedStyle === st.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st.icon}</span>
                        <span className="text-xs font-bold">{st.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Target Channel Aspect Ratio:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setSelectedAspectRatio(ar.id)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                          selectedAspectRatio === ar.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Version Lineage Tree */}
            {activeTab === 'version_history' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300">Campaign Asset Iteration Lineage:</div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lineVersions.map((ver, idx) => {
                    const isLoaded = previewImageUrl === ver.url;
                    return (
                      <div
                        key={ver.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                          isLoaded ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={ver.url} alt="version" className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0 bg-black" />
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>Version v{ver.version || (idx + 1)}</span>
                              {image.id === ver.id && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold border border-emerald-500/30">Active</span>
                              )}
                              {isLoaded && image.id !== ver.id && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold">Loaded</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{ver.caption || ver.prompt}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImageUrl(ver.url);
                            setPreviewPrompt(ver.prompt);
                            setPreviewCaption(ver.caption || ver.prompt);
                            if (ver.style) setSelectedStyle(ver.style);
                            if (ver.aspectRatio) setSelectedAspectRatio(ver.aspectRatio);
                            if (ver.marketingOverlay) setOverlay(ver.marketingOverlay);
                            if (ver.metadata) setPreviewMetadata(ver.metadata);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                            isLoaded ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" /> Load Version
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleSaveAsNewVersion}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> Save as New Version in Firestore
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Permanently kept in platform memory so marketers can edit anytime.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
