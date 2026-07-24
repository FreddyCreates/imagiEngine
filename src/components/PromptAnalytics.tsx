import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Tag,
  PieChart as PieIcon,
  Lightbulb,
  Hash,
  Layers,
  ArrowUpRight,
  Search,
  Download,
  Zap,
  Check,
  Plus,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GeneratedImage } from '../types/creator';

interface PromptAnalyticsProps {
  images: GeneratedImage[];
  onSelectKeyword?: (keyword: string) => void;
}

// Stop words to exclude from keyword frequency analysis
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
  'with', 'style', 'descriptors', 'lighting', 'perspective', 'engine', 'marketing',
  'vibe', 'render', 'image', 'generate', 'prompt', 'high', 'detail', 'detailed',
  'masterpiece', '8k', '4k', 'resolution', 'quality', 'style:', 'vibe:'
]);

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6'  // Violet
];

export function PromptAnalytics({ images, onSelectKeyword }: PromptAnalyticsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'recent'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedRemixKeywords, setSelectedRemixKeywords] = useState<string[]>([]);
  const [copiedRemix, setCopiedRemix] = useState(false);

  // Compute analytics from image prompts
  const analyticsData = useMemo(() => {
    const list = selectedTimeframe === 'recent' ? images.slice(0, 10) : images;
    
    if (!list || list.length === 0) {
      return {
        topKeywords: [],
        styleDistribution: [],
        lengthTrend: [],
        coOccurringPairs: [],
        totalWords: 0,
        avgLength: 0,
        uniqueKeywordsCount: 0,
        dominantArchetype: 'None',
        marketingTips: ['Generate a few images to begin tracking prompt creative trends.']
      };
    }

    const keywordCounts: Record<string, number> = {};
    const styleCounts: Record<string, number> = {};
    const pairCounts: Record<string, number> = {};
    let totalPromptChars = 0;
    let totalWordsCount = 0;

    list.forEach((img) => {
      const p = img.prompt || '';
      totalPromptChars += p.length;
      
      // Clean and tokenize prompt
      const words = Array.from(new Set(p
        .toLowerCase()
        .replace(/[\[\]\(\)\.\,\:\;\!\?]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && isNaN(Number(w)))));

      totalWordsCount += words.length;

      words.forEach((w) => {
        keywordCounts[w] = (keywordCounts[w] || 0) + 1;
      });

      // Track co-occurrence word pairs
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const pair = [words[i], words[j]].sort().join(' + ');
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }

      // Track style breakdown
      const styleName = img.style || 'photorealistic';
      styleCounts[styleName] = (styleCounts[styleName] || 0) + 1;
    });

    // Sort keywords by frequency & filter by searchKeyword if present
    let sortedKeywords = Object.entries(keywordCounts)
      .map(([word, count]) => ({
        keyword: word.charAt(0).toUpperCase() + word.slice(1),
        count,
        percentage: Math.round((count / list.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    if (searchKeyword.trim()) {
      const term = searchKeyword.toLowerCase();
      sortedKeywords = sortedKeywords.filter(k => k.keyword.toLowerCase().includes(term));
    }

    const topKeywords = sortedKeywords.slice(0, 10);

    // Sort co-occurring word pairs
    const coOccurringPairs = Object.entries(pairCounts)
      .map(([pair, count]) => ({
        pair: pair.split(' + ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' + '),
        count
      }))
      .filter(p => p.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Format style distribution for Pie Chart
    const formattedStyleDist = Object.entries(styleCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: count
    }));

    // Generate prompt length trend over time
    const lengthTrend = list.map((img, idx) => ({
      index: `#${list.length - idx}`,
      length: (img.prompt || '').length,
      words: (img.prompt || '').split(/\s+/).length,
      title: (img.prompt || '').slice(0, 15) + '...'
    })).reverse();

    // Archetype analysis based on top keywords
    const topWord = topKeywords[0]?.keyword.toLowerCase() || '';
    let archetype = 'Multi-Concept Creative';
    if (topWord.includes('cyber') || topWord.includes('neon') || topWord.includes('future')) {
      archetype = 'Futuristic Sci-Fi & Cyberpunk';
    } else if (topWord.includes('glass') || topWord.includes('building') || topWord.includes('architecture')) {
      archetype = 'Modern Architectural Commercial';
    } else if (topWord.includes('lab') || topWord.includes('science') || topWord.includes('medical')) {
      archetype = 'Scientific & Biotech Innovation';
    } else if (topWord.includes('photo') || topWord.includes('portrait') || topWord.includes('studio')) {
      archetype = 'Photorealistic Brand Editorial';
    }

    // Actionable Marketing Recommendations
    const tips: string[] = [];
    if (topKeywords.length > 0) {
      tips.push(`Your top creative focus keyword is "${topKeywords[0].keyword}" appearing in ${topKeywords[0].percentage}% of generated assets.`);
    }
    const hasLighting = list.some((i) => (i.prompt || '').toLowerCase().includes('lighting') || (i.prompt || '').toLowerCase().includes('sunset') || (i.prompt || '').toLowerCase().includes('neon'));
    if (!hasLighting) {
      tips.push('Try incorporating explicit lighting cues (e.g. "Golden Hour", "Volumetric Rays") to boost atmospheric depth.');
    } else {
      tips.push('Great atmospheric variance! Your prompts combine subject matter with rich lighting descriptors.');
    }
    if (totalWordsCount / list.length < 8) {
      tips.push('Consider using longer, more detailed prompts (>12 words) to yield higher brand alignment.');
    }

    return {
      topKeywords,
      styleDistribution: formattedStyleDist,
      lengthTrend,
      coOccurringPairs,
      totalWords: totalWordsCount,
      avgLength: Math.round(totalPromptChars / list.length),
      uniqueKeywordsCount: Object.keys(keywordCounts).length,
      dominantArchetype: archetype,
      marketingTips: tips
    };
  }, [images, selectedTimeframe, searchKeyword]);

  const handleExportAnalyticsReport = () => {
    const report = {
      analyticsSummary: {
        totalAssetsAnalyzed: images.length,
        uniqueKeywordsCount: analyticsData.uniqueKeywordsCount,
        avgPromptLengthChars: analyticsData.avgLength,
        dominantArchetype: analyticsData.dominantArchetype
      },
      topKeywords: analyticsData.topKeywords,
      styleDistribution: analyticsData.styleDistribution,
      topCoOccurringPairs: analyticsData.coOccurringPairs,
      generatedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `prompt_analytics_report_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const toggleRemixKeyword = (kw: string) => {
    setSelectedRemixKeywords(prev => 
      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
    );
  };

  const synthesizedRemixPrompt = useMemo(() => {
    if (selectedRemixKeywords.length === 0) return '';
    return `High quality marketing asset featuring ${selectedRemixKeywords.join(', ')}, professional studio lighting, 8k resolution, crisp commercial aesthetic`;
  }, [selectedRemixKeywords]);

  const handleCopyOrInsertRemix = () => {
    if (!synthesizedRemixPrompt) return;
    if (onSelectKeyword) {
      onSelectKeyword(synthesizedRemixPrompt);
    }
    navigator.clipboard.writeText(synthesizedRemixPrompt);
    setCopiedRemix(true);
    setTimeout(() => setCopiedRemix(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 md:p-5 shadow-2xl text-slate-100 transition-all duration-300">
      {/* Analytics Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 ${!isCollapsed ? 'border-b border-slate-800 pb-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                Prompt Keyword & Trend Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                Marketer Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualizes recurring vocabulary, style distribution, and creative prompt complexity trends across your assets.
            </p>
          </div>
        </div>

        {/* Action, Filter & Collapse Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedTimeframe('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedTimeframe === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Creations ({images.length})
                </button>
                <button
                  onClick={() => setSelectedTimeframe('recent')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedTimeframe === 'recent'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Recent 10
                </button>
              </div>

              <button
                onClick={handleExportAnalyticsReport}
                className="px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Report
              </button>
            </>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-black text-slate-200 flex items-center gap-1.5 transition shadow-sm"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 text-indigo-400" /> Expand Analytics
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 text-indigo-400" /> Collapse
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPACT SUMMARY BAR WHEN COLLAPSED */}
      {isCollapsed && (
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800/80 mt-3">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1 font-bold text-indigo-300">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              {analyticsData.uniqueKeywordsCount} Unique Terms
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Top Term: <strong className="text-amber-300">{analyticsData.topKeywords[0]?.keyword || 'N/A'}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Archetype: <strong className="text-white">{analyticsData.dominantArchetype}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {analyticsData.topKeywords.slice(0, 4).map((kw) => (
              <span key={kw.keyword} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono">
                #{kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FULL DETAILED ANALYTICS BODY WHEN EXPANDED */}
      {!isCollapsed && (
        <div className="space-y-6 pt-2">

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-indigo-400" /> Vocabulary Pool
          </div>
          <div className="text-xl md:text-2xl font-black text-white">{analyticsData.uniqueKeywordsCount}</div>
          <div className="text-[10px] text-indigo-300 font-medium">Unique prompt terms</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Avg Prompt Depth
          </div>
          <div className="text-xl md:text-2xl font-black text-white">{analyticsData.avgLength} <span className="text-xs text-slate-400 font-normal">chars</span></div>
          <div className="text-[10px] text-emerald-300 font-medium">Character detail depth</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Dominant Style
          </div>
          <div className="text-sm md:text-base font-extrabold text-white truncate">
            {analyticsData.styleDistribution[0]?.name || 'Photorealistic'}
          </div>
          <div className="text-[10px] text-purple-300 font-medium">Top visual style</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Creative Archetype
          </div>
          <div className="text-xs font-bold text-amber-300 truncate" title={analyticsData.dominantArchetype}>
            {analyticsData.dominantArchetype}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Auto-detected theme</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Keywords Bar Chart (Spans 2 Columns) */}
        <div className="lg:col-span-2 bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Prompt Keywords Frequency</h3>
            </div>

            {/* Keyword Search Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search keywords..."
                className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {analyticsData.topKeywords.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topKeywords} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis dataKey="keyword" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(val: any) => [`${val} times`, 'Usage Count']}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {analyticsData.topKeywords.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
              No prompt keywords analyzed yet or no match for search term.
            </div>
          )}
        </div>

        {/* Style Distribution Donut Chart */}
        <div className="bg-slate-950/80 p-4 md:p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Style Distribution</h3>
            </div>
          </div>

          {analyticsData.styleDistribution.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.styleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analyticsData.styleDistribution.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
              No style data available yet.
            </div>
          )}

          {/* Style Legend Badges */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
            {analyticsData.styleDistribution.map((style, idx) => (
              <span
                key={style.name}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }} />
                {style.name} ({style.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword Co-Occurrence Pairs & Prompt Remixing Builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Co-occurring Pairs */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Compass className="w-4 h-4 text-emerald-400" />
            Top Co-Occurring Keyword Pairs
          </div>
          <div className="space-y-2">
            {analyticsData.coOccurringPairs.map((pair) => (
              <div key={pair.pair} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-semibold text-slate-200">{pair.pair}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {pair.count}x paired
                </span>
              </div>
            ))}
            {analyticsData.coOccurringPairs.length === 0 && (
              <p className="text-xs text-slate-500 italic">Co-occurrence patterns will appear as you create more images.</p>
            )}
          </div>
        </div>

        {/* Multi-Keyword Prompt Remix Synthesizer */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              Interactive Prompt Synthesizer
            </div>
            <span className="text-[10px] text-indigo-300 font-bold">{selectedRemixKeywords.length} tags selected</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {analyticsData.topKeywords.map((kw) => {
              const isSelected = selectedRemixKeywords.includes(kw.keyword);
              return (
                <button
                  key={kw.keyword}
                  type="button"
                  onClick={() => toggleRemixKeyword(kw.keyword)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-500" />}
                  {kw.keyword}
                </button>
              );
            })}
          </div>

          {synthesizedRemixPrompt ? (
            <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 space-y-2">
              <p className="text-xs text-indigo-200 font-medium italic">"{synthesizedRemixPrompt}"</p>
              <button
                type="button"
                onClick={handleCopyOrInsertRemix}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                {copiedRemix ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
                {copiedRemix ? 'Inserted into Active Prompt!' : 'Use Synthesized Prompt'}
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Select tags above to synthesize a combined high-converting prompt.</p>
          )}
        </div>
      </div>

      {/* Interactive Keyword Cloud / Badges */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Top Trending Concept Tags (Click to insert into active prompt)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Ranked by frequency</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {analyticsData.topKeywords.map((kw) => (
            <button
              key={kw.keyword}
              onClick={() => onSelectKeyword?.(kw.keyword)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 group"
            >
              <span>{kw.keyword}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                {kw.count}x
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-300 transition" />
            </button>
          ))}
          {analyticsData.topKeywords.length === 0 && (
            <p className="text-xs text-slate-500 italic">No prompt keywords recorded yet.</p>
          )}
        </div>
      </div>

      {/* Marketer Actionable Insights Box */}
      <div className="p-4 bg-indigo-950/30 rounded-2xl border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Marketer Creative Insights & Recommendations
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {analyticsData.marketingTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
        </div>
      )}
    </div>
  );
}
