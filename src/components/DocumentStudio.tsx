import React, { useState, useEffect } from 'react';
import { GeneratedDocument } from '../types/creator';
import { db } from '../lib/firebase';
import { SEED_DOCUMENTS } from '../data/seedDocuments';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { SocialShareModal, SocialShareData } from './SocialShareModal';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  Megaphone, 
  Gamepad2, 
  Briefcase, 
  Layers, 
  Code, 
  Film, 
  Award,
  RefreshCw,
  Eye,
  Plus,
  Share2
} from 'lucide-react';

const DOC_TYPES = [
  { id: 'Research Journal', name: 'Research Journal / Scientific Paper', icon: BookOpen, desc: 'Hypothesis, Methodology, Data Analysis, Literature Review & Citations' },
  { id: 'Marketing Campaign & Strategy', name: 'Marketing Strategy & Campaign Brief', icon: Megaphone, desc: 'Target Personas, Reel Scripts, Ad Copy, Funnel & ROI Projection' },
  { id: 'Game Design Document (GDD)', name: 'Game Design Document (GDD)', icon: Gamepad2, desc: 'Game Mechanics, World Lore, Level Breakdown, Character Specs & Assets' },
  { id: 'Investor Pitch Deck', name: 'Investor Pitch Deck & Business Plan', icon: Briefcase, desc: 'Executive Summary, Problem/Solution, TAM Market, Financial Model & Milestones' },
  { id: 'Brand Identity & Style Guide', name: 'Brand Identity & Style Guide', icon: Layers, desc: 'Color System, Typography Ratios, Brand Voice, Logo Usage & Design Rules' },
  { id: 'Technical Whitepaper', name: 'Technical Whitepaper & API Architecture', icon: Code, desc: 'System Diagram, Data Models, Security Protocol, API Endpoints & Code Snippets' },
  { id: 'Film & Video Scriptboard', name: 'Film Script & Storyboard Breakdown', icon: Film, desc: 'Scene Synopsis, Dialogue, Camera Shot List, Lighting & Audio Cues' },
  { id: 'Patent Invention Draft', name: 'Patent Specification & Legal Draft', icon: Award, desc: 'Invention Summary, Technical Claims, Background, Embodiments & Prior Art' }
];

const SAMPLE_TEMPLATES = [
  {
    docType: 'Research Journal',
    topic: 'Neural Network Diffusion Models for Realtime 3D Scene Reconstruction from Monocular Video Streams',
    audience: 'AI Researchers & Computer Vision Engineers',
    requirements: 'Include mathematical formulations, loss functions, benchmark dataset comparisons (NeRF vs Gaussian Splatting), and memory optimization techniques.'
  },
  {
    docType: 'Marketing Campaign & Strategy',
    topic: 'Global Launch Strategy for Aura Creator AI Studio - Next-Gen Generative Suite for Game Developers & Digital Artists',
    audience: 'Indie Game Creators, 3D Artists, Motion Designers & Tech Enthusiasts',
    requirements: 'Include 3 viral TikTok/Reel scripts, email marketing sequence, influencer launch partnerships, and key conversion metrics.'
  },
  {
    docType: 'Game Design Document (GDD)',
    topic: 'Neon Horizon: Open-World Cyberpunk Flight Simulator & Tactical Jet Combat',
    audience: '3D Game Developers, Level Designers & Audio Engineers',
    requirements: 'Detail jet flight physics, weapon loadouts, airport hub interactive mechanics, mission design for Sector 7, and sound design matrix.'
  },
  {
    docType: 'Investor Pitch Deck',
    topic: 'Aura AI - Universal Generative Engine for Real-Time 3D & Multimodal Content Creation',
    audience: 'Venture Capitalists, Angel Investors & Enterprise Tech Partners',
    requirements: 'Highlight $15B SAM opportunity, competitive moat over legacy tools, SaaS pricing tiers, 18-month financial roadmap, and founding team capabilities.'
  }
];

