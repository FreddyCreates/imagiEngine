import React, { useState, useEffect } from 'react';
import { GeneratedImage, VideoReel, PortfolioCollection } from '../types/creator';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { FolderPlus, Image as ImageIcon, Video, Trash2, Share2, Sparkles, Plus, ExternalLink, BookmarkCheck } from 'lucide-react';
import { shareToTwitter, shareUniversal } from '../utils/share';

interface PortfolioStudioProps {
  images: GeneratedImage[];
  reels: VideoReel[];
}

export function PortfolioStudio({ images, reels }: PortfolioStudioProps) {
  const [portfolios, setPortfolios] = useState<PortfolioCollection[]>([]);
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSharePortfolio = async (p: PortfolioCollection) => {
    const text = `Check out my curated AI collection '${p.name}' in Aura AI Studio! 🌌🖌️`;
    const shareUrl = p.items && p.items.length > 0 ? p.items[0].url : 'https://ai.studio/build';
    const success = await shareUniversal({
      text,
      url: shareUrl,
      title: `Aura AI Studio Curated Collection: ${p.name}`
    });
    if (success) {
      setToastMessage(`✨ Launched Twitter/Social share sheet for "${p.name}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Load portfolios from Firebase Firestore
  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'portfolios'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: PortfolioCollection[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as PortfolioCollection);
      });
      setPortfolios(list);
    } catch (e) {
      console.error("Firestore error loading portfolios:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName.trim()) return;

    setIsCreating(true);
    try {
      const selectedImages = images.filter((img) => selectedImageIds.includes(img.id));
      const newPortfolio = {
        name: portfolioName,
        description: portfolioDesc || 'Curated generative AI creative collection',
        items: selectedImages,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'portfolios'), newPortfolio);
      setPortfolios((prev) => [{ id: docRef.id, ...newPortfolio }, ...prev]);

      setPortfolioName('');
      setPortfolioDesc('');
      setSelectedImageIds([]);
    } catch (e) {
      console.error("Error creating portfolio:", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'portfolios', id));
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Error deleting portfolio:", e);
    }
  };

  const toggleSelectImage = (id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <FolderPlus className="w-3.5 h-3.5" /> Firebase Cloud Portfolios
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Creator Portfolios & Research Collections
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Organize your AI generated assets, realistic renders, and video reels into persistent cloud portfolios. Synchronized directly with Firestore for real-time sharing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Portfolio Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-400" /> New Portfolio Collection
            </h2>

            <form onSubmit={handleCreatePortfolio} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Title:</label>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="e.g. 'Cyberpunk Game Art Suite'"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description:</label>
                <textarea
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                  placeholder="Describe this collection or research moodboard..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Select Creations to Include */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Generated Creations ({selectedImageIds.length} chosen):
                </label>
                {images.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Generate images in Image Studio first to include them.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => toggleSelectImage(img.id)}
                        className={`cursor-pointer aspect-square rounded-lg overflow-hidden relative border transition ${
                          selectedImageIds.includes(img.id)
                            ? 'border-blue-500 ring-2 ring-blue-500'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.prompt} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreating || !portfolioName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Portfolio to Cloud
              </button>
            </form>
          </div>
        </div>

        {/* Existing Portfolios List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> Saved Portfolios ({portfolios.length})
          </h2>

          {isLoading ? (
            <p className="text-xs text-slate-400">Loading portfolios from Firestore...</p>
          ) : portfolios.length === 0 ? (
            <div className="p-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center text-slate-400 space-y-2">
              <FolderPlus className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No Cloud Portfolios Saved</p>
              <p className="text-xs text-slate-500">Create your first portfolio collection on the left to group images and reels.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolios.map((p) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSharePortfolio(p)}
                        className="p-2 rounded-lg bg-sky-950/60 hover:bg-sky-900 text-sky-300 text-xs flex items-center gap-1.5 transition"
                        title="Share this cloud portfolio to Twitter / social platforms"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(p.id)}
                        className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {p.items && p.items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                      {p.items.map((item, idx) => (
                        <div key={idx} className="group relative aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                          <img src={item.url} alt={item.prompt} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Empty collection.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
