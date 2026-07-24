import React, { useState, useEffect } from 'react';
import { GeneratedImage, PlatformLearnedMemory, UserLibraryItem } from '../types/creator';
import { db, auth, getCurrentUserId } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { downloadImageDirectly } from '../utils/download';
import { saveImageToLibrary, removeFromLibrary, fetchUserLibrary, updateLibraryNotes } from '../lib/libraryService';
import { MarketerImageEditorModal } from './MarketerImageEditorModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { PromptAnalytics } from './PromptAnalytics';
import { ImageLightboxModal } from './ImageLightboxModal';
import { SocialShareModal, SocialShareData } from './SocialShareModal';
import { PortfolioSelectModal } from './PortfolioSelectModal';
import { autoSaveToDefaultPortfolio, addImageToPortfolio } from '../lib/portfolioService';
import { shareToTwitter, shareUniversal } from '../utils/share';
import { 
  Wand2, 
  Dices,
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  Maximize2, 
  Copy, 
  Check, 
  Trash2, 
  Share2, 
  Layers, 
  RefreshCw,
  Camera,
  Brain,
  Cpu,
  Zap,
  Info,
  CreditCard,
  CheckCircle2,
  Edit3,
  History,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  FolderHeart,
  User,
  LogIn,
  LogOut,
  Tag,
  FileText,
  Library,
  Plus,
  Search,
  Video,
  Database,
  Zap,
  Image as ImageIcon,
  Cpu
} from 'lucide-react';

