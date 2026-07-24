import React, { useState } from 'react';
import { GeneratedImage } from '../types/creator';
import { 
  History, 
  RotateCcw, 
  X, 
  Sparkles, 
  Clock, 
  Check, 
  Download, 
  Layers, 
  ArrowRight,
  Eye,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface VersionHistoryModalProps {
  image: GeneratedImage;
  allImages: GeneratedImage[];
  onClose: () => void;
  onRevertToVersion: (versionImg: GeneratedImage) => void;
  onDownload: (url: string, id: string) => void;
}

export function VersionHistoryModal({
  image,
  allImages,
  onClose,
  onRevertToVersion,
  onDownload
}: VersionHistoryModalProps) {
  // Find all images belonging to the same version lineage family
  const findFamily = (): GeneratedImage[] => {
    const rootId = image.rootId || image.parentId || image.id;
    const familyMap = new Map<string, GeneratedImage>();

    allImages.forEach((img) => {
      const imgRoot = img.rootId || img.parentId || img.id;
      if (
        img.id === rootId ||
        img.parentId === rootId ||
        img.rootId === rootId ||
        imgRoot === rootId ||
        img.id === image.id ||
        (image.parentId && (img.id === image.parentId || img.parentId === image.parentId))
      ) {
        familyMap.set(img.id, img);
      }
    });

    // Sort by version ascending (v1, v2, v3...)
    const list = Array.from(familyMap.values());
    list.sort((a, b) => (a.version || 1) - (b.version || 1));
    return list;
  };

  const familyVersions = findFamily();
  const [selectedVersion, setSelectedVersion] = useState<GeneratedImage>(image);
  const [compareVersion, setCompareVersion] = useState<GeneratedImage | null>(
    familyVersions.length > 1 ? familyVersions[0] : null
  );

  const handleRevert = (ver: GeneratedImage) => {
    onRevertToVersion(ver);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Campaign Asset Version History</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold">
                  {familyVersions.length} {familyVersions.length === 1 ? 'Version' : 'Iterations'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track changes, compare iterations side-by-side, and revert to any prior marketing iteration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[78vh]">
          {/* Left Column: Timeline List of Versions (4 cols) */}
          <div className="lg:col-span-4 space-y-3 border-r border-slate-800/80 pr-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Version Lineage Timeline
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {familyVersions.map((ver, idx) => {
                const isCurrent = ver.id === image.id;
                const isSelected = ver.id === selectedVersion.id;

                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                          isCurrent
                            ? 'bg-emerald-500 text-black'
                            : 'bg-slate-800 text-indigo-300'
                        }`}>
                          v{ver.version || (idx + 1)}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={ver.url}
                        alt={`v${ver.version}`}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-800 bg-black shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                          {ver.caption || ver.prompt}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="capitalize">{ver.style}</span>
                          <span>•</span>
                          <span>{ver.aspectRatio}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons inside card */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompareVersion(ver);
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Compare
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevert(ver);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3 h-3" /> Revert to v{ver.version || (idx + 1)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Side-by-Side Comparison & Revert Action (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Side-by-Side Version Inspection
              </h4>
              <div className="text-xs text-slate-400">
                Comparing <strong className="text-indigo-300">v{selectedVersion.version || 1}</strong>
                {compareVersion && compareVersion.id !== selectedVersion.id && (
                  <> against <strong className="text-amber-400">v{compareVersion.version || 1}</strong></>
                )}
              </div>
            </div>

            {/* Display Canvas Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selected Version */}
              <div className="bg-slate-950 border border-indigo-500/50 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5 text-indigo-300">
                    Target: Version v{selectedVersion.version || 1}
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedVersion.aspectRatio}</span>
                </div>

                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                  <img
                    src={selectedVersion.url}
                    alt="Selected version"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  {selectedVersion.marketingOverlay?.headline && (
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="text-xs font-black text-white">{selectedVersion.marketingOverlay.headline}</div>
                      {selectedVersion.marketingOverlay.ctaText && (
                        <div className="text-[10px] font-bold text-amber-400 mt-0.5">{selectedVersion.marketingOverlay.ctaText}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-300 font-medium line-clamp-2">"{selectedVersion.caption || selectedVersion.prompt}"</p>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 capitalize">{selectedVersion.style}</span>
                    {selectedVersion.isRandom && <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300">Random</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onDownload(selectedVersion.url, selectedVersion.id)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>

                  {selectedVersion.id !== image.id && (
                    <button
                      onClick={() => handleRevert(selectedVersion)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Revert to v{selectedVersion.version || 1}
                    </button>
                  )}
                </div>
              </div>

              {/* Compare Version */}
              {compareVersion ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      Comparing: Version v{compareVersion.version || 1}
                    </span>
                    <span className="text-[10px] text-slate-400">{compareVersion.aspectRatio}</span>
                  </div>

                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-slate-800">
                    <img
                      src={compareVersion.url}
                      alt="Compare version"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                    {compareVersion.marketingOverlay?.headline && (
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="text-xs font-black text-white">{compareVersion.marketingOverlay.headline}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-300 font-medium line-clamp-2">"{compareVersion.caption || compareVersion.prompt}"</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 capitalize">{compareVersion.style}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onDownload(compareVersion.url, compareVersion.id)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>

                    {compareVersion.id !== image.id && (
                      <button
                        onClick={() => handleRevert(compareVersion)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Revert to v{compareVersion.version || 1}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Eye className="w-8 h-8 text-slate-600" />
                  <p className="text-xs text-slate-400">Click "Compare" on any timeline version to view them side-by-side.</p>
                </div>
              )}
            </div>

            {/* Edit History Log for Selected Version */}
            {selectedVersion.editHistory && selectedVersion.editHistory.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" /> Marketer Refinement Logs for v{selectedVersion.version || 1}:
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedVersion.editHistory.map((item, i) => (
                    <div key={i} className="text-xs text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span>{item.action}</span>
                      <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
