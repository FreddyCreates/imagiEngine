import React, { useState, useEffect, useRef } from 'react';
import { VideoReel, GeneratedImage } from '../types/creator';
import { downloadImageDirectly } from '../utils/download';
import { SocialShareModal, SocialShareData } from './SocialShareModal';
import { 
  Video, 
  Play, 
  Pause, 
  Sparkles, 
  Film, 
  RotateCcw, 
  Download, 
  Trash2, 
  Smartphone, 
  Monitor, 
  Image as ImageIcon,
  Share2,
  Sliders,
  Zap,
  Eye,
  Layers,
  Upload,
  Radio
} from 'lucide-react';

interface VideoStudioProps {
  reels: VideoReel[];
  images?: GeneratedImage[];
  onAddReel: (reel: VideoReel) => void;
  onDeleteReel: (id: string) => void;
  initialSourceImage?: string | null;
}

export function VideoStudio({ reels, images = [], onAddReel, onDeleteReel, initialSourceImage = null }: VideoStudioProps) {
  const [generatorMode, setGeneratorMode] = useState<'prompt' | 'image-to-video'>(initialSourceImage ? 'image-to-video' : 'prompt');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [motionStyle, setMotionStyle] = useState('360° Camera Orbit');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Image to Video selection
  const [selectedSourceImage, setSelectedSourceImage] = useState<string | null>(initialSourceImage);

  // AI Object Detection for Object Tracking motion
  interface DetectedObject {
    label: string;
    box: { x: number; y: number; width: number; height: number };
  }
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  useEffect(() => {
    if (initialSourceImage) {
      setSelectedSourceImage(initialSourceImage);
      setGeneratorMode('image-to-video');
    }
  }, [initialSourceImage]);

  useEffect(() => {
    if (selectedSourceImage && motionStyle === 'AI Object Tracking') {
      const analyze = async () => {
        setIsAnalyzingImage(true);
        try {
          const res = await fetch('/api/analyze-objects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: selectedSourceImage })
          });
          const data = await res.json();
          if (data.objects) {
            setDetectedObjects(data.objects);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      analyze();
    }
  }, [selectedSourceImage, motionStyle]);



  // Active Video Reel Player State
  const [activeReel, setActiveReel] = useState<VideoReel | null>(reels[0] || null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Canvas Motion Video Recording
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExportingVideo, setIsExportingVideo] = useState(false);

  // Social Share Modal
  const [socialShareData, setSocialShareData] = useState<SocialShareData | null>(null);

  // Animation Frame Loop for Smooth Motion Rendering on HTML5 Canvas
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (reels.length > 0 && !activeReel) {
      setActiveReel(reels[0]);
    }
  }, [reels]);

  // Load active frame image into HTML element for canvas drawing
  useEffect(() => {
    if (!activeReel || !activeReel.frames || activeReel.frames.length === 0) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeReel.frames[0] || activeReel.thumbnailUrl;
    img.onload = () => {
      loadedImageRef.current = img;
    };
  }, [activeReel]);

  // HTML5 Canvas Motion Render Loop (Simulates Camera Motion, Zoom, Pan, Particle Effects)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeReel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = activeReel.aspectRatio === '9:16' ? 540 : activeReel.aspectRatio === '1:1' ? 720 : 960;
    const h = activeReel.aspectRatio === '9:16' ? 960 : activeReel.aspectRatio === '1:1' ? 720 : 540;
    canvas.width = w;
    canvas.height = h;

    let time = 0;

    const renderFrame = () => {
      if (isPlaying) {
        time += 0.02 * playbackSpeed;
        frameCountRef.current++;
      }

      ctx.clearRect(0, 0, w, h);

      // Render Base Image with Camera Pan/Zoom/Orbit transform
      if (loadedImageRef.current) {
        ctx.save();

        // Calculate motion offset based on selected motion style
        let scale = 1.0;
        let dx = 0;
        let dy = 0;

        if (motionStyle === 'AI Object Tracking' && detectedObjects && detectedObjects.length > 0) {
          // Track the primary detected object (e.g., the largest or first one)
          const obj = detectedObjects[0];
          // obj.box has x, y, width, height as percentages (0-1)
          const objCenterX = (obj.box.x + obj.box.width / 2) * w - w / 2;
          const objCenterY = (obj.box.y + obj.box.height / 2) * h - h / 2;
          
          // Smooth pan towards the object center and zoom in
          const trackingProgress = Math.min(1, time * 0.5);
          dx = -objCenterX * trackingProgress * 0.8; 
          dy = -objCenterY * trackingProgress * 0.8;
          scale = 1.0 + trackingProgress * 0.3; // Zoom in 30%
        } else if (motionStyle.includes('Orbit') || motionStyle.includes('360')) {
          scale = 1.05 + Math.sin(time * 0.8) * 0.04;
          dx = Math.cos(time * 0.5) * 15;
          dy = Math.sin(time * 0.5) * 10;
        } else if (motionStyle.includes('Fly-through') || motionStyle.includes('Push-In') || motionStyle.includes('Zoom')) {
          scale = 1.0 + (Math.sin(time) * 0.5 + 0.5) * 0.12;
        } else if (motionStyle.includes('Pan')) {
          dx = (Math.sin(time * 0.4) * 0.5) * 25;
        } else {
          // Dynamic Wave
          dy = Math.sin(time * 1.2) * 12;
        }

        ctx.translate(w / 2 + dx, h / 2 + dy);
        ctx.scale(scale, scale);

        const img = loadedImageRef.current;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);

        // If Object Tracking, draw a stylistic bounding box
        if (motionStyle === 'AI Object Tracking' && detectedObjects && detectedObjects.length > 0) {
          detectedObjects.forEach(obj => {
            const bx = obj.box.x * w - w / 2;
            const by = obj.box.y * h - h / 2;
            const bw = obj.box.width * w;
            const bh = obj.box.height * h;
            
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)'; // sky-400
            ctx.lineWidth = 2 / scale;
            ctx.strokeRect(bx, by, bw, bh);
            
            // Draw corners
            ctx.beginPath();
            ctx.moveTo(bx, by + 10); ctx.lineTo(bx, by); ctx.lineTo(bx + 10, by);
            ctx.moveTo(bx + bw, by + 10); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw - 10, by);
            ctx.moveTo(bx, by + bh - 10); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + 10, by + bh);
            ctx.moveTo(bx + bw, by + bh - 10); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw - 10, by + bh);
            ctx.stroke();

            ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            ctx.fillRect(bx, by - 20 / scale, ctx.measureText(obj.label).width + 10, 20 / scale);
            ctx.fillStyle = '#38bdf8';
            ctx.font = `${12 / scale}px sans-serif`;
            ctx.fillText(obj.label.toUpperCase(), bx + 5, by - 6 / scale);
          });
        }

        ctx.restore();

        // Render Volumetric Particle Rays Overlay
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 8; i++) {
          const px = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * w;
          const py = (Math.cos(time * 0.3 + i * 2) * 0.5 + 0.5) * h;
          const radius = 30 + Math.sin(time + i) * 15;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Render Motion Grid Overlay Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(12, 12, 130, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`MOTION: ${(time * 10).toFixed(0)}s`, 22, 29);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeReel, isPlaying, motionStyle, playbackSpeed]);

  // Export Motion Canvas as downloadable WebM Video File using MediaRecorder
  const handleExportWebMVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExportingVideo(true);
    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `motion_video_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, 4000); // 4 sec clip
    } catch (e) {
      console.error("WebM export error:", e);
      setIsExportingVideo(false);
    }
  };

  const handleGenerateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    const activePrompt = generatorMode === 'prompt' ? prompt : (prompt || 'Animated Image Motion Reel');
    if (!activePrompt.trim() && !selectedSourceImage) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-video-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          aspectRatio,
          sourceImage: selectedSourceImage,
          motionStyle
        })
      });
      const data = await res.json();

      const newReel: VideoReel = {
        id: data.id || `reel_${Date.now()}`,
        title: data.title || activePrompt.slice(0, 35),
        prompt: activePrompt,
        aspectRatio,
        durationSeconds: 5,
        frames: selectedSourceImage ? [selectedSourceImage, ...data.frames] : (data.frames || []),
        thumbnailUrl: selectedSourceImage || data.thumbnailUrl || data.frames[0],
        createdAt: Date.now()
      };

      onAddReel(newReel);
      setActiveReel(newReel);
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedSourceImage(evt.target.result as string);
          setGeneratorMode('image-to-video');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const samplePrompts = [
    "Anamorphic 3D camera orbit around a sleek supersonic jet with glowing engine exhaust",
    "High speed drone flyby through a rainy cyberpunk Neo-Tokyo alleyway at night",
    "Bioluminescent deep sea flora swaying gently in underwater currents with raytraced light shafts",
    "Cinematic camera push-in on an futuristic AI android operator with glowing visor"
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 text-slate-100">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" /> Generative Video Reel & Motion Synthesis Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            AI Video Reel & Image-to-Video Motion Generator
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Transform text prompts or static artwork into dynamic 60fps camera motion video reels. Render 360° orbits, fly-throughs, and particle effects, export as WebM video, and publish directly to Twitter!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Creation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            {/* Generator Mode Switcher */}
            <div className="bg-slate-950 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGeneratorMode('prompt')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  generatorMode === 'prompt' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Text-to-Video
              </button>
              <button
                type="button"
                onClick={() => setGeneratorMode('image-to-video')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  generatorMode === 'image-to-video' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Image-to-Video
              </button>
            </div>

            <form onSubmit={handleGenerateReel} className="space-y-4">
              {/* Image Selection for Image-to-Video Mode */}
              {generatorMode === 'image-to-video' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Source Artwork:</span>
                    <label className="text-[10px] text-purple-400 hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload File
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </label>

                  {selectedSourceImage ? (
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-purple-500/50 group">
                      <img src={selectedSourceImage} alt="Selected source" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSelectedSourceImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-rose-400 hover:text-rose-300"
                      >
                        ✕
                      </button>
                    </div>
                  ) : images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setSelectedSourceImage(img.url)}
                          className="aspect-square bg-black rounded-lg overflow-hidden border border-slate-800 hover:border-purple-400 transition"
                        >
                          <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      No generated images available yet. Upload an image above or generate one in Image Studio!
                    </p>
                  )}
                </div>
              )}

              {/* Video Motion Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {generatorMode === 'prompt' ? 'Video Motion Prompt:' : 'Motion Guidance / Style Prompt:'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    generatorMode === 'prompt'
                      ? "Describe the camera motion sequence... (e.g. 'Cinematic drone camera orbit around a 3D supercar with glowing volumetric headlights')"
                      : "e.g. 'Animate with camera zoom, glowing particle rays, and volumetric atmosphere'"
                  }
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Sample Prompts */}
              {generatorMode === 'prompt' && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Quick Concepts:</div>
                  <div className="space-y-1">
                    {samplePrompts.slice(0, 3).map((sp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(sp)}
                        className="w-full text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 p-2 rounded-lg text-left truncate transition"
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Format / Aspect Ratio:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                      aspectRatio === '9:16'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> 9:16 Vertical
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                      aspectRatio === '16:9'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> 16:9 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                      aspectRatio === '1:1'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" /> 1:1 Square
                  </button>
                </div>
              </div>

              {/* Camera Motion Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Camera Motion Path:</label>
                <select
                  value={motionStyle}
                  onChange={(e) => setMotionStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="AI Object Tracking">AI Object Tracking (Auto-detect)</option>
                  <option value="360° Camera Orbit">360° Seamless Camera Orbit</option>
                  <option value="Drone Fly-through">Drone Forward Fly-through</option>
                  <option value="Slow Cinematic Pan">Slow Cinematic Horizontal Pan</option>
                  <option value="Push-In Zoom">Dramatic Push-In Focal Zoom</option>
                  <option value="Dynamic Wave">Dynamic Atmospheric Wave</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!prompt.trim() && !selectedSourceImage)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2 border border-purple-400/30"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" /> Rendering Motion Video Reel...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Video Motion Reel
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Video Canvas Motion Player & Reels Library (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Canvas Video Motion Player */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" /> Interactive Motion Video Player
              </h2>
              {activeReel && (
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/30">
                  {motionStyle}
                </span>
              )}
            </div>

            {activeReel ? (
              <div className="space-y-4">
                <div className={`mx-auto overflow-hidden rounded-2xl border border-purple-500/40 bg-black relative shadow-2xl ${
                  activeReel.aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : activeReel.aspectRatio === '1:1' ? 'max-w-md aspect-square' : 'w-full aspect-[16/9]'
                }`}>
                  <canvas ref={canvasRef} className="w-full h-full object-contain" />
                </div>

                {/* Player Controls */}
                <div className="flex flex-wrap items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause Motion' : 'Play Motion'}
                    </button>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                      {[0.5, 1, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={`px-2 py-0.5 rounded font-bold ${playbackSpeed === s ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Download WebM & Share to Twitter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportWebMVideo}
                      disabled={isExportingVideo}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      title="Download Motion Canvas as WebM Video"
                    >
                      <Download className={`w-3.5 h-3.5 ${isExportingVideo ? 'animate-bounce' : ''}`} />
                      {isExportingVideo ? 'Exporting WebM...' : 'Export WebM Video'}
                    </button>

                    <button
                      onClick={() => setSocialShareData({
                        title: activeReel.title,
                        content: activeReel.prompt,
                        imageUrl: activeReel.thumbnailUrl,
                        mediaType: 'video',
                        tags: ['AIVideo', 'VideoReel', 'MotionGraphics']
                      })}
                      className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Post to Twitter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-sm">
                Generate a video reel on the left to preview motion playback.
              </div>
            )}
          </div>

          {/* Reels Library */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Your Generative Video Reels ({reels.length})</span>
            </h3>
            {reels.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-900 p-4 rounded-xl border border-slate-800">
                No video reels generated yet. Start generating above!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reels.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setActiveReel(r);
                      setIsPlaying(true);
                    }}
                    className={`group cursor-pointer rounded-xl border p-2 bg-slate-900 transition hover:border-purple-500/50 relative ${
                      activeReel?.id === r.id ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-800'
                    }`}
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2 relative">
                      <img src={r.thumbnailUrl} alt={r.prompt} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
                        <Play className="w-7 h-7 text-white drop-shadow-md" />
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{r.title}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{r.aspectRatio} format</div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReel(r.id);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Social Share Modal */}
      {socialShareData && (
        <SocialShareModal
          isOpen={!!socialShareData}
          onClose={() => setSocialShareData(null)}
          data={socialShareData}
        />
      )}
    </div>
  );
}
