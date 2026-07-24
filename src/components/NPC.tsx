import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useNPCBrain } from '../hooks/useNPCBrain';
import { FloatingDialogue } from './FloatingDialogue';

export function NPC({ position, onHit, setDialogue, type = 'basic' }: { position: [number, number, number]; onHit: () => void, setDialogue: (d: string) => void, type?: 'basic' | 'fast' }) {
  const mesh = useRef<THREE.Group>(null!);
  const [health, setHealth] = useState(type === 'fast' ? 50 : 100);
  const color = type === 'fast' ? 'purple' : 'orange';
  
  // Use a simple ID based on position for persistence
  const npcId = `npc_${position[0]}_${position[2]}`;
  const { brain } = useNPCBrain(npcId, type, { position: position });

  useFrame((state) => {
    if (!mesh.current || health <= 0) return;
    if (state.clock.elapsedTime % 1 < 0.05) {
        fetch("/api/npc-behavior", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: mesh.current ? mesh.current.position.toArray() : position, playerPosition: [0, 1.6, 5], type })
        }).then(res => res.json()).then(data => {
            if (!mesh.current) return;
            if (data.move) {
                const speed = type === 'fast' ? 0.2 : 0.1;
                mesh.current.position.x += data.move[0] * speed;
                mesh.current.position.z += data.move[2] * speed;
            }
            if (data.dialogue) {
                setDialogue(data.dialogue);
            }
        }).catch(() => {});
    }
  });

  const handleHit = () => {
    setHealth(prev => prev - 20);
    onHit();
  };

  if (health <= 0) return null;

  return (
    <group ref={mesh} position={position} onClick={handleHit}>
      <FloatingDialogue text={brain.action} />
      {/* Body */}
      <mesh position={[0, 0.8, 0]} userData={{ isNPC: true, npcId: npcId }}>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={health < 50 ? "red" : color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="peachpuff" />
      </mesh>
      {/* Arms */}
      <mesh position={[0.3, 0.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
        <meshStandardMaterial color="peachpuff" />
      </mesh>
      {/* Gun placeholder */}
      <mesh position={[0.5, 0.6, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}
