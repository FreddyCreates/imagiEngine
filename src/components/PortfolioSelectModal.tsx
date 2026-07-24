import React, { useState, useEffect } from 'react';
import { GeneratedImage, PortfolioCollection } from '../types/creator';
import { fetchPortfolios, createPortfolio, addImageToPortfolio } from '../lib/portfolioService';
import { FolderPlus, Check, Plus, Folder, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface PortfolioSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage;
  onSavedSuccess?: (portfolioName: string) => void;
}

export function PortfolioSelectModal({
  isOpen,
  onClose,
  image,
  onSavedSuccess
}: PortfolioSelectModalProps) {
  const [portfolios, setPortfolios] = useState<PortfolioCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');
  const [autoSaveSetting, setAutoSaveSetting] = useState<boolean>(() => {
    return localStorage.getItem('auto_save_to_portfolio') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPortfolios();
    }
  }, [isOpen]);

  const loadPortfolios = async () => {
    setIsLoading(true);
    try {
      const list = await fetchPortfolios();
      setPortfolios(list);
      if (list.length > 0) {
        setSelectedPortfolioId(list[0].id);
      } else {
        setIsCreatingNew(true);
      }
    } catch (e) {
      console.error("Error loading portfolios:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveToPortfolio = async () => {
    setIsSaving(true);
    try {
      let targetPortfolioId = selectedPortfolioId;
      let targetPortfolioName = '';

      if (isCreatingNew || !targetPortfolioId) {
        if (!newPortfolioName.trim()) {
          setIsSaving(false);
          return;
        }
        const created = await createPortfolio(
          newPortfolioName.trim(),
          newPortfolioDesc.trim() || 'Generative AI Creator Collection',
          [image]
        );
        targetPortfolioId = created.id;
        targetPortfolioName = created.name;
      } else {
        const found = portfolios.find((p) => p.id === targetPortfolioId);
        targetPortfolioName = found?.name || 'Portfolio';
        await addImageToPortfolio(targetPortfolioId, image);
      }

      // Handle auto-save preference
      if (autoSaveSetting && targetPortfolioId) {
        localStorage.setItem('auto_save_to_portfolio', 'true');
        localStorage.setItem('default_portfolio_id', targetPortfolioId);
      } else {
        localStorage.setItem('auto_save_to_portfolio', 'false');
      }

      setSuccessMessage(`Saved to "${targetPortfolioName}"!`);
      if (onSavedSuccess) {
        onSavedSuccess(targetPortfolioName);
      }

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (e) {
      console.error("Error saving image to portfolio:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Save Image to Portfolio</h3>
            <p className="text-xs text-slate-400">Choose a cloud portfolio collection to store this asset</p>
          </div>
        </div>

        {/* Preview Thumbnail */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <img src={image.url} alt={image.prompt} referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded-lg border border-slate-800" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{image.prompt}</div>
            <div className="text-[10px] text-slate-400 capitalize">{image.style} • {image.aspectRatio}</div>
          </div>
        </div>

        {successMessage ? (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" /> {successMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Target Portfolio:</span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                {isCreatingNew ? 'Select Existing' : '+ Create New Portfolio'}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Portfolio Name:</label>
                  <input
                    type="text"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    placeholder="e.g. '3D Game Concept Art', 'Cyberpunk Suite'"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Description (Optional):</label>
                  <input
                    type="text"
                    value={newPortfolioDesc}
                    onChange={(e) => setNewPortfolioDesc(e.target.value)}
                    placeholder="Short description..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : isLoading ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Loading portfolios...</p>
            ) : portfolios.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                No portfolios found. Click above to create your first portfolio!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {portfolios.map((p) => {
                  const isSelected = selectedPortfolioId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPortfolioId(p.id)}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.items?.length || 0} items saved</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Auto Save Toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoSaveSetting}
                onChange={(e) => setAutoSaveSetting(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-400">
                Auto-save future generated images to this portfolio
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToPortfolio}
                disabled={isSaving || (!isCreatingNew && !selectedPortfolioId) || (isCreatingNew && !newPortfolioName.trim())}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save to Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
