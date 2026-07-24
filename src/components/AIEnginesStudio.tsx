import React, { useState } from 'react';
import { AIToolResult } from '../types/creator';
import ReactMarkdown from 'react-markdown';
import { SocialShareModal, SocialShareData } from './SocialShareModal';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  Code, 
  Wand2, 
  Copy, 
  Check, 
  Layers, 
  RefreshCw,
  Terminal,
  FileCode,
  Megaphone,
  Box,
  Share2,
  BookOpen,
  Share,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

const ENGINE_TOOLS = [
  { 
    id: 'prompt-transformer', 
    name: 'Multimodal Prompt Transformer', 
    icon: Wand2, 
    desc: 'Transforms raw ideas into photorealistic, Unreal Engine 5 3D, and cinematic film prompts with lens focal lengths and Octane tags.' 
  },
  { 
    id: 'shader-transformer', 
    name: 'GLSL 3D Shader Engine', 
    icon: Code, 
    desc: 'Generates procedural Three.js GLSL vertex/fragment shaders for custom 3D materials, skyboxes, and particle effects.' 
  },
  { 
    id: 'copy-transformer', 
    name: 'Copy & Campaign Transformer', 
    icon: Megaphone, 
    desc: 'Transforms game or asset concepts into high-converting headlines, video reel storyboards, and launch sequences.' 
  },
  { 
    id: 'code-transformer', 
    name: 'Code & Architecture Refactoring Engine', 
    icon: FileCode, 
    desc: 'Analyzes codebases, fixes memory leaks, optimizes state loops, and refactors components into clean TypeScript.' 
  },
  { 
    id: 'mesh-transformer', 
    name: '3D Asset & Mesh Topology Transformer', 
    icon: Box, 
    desc: 'Converts 2D artwork into 3D polygon budgets, PBR map specs, and Blender procedural geometry Python scripts.' 
  },
  { 
    id: 'world-lore-transformer', 
    name: 'RPG Worldbuilding & Lore Transformer', 
    icon: BookOpen, 
    desc: 'Synthesizes AAA game world lore, character profiles, dialogue trees, and quest lines.' 
  },
  { 
    id: 'monocular-3d-diffusion', 
    name: 'Monocular 3D Diffusion & Splatting', 
    icon: Layers, 
    desc: 'Transforms 3D scene concepts into Real-Time 3D Scene Reconstruction architectural specs using Monocular Diffusion Models and Gaussian Splatting.' 
  },
  { 
    id: 'viral-social-transformer', 
    name: 'Twitter/X & Social Viral Thread Transformer', 
    icon: Share2, 
    desc: 'Transforms tech topics into viral Twitter threads, LinkedIn posts, and high-converting hashtag sets.' 
  }
];

export function AIEnginesStudio() {
  const [activeTool, setActiveTool] = useState('prompt-transformer');
  const [inputData, setInputData] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socialShareData, setSocialShareData] = useState<SocialShareData | null>(null);

  const [resultsHistory, setResultsHistory] = useState<AIToolResult[]>([
    {
      id: 'tool_sample_1',
      toolType: 'prompt-transformer',
      inputData: 'Supersonic jet in futuristic airport hangar',
      result: `### 1. Ultra Photorealistic 8K
\`\`a380 supersonic jet resting inside massive futuristic airport hangar, cinematic volumetric dusk lighting through glass ceiling, raytraced wet tarmac reflections, Hasselblad H6D-100c, 35mm lens, f/2.8 aperture, subtle heat haze from engine exhaust, photorealistic 8k octane render\`\`

### 2. Unreal Engine 5 3D Game Render
\`\`Hero asset aircraft hangar in Unreal Engine 5, raytraced neon blue light bars, PBR metallic materials, low poly exterior, 4k texture maps, high poly cockpit detail, game engine viewport capture\`\`

### 3. Cinematic Film Scene
\`\`Anamorphic 2.39:1 widescreen shot of jet in rain, moody cyber noir color grade, lens flare, film grain, atmospheric fog\`\``,
      createdAt: Date.now() - 3600000
    }
  ]);

  const [currentResult, setCurrentResult] = useState<AIToolResult | null>(resultsHistory[0]);

  const handleExecuteTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputData.trim()) return;

    setIsExecuting(true);
    try {
      const res = await fetch('/api/ai-tool-executor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolType: activeTool, inputData })
      });
      const data = await res.json();

      const newResult: AIToolResult = {
        id: `res_${Date.now()}`,
        toolType: activeTool,
        inputData,
        result: data.result || 'Execution completed with empty output.',
        createdAt: Date.now()
      };

      setResultsHistory((prev) => [newResult, ...prev]);
      setCurrentResult(newResult);
    } catch (e) {
      console.error("AI Tool execution error:", e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolObj = ENGINE_TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> High-Performance AI Transformer Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            AI Transformer & Tool Engine Suite
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Supercharged AI engines for creators and platform AIs. Transform prompts, synthesize GLSL Three.js shaders, refactor code, generate RPG game lore, optimize viral Twitter threads, and run automated AI tool pipelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Engine Selector & Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" /> Select Transformer Engine
            </h2>

            {/* Engine Tools List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {ENGINE_TOOLS.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTool(t.id)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-violet-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Transformer Execution Form */}
            <form onSubmit={handleExecuteTool} className="space-y-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Input Data for {currentToolObj?.name}:
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder={
                    activeTool === 'shader-transformer'
                      ? "e.g. 'Procedural water ripple shader with animated normal waves and glowing cyan foam'"
                      : activeTool === 'monocular-3d-diffusion'
                      ? "e.g. 'A real-time monocular 3D reconstruction of a specular wet pavement scene using diffusion priors'"
                      : activeTool === 'viral-social-transformer'
                      ? "e.g. 'Launching Aura AI Studio - Next gen 3D & Multimodal Generative Suite'"
                      : activeTool === 'code-transformer'
                      ? "e.g. 'Optimize Three.js animation rendering loop and reduce frame stutter'"
                      : "e.g. 'A futuristic 3D cyberpunk aircraft terminal with hovering jets'"
                  }
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isExecuting || !inputData.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2 border border-violet-400/30"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Executing AI Transformer...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Transformer Engine
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Transformer Output Console (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize">
                      {ENGINE_TOOLS.find((t) => t.id === currentResult.toolType)?.name || currentResult.toolType} Output
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      Generated at {new Date(currentResult.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSocialShareData({
                      title: `AI Transformer Output (${currentResult.toolType})`,
                      content: currentResult.result.slice(0, 250) + '...',
                      mediaType: 'campaign',
                      tags: ['AITransformer', 'AuraStudio', 'TechInnovation']
                    })}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Post to Twitter
                  </button>

                  <button
                    onClick={() => handleCopyResult(currentResult.result)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Output' : 'Copy Result'}
                  </button>
                </div>
              </div>

              {/* Rendered Markdown Output */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 max-h-[500px] overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-200 space-y-3 font-mono">
                <ReactMarkdown>{currentResult.result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-sm">
              Select a transformer engine on the left and click "Run Transformer Engine" to view structured output here.
            </div>
          )}

          {/* Execution History */}
          {resultsHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Engine Output Log History ({resultsHistory.length})</h3>
              <div className="space-y-2">
                {resultsHistory.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setCurrentResult(res)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      currentResult?.id === res.id ? 'bg-violet-950/60 border-violet-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate pr-4">
                      <div className="text-xs font-bold text-white capitalize">{res.toolType.replace('-', ' ')}</div>
                      <div className="text-[11px] text-slate-400 truncate">{res.inputData}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Publishing & Twitter Modal */}
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
