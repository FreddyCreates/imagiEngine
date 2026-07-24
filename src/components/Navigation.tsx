import React from 'react';
import { Image as ImageIcon, Video, Box, FolderPlus, Sparkles, FileText, Cpu, Home } from 'lucide-react';

export type TabType = 'home' | 'images' | 'video' | 'three' | 'doc' | 'engines' | 'portfolios';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasActiveReference?: boolean;
}

export function Navigation({ activeTab, onTabChange, hasActiveReference }: NavigationProps) {
  const navItems = [
    { id: 'home' as TabType, label: 'Workspace Home', icon: Home, badge: 'Hub' },
    { id: 'images' as TabType, label: 'Image Studio', icon: ImageIcon, badge: null },
    { id: 'video' as TabType, label: 'Video & Reels', icon: Video, badge: 'New' },
    { id: 'three' as TabType, label: '3D Game Studio', icon: Box, badge: '3D' },
    { id: 'doc' as TabType, label: 'Document Generator', icon: FileText, badge: 'Full-Gen' },
    { id: 'engines' as TabType, label: 'AI Transformers & Tools', icon: Cpu, badge: 'Pro' },
    { id: 'portfolios' as TabType, label: 'Portfolios', icon: FolderPlus, badge: null }
  ];


  return (
    <header className="w-full bg-slate-950 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              AURA <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">CREATOR AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Generative AI & 3D Prototyping Platform</div>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
