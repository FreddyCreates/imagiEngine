import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Terminal as TerminalIcon, 
  Send, 
  MessageSquare, 
  Compass, 
  Copy, 
  Check, 
  Zap, 
  Cpu, 
  Flame, 
  Layers, 
  ArrowRight, 
  Share2, 
  Eye, 
  Code, 
  FileText, 
  Gamepad2, 
  Megaphone, 
  RefreshCw 
} from 'lucide-react';
import { GeneratedImage, VideoReel } from '../types/creator';

interface HomeStudioProps {
  images: GeneratedImage[];
  reels: VideoReel[];
  onNavigateToTab: (tab: any) => void;
  onAddImage: (img: GeneratedImage) => void;
}

interface Message {
  role: 'user' | 'agent';
  content: string;
  thoughts?: string[];
  outcome?: {
    type: string;
    title: string;
    content: string;
  };
}

export function HomeStudio({ images, reels, onNavigateToTab, onAddImage }: HomeStudioProps) {
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: "Welcome to Aura Creator AI Studio Workspace! 🌌 I am your core Workspace Agent. Ask me to draft detailed document outlines, design visual prompts, create game specs, or build campaigns—I will output copyable production-ready masterworks right here.",
      thoughts: [
        "Core workspace model loaded successfully",
        "Aesthetic database linked (Gemini 3.5-Flash)",
        "Standing by for creative commands..."
      ]
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [activeThoughts, setActiveThoughts] = useState<string[]>([]);
  const [thoughtProgress, setThoughtProgress] = useState(0);

  // Inspiration state
  const [inspiration, setInspiration] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeThoughts]);

  // Handle Quick Chat Prompt Suggestions
  const handleQuickCommand = (promptText: string) => {
    setChatInput(promptText);
  };

  // Live Stream Simulation for Chat Response Thoughts
  const simulateLiveThoughts = async (thoughts: string[]) => {
    setActiveThoughts([]);
    setThoughtProgress(0);
    for (let i = 0; i < thoughts.length; i++) {
      setActiveThoughts((prev) => [...prev, thoughts[i]]);
      // Simulate progress ticks
      for (let p = 0; p <= 100; p += 20) {
        setThoughtProgress(p);
        await new Promise((r) => setTimeout(r, 60));
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userMsg = chatInput.trim();
    if (!userMsg || isSending) return;

    setChatInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setIsSending(true);

    // Initial stream thoughts
    await simulateLiveThoughts([
      "Parsing user prompt parameters...",
      "Matching workspace context & historical aesthetic metrics...",
      "Consulting generative engines (Gemini 3.1-Flash-Lite)..."
    ]);

    try {
      const formattedHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/workspace-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: formattedHistory })
      });

      const data = await res.json();

      if (data.agentThoughts && data.agentThoughts.length > 0) {
        await simulateLiveThoughts(data.agentThoughts);
      } else {
        await simulateLiveThoughts(["Completing creative asset synthesis...", "Finalizing content layout..."]);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: data.response || "Here is the compiled work item.",
          thoughts: data.agentThoughts || [],
          outcome: data.workOutcome
        }
      ]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: "I encountered a synchronization error with the main server engine. However, we can run on local backup protocols.",
          outcome: {
            type: "chat",
            title: "Local Sync Interrupted",
            content: "Please check your network connection or retry the request shortly."
          }
        }
      ]);
    } finally {
      setIsSending(false);
      setActiveThoughts([]);
      setThoughtProgress(0);
    }
  };

  // Generate dynamic, extremely detailed creator inspiration ideas
  const handleGenerateInspiration = () => {
    const subjects = [
      "Cybernetic biome-dome city nestled inside a hollow asteroid",
      "An ancient futuristic visual library guarded by a giant holographic glowing owl",
      "Deep sea marine laboratory with glowing bioluminescent sub-surface vessels",
      "Sleek hypercar prototype made of liquid-chrome metal cruising on a rain-slicked Tokyo strip",
      "Interdimensional traveler standing in front of a giant cosmic gateway",
      "Minimalist organic solar-powered resort built on steep volcanic cliffs in Iceland"
    ];

    const aesthetics = [
      "Cyberpunk Noir with heavy vaporwave haze and wet street asphalt reflections",
      "Photorealistic Architectural Digest style, pristine morning sunlight, highly crisp details",
      "Retro-futuristic Solarpunk, rich emerald greens, warm brass framing, fluid solar tiles",
      "Cinematic AAA Game Render, Unreal Engine 5 PBR, extreme depth of field, subtle raytraced fog",
      "Surrealist high-fashion editorial, hyper-detailed drapery, dramatic studio key light"
    ];

    const cameras = [
      "Hasselblad H6D-100c, 80mm f/1.8 lens, incredible sharpness, micro-contrast details",
      "Anamorphic Arri Alexa 65, cinematic 2.39:1 aspect, gorgeous oval background bokeh flares",
      "Sony Alpha 1 macro lens f/2.8, extreme close-up focus, rich surface grain and pore detail",
      "RED V-Raptor, ultra-wide 16mm lens, sweeping high-contrast dynamic perspective"
    ];

    const lighting = [
      "Volumetric god rays filtering through golden hour dust particles",
      "Biomorphic teal and magenta neon key light with high-intensity rim highlights",
      "Dramatic overcast mood with soft diffused shadow profiles and high silver metallic speculars",
      "Dynamic studio split-lighting with warm tungsten amber and cold blue fill accents"
    ];

    const keywords = [
      "octane render, masterpiece, hyper-detailed, raytraced reflection, award winning, 8k resolution, cinematic composition"
    ];

    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomAesthetic = aesthetics[Math.floor(Math.random() * aesthetics.length)];
    const randomCamera = cameras[Math.floor(Math.random() * cameras.length)];
    const randomLighting = lighting[Math.floor(Math.random() * lighting.length)];
    
    const combinedPrompt = `${randomSubject}, ${randomAesthetic}, shot on ${randomCamera}, lit by ${randomLighting}, ${keywords[0]}`;

    setInspiration({
      subject: randomSubject,
      aesthetic: randomAesthetic,
      camera: randomCamera,
      lighting: randomLighting,
      fullPrompt: combinedPrompt
    });
  };

  useEffect(() => {
    handleGenerateInspiration();
  }, []);

  const handleCopyText = (text: string, indexKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexKey);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fadeIn">
      
      {/* 1. Header Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Creator Command Center Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
              Welcome to the Aura Studio Workspace
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Synthesize visual masterpieces, publication-ready documents, 3D interactive mechanics, and high-conversion marketing outlines in an interconnected professional creative environment.
            </p>
          </div>

          {/* Quick Studio Overview Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center min-w-[120px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Generated Assets</span>
              <span className="text-lg font-black text-indigo-400">{images.length + reels.length}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center min-w-[120px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">AI Engine Latency</span>
              <span className="text-lg font-black text-emerald-400">~240ms</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center min-w-[120px] shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Engine Core</span>
              <span className="text-xs font-black text-slate-200 block mt-1 bg-slate-800 py-0.5 px-2 rounded-lg truncate">Gemini 3.1-Flash-Lite</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Engine Status Monitor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-white block truncate">Gemini 3.1-Flash-Lite</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Active / Multi-Agent
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-pink-600/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-white block truncate">Imagen 3.0 HD</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Direct Pipeline
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-white block truncate">Veo Cinematic v2</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Reel Generator
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-white block truncate">ThreeJS WebGL</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> GPU Accelerated
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Area: Left (AI Streaming Agent Panel) | Right (Inspiration & Activity Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): AI Streaming Workspace Agent */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl min-h-[600px]">
          
          {/* Studio Agent Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <TerminalIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">AURA Core Workspace Agent</span>
                <span className="text-[10px] text-slate-400 block">Live agent stream connected</span>
              </div>
            </div>
            
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
              GEMINI_3.1_CONNECTED
            </span>
          </div>

          {/* Thoughts Stream Area (ONLY visible while agent is running) */}
          {isSending && (
            <div className="bg-slate-950 p-3.5 border-b border-slate-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                  Live AI Agent Workstream
                </span>
                <span className="text-[10px] font-mono text-slate-500">{thoughtProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${thoughtProgress}%` }}
                />
              </div>
              <div className="space-y-1 max-h-[90px] overflow-y-auto font-mono text-[10px] text-slate-400">
                {activeThoughts.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-fadeIn">
                    <span className="text-indigo-500 font-bold">&gt;&gt;</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
            {messages.map((m, mIdx) => (
              <div 
                key={mIdx}
                className={`flex flex-col space-y-2 max-w-[90%] ${
                  m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {m.role === 'user' ? 'Creator' : 'AURA Workspace Agent'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>

                {/* Structured Work Outcome Asset */}
                {m.outcome && (
                  <div className="w-full bg-slate-950 border border-indigo-500/20 rounded-2xl p-4 mt-2 space-y-3 shadow-inner animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        {m.outcome.type === 'image-prompts' && <Compass className="w-4 h-4 text-emerald-400" />}
                        {m.outcome.type === 'doc-outline' && <FileText className="w-4 h-4 text-sky-400" />}
                        {m.outcome.type === 'game-mechanics' && <Gamepad2 className="w-4 h-4 text-amber-400" />}
                        {m.outcome.type === 'marketing-pitch' && <Megaphone className="w-4 h-4 text-rose-400" />}
                        {m.outcome.type === 'chat' && <MessageSquare className="w-4 h-4 text-indigo-400" />}
                        <span className="text-xs font-extrabold text-white">{m.outcome.title}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCopyText(m.outcome!.content, `outcome-${mIdx}`)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 flex items-center gap-1 transition"
                      >
                        {copiedIndex === `outcome-${mIdx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy Asset</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-slate-300 overflow-x-auto font-mono bg-slate-900/50 p-3 rounded-xl max-h-[250px] overflow-y-auto leading-relaxed border border-slate-800">
                      <p className="whitespace-pre-wrap">{m.outcome.content}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {m.outcome.type === 'image-prompts' && (
                        <button
                          onClick={() => onNavigateToTab('images')}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition"
                        >
                          Send to Image Studio <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {m.outcome.type === 'doc-outline' && (
                        <button
                          onClick={() => onNavigateToTab('doc')}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition"
                        >
                          Launch Document Gen <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Ideas & Commands Board */}
          <div className="p-3 bg-slate-950 border-t border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2 px-1">Quick Action Blueprints:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickCommand("Brainstorm 3 cinematic art prompts for a deep sea glowing alien city")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-200 transition font-medium flex items-center gap-1"
              >
                🌌 <span>3 Image Ideas</span>
              </button>
              <button
                onClick={() => handleQuickCommand("Outline a strategic marketing whitepaper for a supersonic electric air taxi")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-200 transition font-medium flex items-center gap-1"
              >
                📝 <span>Ad Whitepaper</span>
              </button>
              <button
                onClick={() => handleQuickCommand("Design three RPG survival mechanics for a cyberpunk city building game")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-200 transition font-medium flex items-center gap-1"
              >
                🎮 <span>Game Mechanics</span>
              </button>
              <button
                onClick={() => handleQuickCommand("Draft 3 high-conversion viral tweets for an AI-generated luxury watch launch")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] text-slate-200 transition font-medium flex items-center gap-1"
              >
                🚀 <span>Viral Pitch</span>
              </button>
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Describe what asset or outline you want to design..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isSending}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column (4 cols): Inspiration Deck & Studio Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. Live Inspiration Hub Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Aesthetic Architect</span>
              </div>
              <button
                onClick={handleGenerateInspiration}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                title="Reroll inspiration parameters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {inspiration && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Subject Theme</span>
                  <p className="text-xs text-white font-semibold leading-snug">{inspiration.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-bold mb-0.5">Aesthetic / Vibe</span>
                    <span className="text-slate-200 block truncate font-medium">{inspiration.aesthetic.split(' ')[0]}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-bold mb-0.5">Optics Spec</span>
                    <span className="text-slate-200 block truncate font-medium">{inspiration.camera.split(',')[0]}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Complete AI Prompt Specs</span>
                    <button
                      onClick={() => handleCopyText(inspiration.fullPrompt, 'inspiration')}
                      className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 transition"
                    >
                      {copiedIndex === 'inspiration' ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono select-all select-none line-clamp-3">
                    {inspiration.fullPrompt}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* B. Studio Feed / Recent Activities */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider">Studio Assets Feed</span>
              <span className="text-[10px] text-slate-400 font-medium">Ready in cloud</span>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {images.map((img, index) => (
                <div 
                  key={img.id || index}
                  onClick={() => onNavigateToTab('images')}
                  className="group bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/30 p-2 rounded-xl flex items-center gap-3 cursor-pointer transition"
                >
                  <img 
                    src={img.url} 
                    alt={img.prompt}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-white block truncate">{img.prompt}</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide block mt-0.5">{img.style || 'photorealistic'}</span>
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs font-semibold">
                  No images generated yet. Launch Image Studio!
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