const PERSONAS = [
  { id: 'Wired Science & Tech Journalist', name: 'Wired Journalist', desc: 'Anecdotes, deep analysis, research benchmarks & objective skepticism.' },
  { id: 'Bestselling Creative Storyteller', name: 'Creative Storyteller', desc: 'Malcolm Gladwell-style narrative hooks, vivid analogies & poetic flow.' },
  { id: 'McKinsey Business Consultant', name: 'Strategic Consultant', desc: 'Pyramid principle, MECE frameworks, SWOT matrix & TAM roadmap tables.' },
  { id: 'SEO Authority Specialist', name: 'SEO Authority', desc: 'Metadata cards, natural high keyword density, FAQs & scannable highlights.' },
  { id: 'System Architect & Technical Director', name: 'System Architect', desc: 'ASCII flowcharts, JSON schemas, API specifications & TypeScript examples.' }
];

const LENGTH_MODES = [
  { id: 'brief', name: 'Executive Brief', desc: '600–1000 words. High value & concise.' },
  { id: 'in-depth', name: 'Feature Article', desc: '1,500–2,500 words. Balanced deep dive.' },
  { id: 'epic', name: 'Epic Whitepaper (Pro)', desc: '3,000–4,500 words. Multi-section publication masterwork.' }
];

export function DocumentStudio() {
  const [docType, setDocType] = useState('Research Journal');
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyRequirements, setKeyRequirements] = useState('');
  const [tone, setTone] = useState('Authoritative, Technical & Creative');
  const [persona, setPersona] = useState('Wired Science & Tech Journalist');
  const [lengthMode, setLengthMode] = useState('in-depth');
  const [keywords, setKeywords] = useState('');
  const [includeDiagrams, setIncludeDiagrams] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<GeneratedDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [socialShareData, setSocialShareData] = useState<SocialShareData | null>(null);

  // Load documents from Firestore
  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      let list: GeneratedDocument[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as GeneratedDocument);
      });

      // Seeding database if empty to provide embedded platform assets
      if (list.length === 0) {
        console.log("Seeding platform with initial professional documents...");
        for (const seed of SEED_DOCUMENTS) {
          try {
            const docRef = await addDoc(collection(db, 'documents'), {
              title: seed.title,
              docType: seed.docType,
              topic: seed.topic,
              targetAudience: seed.targetAudience,
              content: seed.content,
              createdAt: Date.now() - (SEED_DOCUMENTS.indexOf(seed) * 1000)
            });
            list.push({
              id: docRef.id,
              title: seed.title,
              docType: seed.docType,
              topic: seed.topic,
              targetAudience: seed.targetAudience,
              content: seed.content,
              createdAt: Date.now() - (SEED_DOCUMENTS.indexOf(seed) * 1000)
            });
          } catch (seedErr) {
            console.error("Error seeding document:", seedErr);
          }
        }
        // sort by createdAt desc again
        list.sort((a, b) => b.createdAt - a.createdAt);
      }

      setDocuments(list);
      if (list.length > 0 && !activeDocument) {
        setActiveDocument(list[0]);
      }
    } catch (e) {
      console.error("Firestore error loading documents:", e);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          topic,
          targetAudience,
          keyRequirements,
          tone,
          persona,
          lengthMode,
          keywords,
          includeDiagrams
        })
      });
      const data = await res.json();

      const newDoc: GeneratedDocument = {
        id: `doc_${Date.now()}`,
        title: `${docType}: ${topic.slice(0, 40)}...`,
        docType: data.docType || docType,
        topic,
        targetAudience,
        content: data.content,
        createdAt: Date.now()
      };

      // Save to Firestore
      try {
        const firestoreRef = await addDoc(collection(db, 'documents'), {
          title: newDoc.title,
          docType: newDoc.docType,
          topic: newDoc.topic,
          targetAudience: newDoc.targetAudience || '',
          content: newDoc.content,
          createdAt: newDoc.createdAt
        });
        newDoc.id = firestoreRef.id;
      } catch (err) {
        console.error("Firestore save error:", err);
      }

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocument(newDoc);
    } catch (e) {
      console.error("Document generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (activeDocument?.id === id) {
        setActiveDocument(null);
      }
    } catch (e) {
      console.error("Delete document error:", e);
    }
  };

  const handleCopyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMarkdown = (docItem: GeneratedDocument) => {
    const blob = new Blob([docItem.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docItem.docType.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    setDocType(tpl.docType);
    setTopic(tpl.topic);
    setTargetAudience(tpl.audience);
    setKeyRequirements(tpl.requirements);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Full-Generator Creator Document Studio
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            AI Document Generator & Publishing Suite
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Generate full publication-ready research journals, marketing strategies, game design documents (GDD), pitch decks, brand style guides, whitepapers, and scripts with structured formatting and instant export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document Creation Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-blue-400" /> Document Specification
            </h2>

            {/* Quick Inspiration Templates */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instant Presets:</label>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-300">{tpl.docType}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{tpl.topic}</div>
                    </div>
                    <span className="text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition">Use →</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateDocument} className="space-y-4 pt-2">
              {/* Document Type Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map((dt) => {
                    const Icon = dt.icon;
                    const isSelected = docType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setDocType(dt.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{dt.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Topic or Title:</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe what you want this document to cover... (e.g. 'Aura Game Engine 3D Render Pipeline Specification & Physics Matrix')"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Audience:</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. '3D Game Developers, Investors, AI Researchers'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Key Focus & Specific Requirements */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Requirements & Sections:</label>
                <textarea
                  value={keyRequirements}
                  onChange={(e) => setKeyRequirements(e.target.value)}
                  placeholder="Specify specific metrics, sections, tables, or code snippets to include..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Editorial Persona Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Editorial Persona / Writer Style:</label>
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 bg-slate-950/40 p-2 rounded-xl border border-slate-800/80">
                  {PERSONAS.map((p) => {
                    const isSelected = persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersona(p.id)}
                        className={`w-full p-2.5 rounded-lg border text-left transition flex flex-col ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500/60 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{p.name}</span>
                        <span className="text-[10px] text-slate-400 leading-normal line-clamp-1 mt-0.5">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Length Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Length & Depth:</label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTH_MODES.map((lm) => {
                    const isSelected = lengthMode === lm.id;
                    return (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => setLengthMode(lm.id)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col justify-between min-h-[75px] ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                        title={lm.desc}
                      >
                        <span className="text-[11px] font-extrabold leading-tight">{lm.name}</span>
                        <span className="text-[9px] text-slate-400 leading-tight mt-1 line-clamp-2">{lm.desc.split('.')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Keywords / SEO */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Booster (Target Keywords):</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. '3D graphics, real-time NeRF, benchmark, simulation'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 leading-tight">Gemini will inject these key phrases naturally to optimize for search intent.</p>
              </div>

              {/* Diagrams Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-white block">Visual Layout Blueprints</span>
                  <span className="text-[10px] text-slate-400 block">Inject detailed text-based ASCII/Unicode diagrams & flowcharts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeDiagrams(!includeDiagrams)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${includeDiagrams ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${includeDiagrams ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 border border-blue-400/30"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating Creator Document...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Generate Full Document
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Generated Document Reader / Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeDocument ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{activeDocument.docType}</div>
                  <h2 className="text-xl font-extrabold text-white mt-1">{activeDocument.topic}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSocialShareData({
                      title: activeDocument.title,
                      content: activeDocument.content.slice(0, 300) + '...',
                      mediaType: 'document',
                      tags: [activeDocument.docType.replace(/[^a-z0-9]/gi, ''), 'Research', 'TechArticle']
                    })}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Post Article to Twitter
                  </button>

                  <button
                    onClick={() => handleCopyContent(activeDocument.content, activeDocument.id)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedId === activeDocument.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === activeDocument.id ? 'Copied' : 'Copy Text'}
                  </button>

                  <button
                    onClick={() => handleDownloadMarkdown(activeDocument)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .MD
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(activeDocument.id)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rendered Document Body */}
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-blue-400 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 text-slate-200 text-sm leading-relaxed space-y-4 max-h-[70vh] overflow-y-auto p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <ReactMarkdown>{activeDocument.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No document selected</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a preset template or configure your document parameters on the left to generate full research journals, marketing strategies, or pitch decks.
              </p>
            </div>
          )}

          {/* Saved Documents History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Document Archive ({documents.length})
            </h3>
            {isLoadingDocs ? (
              <p className="text-xs text-slate-500">Loading documents from Firestore...</p>
            ) : documents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No saved documents yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setActiveDocument(d)}
                    className={`cursor-pointer rounded-xl border p-3.5 bg-slate-900 transition hover:border-blue-500/50 space-y-1.5 ${
                      activeDocument?.id === d.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-blue-400 uppercase truncate">{d.docType}</div>
                    <div className="text-xs font-bold text-white line-clamp-1">{d.topic}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
