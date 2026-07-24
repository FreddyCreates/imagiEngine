import { Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars, KeyboardControls } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { SKY_COLORS, STARS_CONFIG } from '../game/environment';
import { Player } from './Player';
import { Menu } from './Menu';
import { City } from './City';
import { Ground } from './Ground';
import { Forest } from './Forest';
import { World } from './World';
import { Crosshair } from './Crosshair';
import { CodeEditor } from './CodeEditor';
import { NPC } from './NPC';
import { HUD } from './HUD';
import { OtherPlayer } from './OtherPlayer';
import { AirportMenu } from './AirportMenu';
import { usePlayerPresence } from '../hooks/usePlayerPresence';

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

export function GameScene() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAirportMenuOpen, setIsAirportMenuOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (teleportTarget) setTeleportTarget(null);
  }, [teleportTarget]);

  useEffect(() => {
    if (activeDialogue) {
      const timer = setTimeout(() => setActiveDialogue(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeDialogue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsMenuOpen(prev => !prev);
        }
        if (e.key === 'm' || e.key === 'M') {
            setIsAirportMenuOpen(prev => !prev);
        }
    };
    const handlePointerLockError = (e: Event) => {
      e.preventDefault();
    };
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason && (e.reason.name === 'DOMException' || String(e.reason).includes('pointerLock') || String(e.reason).includes('PointerLock'))) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <AirportMenu isOpen={isAirportMenuOpen} onClose={() => setIsAirportMenuOpen(false)} onTeleport={setTeleportTarget} />
      {!isMenuOpen && !isAirportMenuOpen && <Crosshair />}
      {!isMenuOpen && !isAirportMenuOpen && <HUD health={health} score={score} dialogue={activeDialogue || undefined} />}
      
      {!isMenuOpen && !isAirportMenuOpen && (
          <button 
            onClick={() => setShowEditor(!showEditor)} 
            className="absolute top-4 left-4 z-20 px-4 py-2 bg-gray-900 text-white rounded border border-gray-700 hover:bg-gray-800 transition"
          >
            {showEditor ? 'Close IDE' : 'Open IDE'}
          </button>
      )}

      {showEditor && (
        <div className="absolute top-16 left-4 w-1/3 h-4/5 z-20">
          <CodeEditor filePath="/src/components/GameScene.tsx" onSave={() => console.log('Saved')} onClose={() => setShowEditor(false)} />
        </div>
      )}

      <KeyboardControls map={keyMap}>
        <Canvas camera={{ position: [0, 1.6, 5], far: 5000 }} shadows>
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