interface ImageStudioProps {
  images: GeneratedImage[];
  onAddImage: (img: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
  activeReferenceImage?: string | null;
  onClearReference?: () => void;
  onNavigateToVideoMotion?: (imageUrl: string) => void;
}

const LIGHTING_OPTIONS = [
  'Golden Hour Sunset & Lens Flare',
  'Dramatic Volumetric Rays',
  'Cyberpunk Neon Glow',
  'Studio Softbox & Rim Lighting',
  'Moody Dark Atmospheric Fog',
  'Bioluminescent Radiant Accent'
];

const PERSPECTIVE_OPTIONS = [
  'Wide-Angle Architectural View',
  'Low-Angle Hero Viewpoint',
  'Aerial Drone Panorama',
  '85mm Macro Shallow Depth of Field',
  'Cinematic Eye-Level Shot',
  'Dynamic Isometric 3D View'
];

const QUALITY_ENGINE_OPTIONS = [
  'Photorealistic 8K Octane Render',
  'Unreal Engine 5 Photorealism',
  'Luxury Commercial Photography',
  'Sleek Minimalist Vector Art',
  'Vibrant ArtStation Masterpiece'
];

const MARKETING_VIBE_OPTIONS = [
  'High-Conversion SaaS Hero Asset',
  'Premium Luxury Brand Editorial',
  'Futuristic Tech Concept Showcase',
  'E-Commerce Product Spotlight',
  'High-Impact Social Media Visual'
];

const STYLES = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸', desc: 'Ultra-detailed realistic lighting & textures' },
  { id: '3d-game', name: '3D Game Engine', icon: '🎮', desc: 'Unreal Engine 5 realtime 3D game style' },
  { id: 'concept-art', name: 'Concept Art', icon: '🎨', desc: 'Digital painting and character design' },
  { id: 'cyberpunk', name: 'Cyberpunk Sci-Fi', icon: '🌆', desc: 'Neon lighting & futuristic architecture' },
  { id: 'cinematic', name: 'Cinematic Film', icon: '📽️', desc: 'Anamorphic lens, 35mm film grain, 8k' },
  { id: 'anime', name: 'Anime / Manga', icon: '🏮', desc: 'Vibrant cel-shaded anime aesthetic' },
  { id: 'research', name: 'Research & Science', icon: '🔬', desc: 'Clean medical, technical & scientific diagram' },
  { id: 'pixel-art', name: 'Pixel Art', icon: '👾', desc: 'Retro 16-bit arcade style' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', desc: 'Portfolios & Social' },
  { id: '16:9', label: '16:9 Cinematic', desc: 'Desktop & Video' },
  { id: '9:16', label: '9:16 Vertical', desc: 'Reels & Mobile' },
  { id: '4:3', label: '4:3 Studio', desc: 'Classic Render' }
];

export function ImageStudio({
  images: parentImages,
  onAddImage,
  onDeleteImage,
  activeReferenceImage,
  onClearReference,
  onNavigateToVideoMotion
}: ImageStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<GeneratedImage | null>(null);
  const [editingMarketerImage, setEditingMarketerImage] = useState<GeneratedImage | null>(null);
  const [versionHistoryImage, setVersionHistoryImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [socialShareData, setSocialShareData] = useState<SocialShareData | null>(null);
  const [selectedPortfolioSelectImg, setSelectedPortfolioSelectImg] = useState<GeneratedImage | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [showTwiceEnhancePanel, setShowTwiceEnhancePanel] = useState(false);
  const [isTwiceExpanding, setIsTwiceExpanding] = useState(false);

  // Structured Marketing Prompt Builder State
  const [showStructuredBuilder, setShowStructuredBuilder] = useState(false);
  const [subjectCore, setSubjectCore] = useState('');
  const [selectedLighting, setSelectedLighting] = useState('Golden Hour Sunset & Lens Flare');
  const [selectedPerspective, setSelectedPerspective] = useState('Wide-Angle Architectural View');
  const [selectedQualityEngine, setSelectedQualityEngine] = useState('Photorealistic 8K Octane Render');
  const [selectedMarketingVibe, setSelectedMarketingVibe] = useState('High-Conversion SaaS Hero Asset');

  const applyStructuredPrompt = (
    core = subjectCore,
    light = selectedLighting,
    persp = selectedPerspective,
    engine = selectedQualityEngine,
    vibe = selectedMarketingVibe
  ) => {
    const coreText = core.trim() || (prompt.trim() ? prompt : 'A futuristic glass airport terminal with hovering aircraft at sunset');
    const assembled = `${coreText}. Style Descriptors: [Lighting: ${light}] [Perspective: ${persp}] [Engine: ${engine}] [Marketing Vibe: ${vibe}].`;
    setPrompt(assembled);
  };

  // Download Credits State (100 Free Downloads, then $0.05/download)
  const [downloadsRemaining, setDownloadsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('creator_download_credits');
    return saved !== null ? parseInt(saved, 10) : 100;
  });
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // User Persistent Storage Library State
  const [userLibrary, setUserLibrary] = useState<UserLibraryItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'library'>('all');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryStyleFilter, setLibraryStyleFilter] = useState('all');
  const [savingImageId, setSavingImageId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  // Track Firebase Auth State & Load Persistent User Library
  useEffect(() => {
    // Load data regardless of auth state (will use guest ID if not logged in)
    fetchFirestoreImages();
    loadUserLibrary();

    const unsub = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
      if (usr) {
        // Re-load if the user logs in to fetch their real data
        fetchFirestoreImages();
        loadUserLibrary();
      }
    });
    return () => unsub();
  }, []);

  const loadUserLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const items = await fetchUserLibrary();
      setUserLibrary(items);
    } catch (e) {
      console.error("Error loading user library:", e);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setToastMessage('Signed in with Google! Your library is now synced.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error("Google sign in error:", e);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      setToastMessage('Signed out. Using local persistent guest library.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const isSavedInLibrary = (imgId: string, imgUrl?: string): boolean => {
    return userLibrary.some(
      (item) => item.imageId === imgId || (imgUrl && item.url === imgUrl)
    );
  };

  const getLibraryItemForImage = (imgId: string, imgUrl?: string): UserLibraryItem | undefined => {
    return userLibrary.find(
      (item) => item.imageId === imgId || (imgUrl && item.url === imgUrl)
    );
  };

  const handleToggleSaveToLibrary = async (img: GeneratedImage, notes = '', tags: string[] = []) => {
    const existing = getLibraryItemForImage(img.id, img.url);
    setSavingImageId(img.id);
    try {
      if (existing) {
        const success = await removeFromLibrary(existing.id);
        if (success) {
          setUserLibrary((prev) => prev.filter((item) => item.id !== existing.id));
          setToastMessage('Asset removed from your Saved Library.');
        }
      } else {
        const created = await saveImageToLibrary(img, notes, tags);
        setUserLibrary((prev) => [created, ...prev]);
        setToastMessage('✨ Asset saved to your persistent Firebase Library collection!');
      }
    } catch (e) {
      console.error('Error toggling save to library:', e);
      setToastMessage('Failed to save to library. Please try again.');
    } finally {
      setSavingImageId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSaveNotes = async (itemId: string, notes: string) => {
    await updateLibraryNotes(itemId, notes);
    setUserLibrary((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
    setEditingNotesItemId(null);
    setToastMessage('Library notes saved successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('creator_download_credits', downloadsRemaining.toString());
  }, [downloadsRemaining]);

  const handleSaveEditedImage = async (newImg: GeneratedImage) => {
    try {
      const docRef = await addDoc(collection(db, 'generated_images'), {
        url: newImg.url,
        prompt: newImg.prompt,
        caption: newImg.caption,
        style: newImg.style,
        aspectRatio: newImg.aspectRatio,
        createdAt: newImg.createdAt,
        userId: getCurrentUserId(),
        parentId: newImg.parentId || '',
        rootId: newImg.rootId || newImg.parentId || '',
        version: newImg.version || 2,
        marketingOverlay: newImg.marketingOverlay || null,
        editHistory: newImg.editHistory || []
      });
      newImg.id = docRef.id;

      const updated = [newImg, ...firestoreImages];
      setFirestoreImages(updated);
      onAddImage(newImg);
      triggerPlatformLearning(updated);
    } catch (e) {
      console.error("Error persisting edited image to Firestore:", e);
    }
  };

  const handleRevertToVersion = async (targetVersionImg: GeneratedImage) => {
    const rootId = targetVersionImg.rootId || targetVersionImg.parentId || targetVersionImg.id;
    const familyImgs = displayedImages.filter(
      (img) => img.id === rootId || img.parentId === rootId || img.rootId === rootId || (targetVersionImg.parentId && img.id === targetVersionImg.parentId)
    );
    const maxVer = Math.max(...familyImgs.map((i) => i.version || 1), targetVersionImg.version || 1);
    const nextVer = maxVer + 1;

    const revertedImg: GeneratedImage = {
      id: `img_reverted_${Date.now()}`,
      url: targetVersionImg.url,
      prompt: targetVersionImg.prompt,
      caption: `Reverted to v${targetVersionImg.version || 1}: ${targetVersionImg.caption || targetVersionImg.prompt}`,
      style: targetVersionImg.style,
      aspectRatio: targetVersionImg.aspectRatio,
      createdAt: Date.now(),
      parentId: targetVersionImg.id,
      rootId: rootId,
      version: nextVer,
      marketingOverlay: targetVersionImg.marketingOverlay,
      editHistory: [
        ...(targetVersionImg.editHistory || []),
        {
          action: `Reverted back to Version v${targetVersionImg.version || 1}`,
          timestamp: Date.now()
        }
      ]
    };

    await handleSaveEditedImage(revertedImg);
    setVersionHistoryImage(null);
  };

  const handleDownloadImage = async (imgUrl: string, imgId: string, customName?: string) => {
    if (downloadsRemaining <= 0) {
      setShowBillingModal(true);
      return;
    }

    setIsDownloading(imgId);
    try {
      const fileName = customName || `ai_studio_art_${imgId.slice(-6)}.png`;
      const success = await downloadImageDirectly(imgUrl, fileName);
      if (success) {
        setDownloadsRemaining((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setIsDownloading(null);
    }
  };

  const handlePurchaseCredits = (amount: number) => {
    setDownloadsRemaining((prev) => prev + amount);
    setShowBillingModal(false);
  };

  // Firestore Persisted Local Gallery State
  const [firestoreImages, setFirestoreImages] = useState<GeneratedImage[]>([]);
  const [isLoadingFirestore, setIsLoadingLoadingFirestore] = useState(true);

  // Platform Memory State
  const [platformMemory, setPlatformMemory] = useState<PlatformLearnedMemory>({
    totalLearned: 0,
    topKeywords: ['photorealistic', 'raytraced', 'cinematic', '3d game', 'vivid lighting'],
    learnedAesthetic: 'Hyperrealistic Multimodal Engine',
    confidenceScore: 0.94,
    insights: ['Python learner absorbing visual feature vectors.', 'Prompt feedback weights synchronized to Firestore.']
  });
  const [isLearning, setIsLearning] = useState(false);

  // Load Persisted Firestore Images
  const fetchFirestoreImages = async () => {
    setIsLoadingLoadingFirestore(true);
    try {
      const q = query(
        collection(db, 'generated_images'),
        where('userId', '==', getCurrentUserId()),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list: GeneratedImage[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as GeneratedImage);
      });
      setFirestoreImages(list);

      // Trigger Python learning cycle on loaded dataset
      if (list.length > 0) {
        triggerPlatformLearning(list);
      }
    } catch (e) {
      console.error("Error fetching Firestore images:", e);
    } finally {
      setIsLoadingLoadingFirestore(false);
    }
  };



  // Run Platform Learner
  const triggerPlatformLearning = async (dataset: GeneratedImage[]) => {
    setIsLearning(true);
    try {
      const res = await fetch('/api/learn-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: dataset })
      });
      const data = await res.json();
      if (data.learnedMemory) {
        setPlatformMemory(data.learnedMemory);
      }
    } catch (e) {
      console.error("Platform learning sync error:", e);
    } finally {
      setIsLearning(false);
    }
  };

  const handleExpandPrompt = async () => {
    if (!prompt.trim()) return;
    setIsExpanding(true);
    try {
      const res = await fetch('/api/expand-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          mode: 'Image',
          learnedMemory: platformMemory
        })
      });
      const data = await res.json();
      if (data.expandedPrompt) {
        setPrompt(data.expandedPrompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleTwiceEnhance = async () => {
    if (!prompt.trim()) return;
    setIsTwiceExpanding(true);
    try {
      const res = await fetch('/api/expand-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          mode: 'Image',
          learnedMemory: platformMemory,
          isTwiceEnhance: true,
          customInstruction: customInstruction.trim()
        })
      });
      const data = await res.json();
      if (data.expandedPrompt) {
        setPrompt(data.expandedPrompt);
        setToastMessage('🔥 Prompt Twice-Enhanced to ultra-detailed production masterwork!');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      console.error(e);
      setToastMessage('Failed to connect to prompt expansion engine.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsTwiceExpanding(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent, isRandomMode = false) => {
    if (e) e.preventDefault();
    if (!isRandomMode && !prompt.trim()) return;

    if (isRandomMode) {
      setIsGeneratingRandom(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: isRandomMode ? '' : prompt,
          style: selectedStyle,
          aspectRatio,
          referenceImage: activeReferenceImage || undefined,
          isRandom: isRandomMode,
          historyCount: firestoreImages.length
        })
      });
      const data = await res.json();

      const newImg: GeneratedImage = {
        id: `img_${Date.now()}`,
        url: data.imageUrl,
        prompt: data.prompt,
        caption: data.caption || data.prompt,
        style: data.style,
        aspectRatio: data.aspectRatio,
        createdAt: Date.now(),
        isRandom: isRandomMode,
        learnedInsight: data.learnedInsight,
        metadata: data.metadata,
        version: 1
      };

      // Instantly show image in UI
      setFirestoreImages((prev) => [newImg, ...prev]);
      onAddImage(newImg);

      if (isRandomMode) {
        setPrompt(data.prompt);
      }

      // Persist to Firestore in background asynchronously
      addDoc(collection(db, 'generated_images'), {
        url: newImg.url,
        prompt: newImg.prompt,
        caption: newImg.caption,
        style: newImg.style,
        aspectRatio: newImg.aspectRatio,
        createdAt: newImg.createdAt,
        userId: getCurrentUserId(),
        isRandom: !!newImg.isRandom,
        learnedInsight: newImg.learnedInsight || '',
        metadata: newImg.metadata || {},
        version: 1
      }).then((docRef) => {
        newImg.id = docRef.id;
        
        // Auto-save generated image to default/custom portfolio
        const autoSaveEnabled = localStorage.getItem('auto_save_to_portfolio') === 'true';
        const defaultPortfolioId = localStorage.getItem('default_portfolio_id');
        if (autoSaveEnabled && defaultPortfolioId) {
          addImageToPortfolio(defaultPortfolioId, newImg);
        } else {
          autoSaveToDefaultPortfolio(newImg);
        }
      }).catch((err) => {
        console.error("Firestore persistence error:", err);
      });

    } catch (err) {
      console.error("Generation failed:", err);
      // Instant local fallback generation so user never gets stuck
      const activePrompt = prompt.trim() || "Futuristic masterpiece";
      const seed = Math.floor(Math.random() * 900000) + 100000;
      const dimsMap: Record<string, { w: number; h: number }> = {
        '1:1': { w: 1024, h: 1024 },
        '16:9': { w: 1280, h: 720 },
        '9:16': { w: 720, h: 1280 },
        '4:3': { w: 1024, h: 768 }
      };
      const dims = dimsMap[aspectRatio] || { w: 1024, h: 1024 };
      const encoded = encodeURIComponent(`${activePrompt}, ${selectedStyle} style, 8k resolution, cinematic lighting`);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dims.w}&height=${dims.h}&seed=${seed}&nologo=true`;

      const fallbackImg: GeneratedImage = {
        id: `img_${Date.now()}`,
        url: fallbackUrl,
        prompt: activePrompt,
        caption: `${activePrompt} (${selectedStyle} style)`,
        style: selectedStyle,
        aspectRatio,
        createdAt: Date.now(),
        isRandom: isRandomMode,
        version: 1
      };

      setFirestoreImages((prev) => [fallbackImg, ...prev]);
      onAddImage(fallbackImg);

      // Auto-save generated fallback image to default/custom portfolio
      const autoSaveEnabled = localStorage.getItem('auto_save_to_portfolio') === 'true';
      const defaultPortfolioId = localStorage.getItem('default_portfolio_id');
      if (autoSaveEnabled && defaultPortfolioId) {
        addImageToPortfolio(defaultPortfolioId, fallbackImg);
      } else {
        autoSaveToDefaultPortfolio(fallbackImg);
      }
    } finally {
      setIsGenerating(false);
      setIsGeneratingRandom(false);
    }
  };

  const handleDeleteImagePersistent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'generated_images', id));
      const filtered = firestoreImages.filter((img) => img.id !== id);
      setFirestoreImages(filtered);
      onDeleteImage(id);
      if (selectedImageModal?.id === id) {
        setSelectedImageModal(null);
      }
    } catch (e) {
      console.error("Firestore delete error:", e);
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "Futuristic sci-fi airport terminal with hovering aircrafts at sunset, raytraced glass reflections",
    "Hyperrealistic portrait of a cyberpunk game protagonist with glowing tactical visor",
    "Detailed 3D low-poly fantasy forest environment with glowing magical mushrooms",
    "Photorealistic research laboratory with holographic data displays and medical AI"
  ];

  // Combined gallery view prioritizing persisted Firestore images
  const displayedImages = firestoreImages.length > 0 ? firestoreImages : parentImages;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 text-slate-100">
      {/* Top Banner / Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Generative Engine & Memory Pipeline
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            AI Image Studio & Autonomous Learning Engine
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Generate prompt-matched artwork or fun random creations. Every generated image is persistently saved into memory and absorbed by the Python learner engine to adapt platform aesthetics continuously.
          </p>
        </div>

        {/* Creator Download Credits Widget */}
        <div className="relative z-10 bg-slate-950/80 border border-indigo-500/40 rounded-2xl p-4 md:p-5 space-y-2 min-w-[240px] text-center shadow-xl">
          <div className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Creator Download Credits
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {downloadsRemaining} <span className="text-xs text-slate-400 font-normal">/ 100 Free</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {downloadsRemaining > 0 ? '100 Free Downloads Included' : 'Free downloads used ($0.05/download)'}
          </p>
          <button
            onClick={() => setShowBillingModal(true)}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Top Up Credits
          </button>
        </div>
      </div>

      {/* Platform Learning & Memory Engine Status Card */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Python Platform Learner Memory</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {isLearning ? 'Absorbing Vector Memory...' : 'Memory Synced & Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Learned Aesthetic: <strong className="text-indigo-300">{platformMemory.learnedAesthetic}</strong> (Confidence: {(platformMemory.confidenceScore * 100).toFixed(0)}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Absorbed Creations:</div>
              <div className="text-lg font-black text-white">{displayedImages.length}</div>
            </div>
            <button
              onClick={() => triggerPlatformLearning(firestoreImages)}
              disabled={isLearning}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-semibold border border-indigo-500/30 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLearning ? 'animate-spin' : ''}`} />
              Re-Learn Memory
            </button>
          </div>
        </div>

        {/* Learned Insights Badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 self-center mr-1">Top Learned Tags:</span>
          {platformMemory.topKeywords.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-200 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Analytics Component for Prompt Keyword History & Creative Trends */}
      <PromptAnalytics
        images={displayedImages}
        onSelectKeyword={(kw) => setPrompt((prev) => (prev && prev.trim() ? `${prev}, ${kw}` : kw))}
      />

      {/* Main Generator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Wand2 className="w-5 h-5 text-indigo-400" /> Prompt & Settings
              </h2>
              {activeReferenceImage && (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-900/50 border border-indigo-500/40 text-xs text-indigo-200">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" /> Reference Active
                  <button onClick={onClearReference} className="text-slate-400 hover:text-white font-bold ml-1">✕</button>
                </div>
              )}
            </div>

            {/* Structured Marketing Prompt Builder Accordion */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowStructuredBuilder(!showStructuredBuilder)}
                className="w-full p-3 bg-indigo-950/40 hover:bg-indigo-900/30 text-left flex items-center justify-between border-b border-indigo-500/20 transition"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Structured Marketing Prompt Builder</span>
                  <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold border border-indigo-500/30">
                    Auto-Style Descriptors
                  </span>
                </div>
                {showStructuredBuilder ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showStructuredBuilder && (
                <div className="p-3.5 space-y-3.5 text-xs">
                  {/* Subject Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">1. Core Concept & Subject:</label>
                    <input
                      type="text"
                      value={subjectCore}
                      onChange={(e) => {
                        setSubjectCore(e.target.value);
                        applyStructuredPrompt(e.target.value, selectedLighting, selectedPerspective, selectedQualityEngine, selectedMarketingVibe);
                      }}
                      placeholder="e.g. Futuristic glass airport terminal with hovering supersonic aircraft"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Lighting Descriptors */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">2. Lighting & Atmosphere:</label>
                    <div className="flex flex-wrap gap-1">
                      {LIGHTING_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedLighting(opt);
                            applyStructuredPrompt(subjectCore, opt, selectedPerspective, selectedQualityEngine, selectedMarketingVibe);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                            selectedLighting === opt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Perspective & Framing */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">3. Camera & Perspective:</label>
                    <div className="flex flex-wrap gap-1">
                      {PERSPECTIVE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedPerspective(opt);
                            applyStructuredPrompt(subjectCore, selectedLighting, opt, selectedQualityEngine, selectedMarketingVibe);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                            selectedPerspective === opt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engine & Quality */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">4. Render Engine & Quality:</label>
                    <div className="flex flex-wrap gap-1">
                      {QUALITY_ENGINE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedQualityEngine(opt);
                            applyStructuredPrompt(subjectCore, selectedLighting, selectedPerspective, opt, selectedMarketingVibe);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                            selectedQualityEngine === opt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marketing Vibe */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">5. Marketing Vibe:</label>
                    <div className="flex flex-wrap gap-1">
                      {MARKETING_VIBE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedMarketingVibe(opt);
                            applyStructuredPrompt(subjectCore, selectedLighting, selectedPerspective, selectedQualityEngine, opt);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                            selectedMarketingVibe === opt
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => applyStructuredPrompt()}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Append Descriptors to Active Prompt
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... (e.g., 'A futuristic aircraft hangar with supersonic jet resting on reflective wet floor at dusk')"
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
                
                {/* AI Expand Prompt Button */}
                <button
                  type="button"
                  onClick={handleExpandPrompt}
                  disabled={isExpanding || !prompt.trim()}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-40 text-xs font-medium text-white flex items-center gap-1.5 transition border border-indigo-400/30"
                  title="Use AI to enhance your prompt with camera settings, lighting, and detail parameters"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isExpanding ? 'animate-spin' : ''}`} />
                  {isExpanding ? 'Enhancing...' : 'Magic Enhance'}
                </button>
              </div>

              {/* Twice Enhance / Director Mode Sub-panel */}
              <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/20 rounded-xl p-3.5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-300">
                      Twice Enhance (AI Visual Director)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTwiceEnhancePanel(!showTwiceEnhancePanel)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition underline decoration-indigo-500/30 decoration-2"
                  >
                    {showTwiceEnhancePanel ? 'Hide Controls' : 'Open Director Mode'}
                  </button>
                </div>
                
                {showTwiceEnhancePanel ? (
                  <div className="space-y-3 animate-fadeIn">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Provide a custom creative command. The director engine will transform your prompt into an ultra-detailed, 150+ word visual masterpiece incorporating advanced physics, optic formulas, and material properties.
                    </p>
                    <input
                      type="text"
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="e.g. 'Make it super moody with crimson bioluminescent fog and Hasselblad bokeh'"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleTwiceEnhance}
                      disabled={isTwiceExpanding || !prompt.trim()}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 border border-indigo-400/30"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isTwiceExpanding ? 'animate-spin' : ''}`} />
                      {isTwiceExpanding ? 'Directing Masterwork Prompt...' : 'Apply Twice Enhance'}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 leading-normal">
                    AI Visual Director lets you specify custom rendering directives to multiply details & aesthetics. Click "Open Director Mode" to configure.
                  </p>
                )}
              </div>

              {/* Quick Inspiration Prompts */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Prompts:</label>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((qp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(qp)}
                      className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-left truncate max-w-[220px] transition"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visual Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyle(st.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        selectedStyle === st.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-lg">{st.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aspect Ratio:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`px-3 py-2 rounded-xl border text-center transition ${
                        aspectRatio === ar.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-medium">{ar.label}</div>
                      <div className="text-[10px] text-slate-500">{ar.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                {/* Prompt-Matched Generate Button */}
                <button
                  type="button"
                  onClick={(e) => handleGenerate(e, false)}
                  disabled={isGenerating || isGeneratingRandom || !prompt.trim()}
                  className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 border border-indigo-400/30"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Rendering...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" /> Generate AI Image
                    </>
                  )}
                </button>

                {/* Random Image Button */}
                <button
                  type="button"
                  onClick={(e) => handleGenerate(e, true)}
                  disabled={isGenerating || isGeneratingRandom}
                  className="py-3.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg border border-slate-700 hover:border-indigo-500/50 transition flex items-center justify-center gap-1.5"
                  title="Generate a fun, completely random AI image"
                >
                  {isGeneratingRandom ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Surprise Me...
                    </>
                  ) : (
                    <>
                      <Dices className="w-4 h-4 text-indigo-400" /> Random Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Gallery Navigation & Auth Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tab Switches */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setActiveGalleryTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeGalleryTab === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> All Creations ({displayedImages.length})
              </button>

              <button
                onClick={() => setActiveGalleryTab('library')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeGalleryTab === 'library'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" /> Saved Library ({userLibrary.length})
              </button>
            </div>

            {/* Firebase Auth Sync Status */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-white font-medium truncate max-w-[140px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <button
                    onClick={handleGoogleSignOut}
                    className="text-slate-400 hover:text-rose-400 ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-1.5"
                  title="Sign in with Google to sync library across browsers"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" /> Sign In Google
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: ALL STUDIO CREATIONS */}
          {activeGalleryTab === 'all' && (
            <>
              {isLoadingFirestore ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> Loading persistent image memory from Firestore...
                </div>
              ) : displayedImages.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white">No images generated yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Type a prompt or click <strong>Random Image</strong> to generate photorealistic assets, 3D game models, or research artwork. All creations can be saved to your library!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedImages.map((img) => {
                    const saved = isSavedInLibrary(img.id, img.url);
                    return (
                      <div
                        key={img.id}
                        className="group relative bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden shadow-lg transition flex flex-col"
                      >
                        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/80 text-indigo-300 text-[10px] font-black shadow backdrop-blur">
                              v{img.version || 1}
                            </span>
                            {img.isRandom && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-bold shadow backdrop-blur">
                                Random
                              </span>
                            )}
                          </div>

                          {/* Save to Library Top Badge / Quick Bookmark Button */}
                          <button
                            onClick={() => handleToggleSaveToLibrary(img)}
                            disabled={savingImageId === img.id}
                            className={`absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg backdrop-blur flex items-center gap-1 transition ${
                              saved
                                ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400/50'
                                : 'bg-slate-950/80 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80'
                            }`}
                            title={saved ? "Saved in Library (Click to remove)" : "Save to persistent Firebase Library"}
                          >
                            {savingImageId === img.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : saved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-200" /> In Library
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-indigo-300" /> Save
                              </>
                            )}
                          </button>

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3 gap-1.5">
                            <button
                              onClick={() => setSelectedImageModal(img)}
                              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium flex items-center gap-1 backdrop-blur"
                              title="Full Screen Lightbox (Zoom & Pan)"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSocialShareData({
                                title: img.caption || img.prompt,
                                content: img.prompt,
                                imageUrl: img.url,
                                mediaType: 'image',
                                tags: [img.style, 'AIArt']
                              })}
                              className="p-2 rounded-lg bg-sky-500/90 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1 backdrop-blur shadow-lg"
                              title="Share to Twitter / Social"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingMarketerImage(img)}
                              className="p-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium flex items-center gap-1 backdrop-blur"
                              title="Marketer Edit & Refine Asset"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setVersionHistoryImage(img)}
                              className="p-2 rounded-lg bg-indigo-900/90 hover:bg-indigo-800 text-indigo-200 text-xs font-medium flex items-center gap-1 backdrop-blur border border-indigo-500/30"
                              title="Version History & Timeline"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            {onNavigateToVideoMotion && (
                              <button
                                onClick={() => onNavigateToVideoMotion(img.url)}
                                className="p-2 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 backdrop-blur shadow-lg"
                                title="Turn into Interactive Motion Video"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleSaveToLibrary(img)}
                              disabled={savingImageId === img.id}
                              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 backdrop-blur transition ${
                                saved ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 hover:bg-indigo-600 text-white'
                              }`}
                              title={saved ? "Saved in Library" : "Save to Library"}
                            >
                              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDownloadImage(img.url, img.id)}
                              disabled={isDownloading === img.id}
                              className="p-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium flex items-center gap-1 backdrop-blur ml-auto transition disabled:opacity-50"
                              title="Direct Local Download"
                            >
                              <Download className={`w-3.5 h-3.5 ${isDownloading === img.id ? 'animate-bounce' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteImagePersistent(img.id)}
                              className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1 backdrop-blur"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                              {img.caption || img.prompt}
                            </p>
                            {img.caption && img.caption !== img.prompt && (
                              <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                                Prompt: "{img.prompt}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-950 text-indigo-300 font-semibold">{img.style}</span>
                            <span>{img.aspectRatio}</span>
                            <button
                              onClick={() => handleCopyPrompt(img.prompt, img.id)}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedId === img.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedId === img.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: SAVED USER LIBRARY */}
          {activeGalleryTab === 'library' && (
            <div className="space-y-4">
              {/* Library Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                <div className="sm:col-span-2 relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    placeholder="Search saved prompts, notes, or tags..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  {librarySearchQuery && (
                    <button
                      onClick={() => setLibrarySearchQuery('')}
                      className="absolute right-3 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={libraryStyleFilter}
                    onChange={(e) => setLibraryStyleFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="all">All Styles</option>
                    <option value="photorealistic">Photorealistic</option>
                    <option value="3d-game">3D Game Engine</option>
                    <option value="concept-art">Concept Art</option>
                    <option value="cyberpunk">Cyberpunk Sci-Fi</option>
                    <option value="cinematic">Cinematic Film</option>
                    <option value="anime">Anime / Manga</option>
                  </select>
                </div>
              </div>

              {/* Library Cards List */}
              {isLoadingLibrary ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading your saved Firebase library collection...
                </div>
              ) : (() => {
                const filtered = userLibrary.filter((item) => {
                  const matchQuery =
                    !librarySearchQuery ||
                    item.prompt.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                    (item.caption && item.caption.toLowerCase().includes(librarySearchQuery.toLowerCase())) ||
                    (item.notes && item.notes.toLowerCase().includes(librarySearchQuery.toLowerCase())) ||
                    (item.tags && item.tags.some((t) => t.toLowerCase().includes(librarySearchQuery.toLowerCase())));
                  const matchStyle = libraryStyleFilter === 'all' || item.style === libraryStyleFilter;
                  return matchQuery && matchStyle;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-slate-900/40 border border-dashed border-emerald-500/30 rounded-2xl p-10 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                        <Bookmark className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-white">
                          {userLibrary.length === 0 ? 'Your Saved Library is Empty' : 'No matching items in Saved Library'}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {userLibrary.length === 0
                            ? 'Click the "Save" bookmark button on any generated image to add it directly to your persistent Firebase storage library!'
                            : 'Try adjusting your search query or style filter above.'}
                        </p>
                      </div>
                      {userLibrary.length === 0 && (
                        <button
                          onClick={() => setActiveGalleryTab('all')}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition"
                        >
                          Explore & Save Assets
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 rounded-xl overflow-hidden shadow-xl transition flex flex-col"
                      >
                        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                          <img
                            src={item.url}
                            alt={item.prompt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                            <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shadow backdrop-blur flex items-center gap-1">
                              <BookmarkCheck className="w-3 h-3 text-emerald-400" /> Saved Asset
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3 gap-1.5">
                            <button
                              onClick={() =>
                                setSelectedImageModal({
                                  id: item.imageId || item.id,
                                  url: item.url,
                                  prompt: item.prompt,
                                  caption: item.caption,
                                  style: item.style,
                                  aspectRatio: item.aspectRatio,
                                  createdAt: item.createdAt,
                                  version: item.version,
                                  metadata: item.metadata,
                                  marketingOverlay: item.marketingOverlay
                                })
                              }
                              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium flex items-center gap-1 backdrop-blur"
                              title="Expand Lightbox"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            {onNavigateToVideoMotion && (
                              <button
                                onClick={() => onNavigateToVideoMotion(item.url)}
                                className="p-2 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 backdrop-blur shadow-lg"
                                title="Turn into Interactive Motion Video"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadImage(item.url, item.id)}
                              disabled={isDownloading === item.id}
                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 backdrop-blur ml-auto transition disabled:opacity-50"
                              title="Download"
                            >
                              <Download className={`w-3.5 h-3.5 ${isDownloading === item.id ? 'animate-bounce' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleToggleSaveToLibrary({
                                id: item.imageId,
                                url: item.url,
                                prompt: item.prompt,
                                style: item.style,
                                aspectRatio: item.aspectRatio,
                                createdAt: item.createdAt
                              })}
                              className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1 backdrop-blur"
                              title="Remove from Saved Library"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                              {item.caption || item.prompt}
                            </p>

                            {/* Saved Date */}
                            <div className="text-[10px] text-emerald-400/90 font-medium">
                              Saved {new Date(item.savedAt).toLocaleDateString()} at {new Date(item.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {/* Campaign Notes & Editing */}
                            {editingNotesItemId === item.id ? (
                              <div className="space-y-1.5 pt-1">
                                <textarea
                                  value={notesInput}
                                  onChange={(e) => setNotesInput(e.target.value)}
                                  placeholder="Type campaign notes or tags..."
                                  rows={2}
                                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg p-2 text-xs text-white placeholder-slate-500 outline-none resize-none"
                                />
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSaveNotes(item.id, notesInput)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                                  >
                                    Save Notes
                                  </button>
                                  <button
                                    onClick={() => setEditingNotesItemId(null)}
                                    className="px-2 py-1 text-slate-400 hover:text-white text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingNotesItemId(item.id);
                                  setNotesInput(item.notes || '');
                                }}
                                className="group/note cursor-pointer p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 text-[11px] text-slate-300 flex items-start gap-1.5 transition"
                                title="Click to edit notes"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 italic">
                                  {item.notes ? item.notes : 'Click to add custom folder notes or campaign tag...'}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-950 text-emerald-300 font-semibold border border-emerald-500/20">{item.style}</span>
                            <span>{item.aspectRatio}</span>
                            <button
                              onClick={() => handleCopyPrompt(item.prompt, item.id)}
                              className="hover:text-white flex items-center gap-1"
                            >
                              {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedId === item.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Engines & Scout Agents Surface Panel */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden mt-8 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center justify-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" /> Powered by Scout Agents & Super Engines
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Our first-class systems are optimizing generation across the board. These background engines work autonomously to push creativity to level one.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <Video className="w-6 h-6 text-pink-400" />
              <div className="text-xs font-bold text-white text-center">Video Reels Engine</div>
              <div className="text-[9px] text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Level One</div>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <Database className="w-6 h-6 text-emerald-400" />
              <div className="text-xs font-bold text-white text-center">3-Gigabyte Studio Engine</div>
              <div className="text-[9px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Max Cap</div>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <Zap className="w-6 h-6 text-amber-400" />
              <div className="text-xs font-bold text-white text-center">Horsepower Engine</div>
              <div className="text-[9px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Optimizing</div>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <ImageIcon className="w-6 h-6 text-cyan-400" />
              <div className="text-xs font-bold text-white text-center">Image Engine</div>
              <div className="text-[9px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Generator</div>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <Cpu className="w-6 h-6 text-fuchsia-400" />
              <div className="text-xs font-bold text-white text-center">Transformer Engine</div>
              <div className="text-[9px] text-fuchsia-300 bg-fuchsia-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Structuring</div>
            </div>
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 hover:border-indigo-400/50 transition">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <div className="text-xs font-bold text-white text-center">Gemini Agent</div>
              <div className="text-[9px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest font-semibold">Scout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Lightbox View Modal with Pan, Zoom & Next/Prev Navigation */}
      <ImageLightboxModal
        isOpen={!!selectedImageModal}
        onClose={() => setSelectedImageModal(null)}
        image={selectedImageModal}
        imagesList={displayedImages}
        onSelectImage={setSelectedImageModal}
        isSavedInLibrary={selectedImageModal ? isSavedInLibrary(selectedImageModal.id, selectedImageModal.url) : false}
        onToggleSaveToLibrary={handleToggleSaveToLibrary}
        onSaveToPortfolio={(img) => setSelectedPortfolioSelectImg(img)}
        onEditMarketerImage={setEditingMarketerImage}
        onViewVersionHistory={setVersionHistoryImage}
        onDownloadImage={handleDownloadImage}
      />

      {/* Cloud Portfolio Custom Selection Modal */}
      {selectedPortfolioSelectImg && (
        <PortfolioSelectModal
          isOpen={!!selectedPortfolioSelectImg}
          onClose={() => setSelectedPortfolioSelectImg(null)}
          image={selectedPortfolioSelectImg}
          onSavedSuccess={(pName) => {
            setToastMessage(`✨ Successfully saved image to Cloud Portfolio "${pName}"!`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />
      )}

      {/* Global Social Share Modal */}
      {socialShareData && (
        <SocialShareModal
          isOpen={!!socialShareData}
          onClose={() => setSocialShareData(null)}
          data={socialShareData}
        />
      )}

      {/* Marketer Image Refinement & Iteration Modal */}
      {editingMarketerImage && (
        <MarketerImageEditorModal
          image={editingMarketerImage}
          allImages={displayedImages}
          onClose={() => setEditingMarketerImage(null)}
          onSaveEditedImage={handleSaveEditedImage}
          onDownload={handleDownloadImage}
        />
      )}

      {/* Campaign Asset Version History & Revert Modal */}
      {versionHistoryImage && (
        <VersionHistoryModal
          image={versionHistoryImage}
          allImages={displayedImages}
          onClose={() => setVersionHistoryImage(null)}
          onRevertToVersion={handleRevertToVersion}
          onDownload={handleDownloadImage}
        />
      )}

      {/* Creator Download Credits & Billing Top-Up Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <button
              onClick={() => setShowBillingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Creator Download Credits</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                {downloadsRemaining <= 0
                  ? 'You have used all 100 Free Downloads! Top up credits below to continue direct high-res downloads at $0.05 per download.'
                  : `You currently have ${downloadsRemaining} free downloads remaining. Top up anytime!`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePurchaseCredits(20)}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 transition text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    20 Download Credits <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded font-semibold">$0.05 / download</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Instant direct download top-up</div>
                </div>
                <div className="text-sm font-extrabold text-indigo-400 group-hover:scale-105 transition">$1.00</div>
              </button>

              <button
                onClick={() => handlePurchaseCredits(100)}
                className="w-full p-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/50 transition text-left flex items-center justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-black font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-bl-lg">
                  Best Value
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    100 Download Credits <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded font-semibold">Save 20%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Power creator package</div>
                </div>
                <div className="text-sm font-extrabold text-amber-400 group-hover:scale-105 transition">$4.00</div>
              </button>

              <button
                onClick={() => handlePurchaseCredits(9999)}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-900/40 to-indigo-900/40 hover:from-violet-900/60 hover:to-indigo-900/60 border border-violet-500/50 transition text-left flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    Unlimited Pro Pass <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Unlimited direct downloads forever</div>
                </div>
                <div className="text-sm font-extrabold text-emerald-400 group-hover:scale-105 transition">$15.00</div>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500">
              Downloads are saved directly to your local computer's download folder.
            </p>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur animate-bounce">
          <BookmarkCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
