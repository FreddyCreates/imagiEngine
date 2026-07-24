import { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { doc, setDoc, deleteDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as THREE from 'three';

export function usePlayerPresence() {
  const [players, setPlayers] = useState<Record<string, { position: [number, number, number] }>>({});
  const playerId = useRef(Math.random().toString(36).substr(2, 9));
  const { camera } = useThree();

  useEffect(() => {
    const playerDoc = doc(db, 'presence', playerId.current);
    
    // Register player
    setDoc(playerDoc, { position: [camera.position.x, camera.position.y, camera.position.z] });

    // Listen to all players
    const unsub = onSnapshot(collection(db, 'presence'), (snapshot) => {
      const newPlayers: Record<string, { position: [number, number, number] }> = {};
      snapshot.forEach((doc) => {
        if (doc.id !== playerId.current) {
          newPlayers[doc.id] = doc.data() as { position: [number, number, number] };
        }
      });
      setPlayers(newPlayers);
    });

    return () => {
      unsub();
      deleteDoc(playerDoc);
    };
  }, []);

  const lastUpdate = useRef(0);
  useFrame((state) => {
    if (state.clock.getElapsedTime() - lastUpdate.current > 0.2) { // 5 times a second
        updateDoc(doc(db, 'presence', playerId.current), { 
            position: [camera.position.x, camera.position.y, camera.position.z] 
        });
        lastUpdate.current = state.clock.getElapsedTime();
    }
  });

  return players;
}
