import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { World } from './World';
import { Menu } from './Menu';
import { AirportMenu } from './AirportMenu';
import { Crosshair } from './Crosshair';
import { HUD } from './HUD';
import { CodeEditor } from './CodeEditor';
import { Camera, Camera as CameraIcon, Map, Code, Sparkles, Check } from 'lucide-react';

interface ThreeStudioProps {
  onCaptureSnapshot: (dataUrl: string) => void;
  onNavigateToImageStudio: () => void;
}

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'flyUp', keys: ['f', 'F'] },
  { name: 'flyDown', keys: ['v', 'V'] },
  { name: 'thrust', keys: ['Shift'] },
  { name: 'map', keys: ['m', 'M'] },
];

export function ThreeStudio({ onCaptureSnapshot, onNavigateToImageStudio }: ThreeStudioProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAirportMenuOpen, setIsAirportMenuOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);
  const [capturedNotice, setCapturedNotice] = useState(false);

  const handleCapture3DSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        onCaptureSnapshot(dataUrl);
        setCapturedNotice(true);
        setTimeout(() => setCapturedNotice(false), 3000);
      } catch (e) {
        console.error("3D snapshot capture error:", e);
      }
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Top Studio Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 3D Prototyping Engine
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">WASD: Move | Shift: Jet Thrust | Click Plane: Board Plane</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Render 3D Snapshot Button */}
          <button
            onClick={handleCapture3DSnapshot}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-indigo-400/30 transition"
          >
            <CameraIcon className="w-4 h-4" /> Render 3D Snapshot
          </button>

          {/* Map Modal Button */}
          <button
            onClick={() => setIsAirportMenuOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <Map className="w-4 h-4 text-orange-400" /> Airport Map [M]
          </button>

          {/* Code IDE Toggle */}
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition border border-slate-700"
          >
            <Code className="w-4 h-4 text-emerald-400" /> {showEditor ? 'Close IDE' : '3D Shader IDE'}
          </button>
        </div>
      </div>

      {/* Captured Snapshot Success Notification */}
      {capturedNotice && (
        <div className="absolute top-20 right-4 z-40 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-medium animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>3D Viewport Render Captured! Sent to AI Image Studio.</span>
          <button
            onClick={onNavigateToImageStudio}
            className="underline font-bold text-white hover:text-emerald-300 ml-2"
          >
            Go to Image Studio →
          </button>
        </div>
      )}

      {/* Game Modals & Overlays */}
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <AirportMenu isOpen={isAirportMenuOpen} onClose={() => setIsAirportMenuOpen(false)} onTeleport={setTeleportTarget} />
      {!isMenuOpen && !isAirportMenuOpen && <Crosshair />}
      {!isMenuOpen && !isAirportMenuOpen && <HUD health={health} score={score} dialogue={activeDialogue || undefined} />}

      {showEditor && (
        <div className="absolute top-20 left-4 w-1/3 h-3/4 z-40 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <CodeEditor filePath="/src/components/World.tsx" onSave={() => console.log('Saved')} onClose={() => setShowEditor(false)} />
        </div>
      )}

      {/* 3D Canvas */}
      <KeyboardControls map={keyMap}>
        <Canvas camera={{ position: [0, 1.6, 5], far: 5000 }} shadows gl={{ preserveDrawingBuffer: true }}>
          <World 
            isMenuOpen={isMenuOpen} 
            showEditor={showEditor} 
            setScore={setScore} 
            setActiveDialogue={setActiveDialogue} 
            teleportTarget={teleportTarget}
          />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
