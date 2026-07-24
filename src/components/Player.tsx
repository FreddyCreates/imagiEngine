import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PLAYER_CONFIG } from '../game/player';

type PlayerProps = { isMenuOpen: boolean; teleportTarget?: [number, number, number] | null; };

export function Player({ isMenuOpen, teleportTarget }: PlayerProps) {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    if (teleportTarget) {
        camera.position.set(...teleportTarget);
        velocity.current.set(0, 0, 0);
    }
  }, [teleportTarget, camera]);

  useEffect(() => {
    const handleMouseDown = () => {
        if (isMenuOpen) return;
        setIsFiring(true);
        setTimeout(() => setIsFiring(false), 100);
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isMenuOpen]);

  useFrame((_state, delta) => {
    if (isMenuOpen) return;

    const { forward, backward, left, right, jump } = get();

    // Movement
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(PLAYER_CONFIG.speed)
      .applyEuler(camera.rotation);

    // Gravity & Jump
    if (camera.position.y > 1.6) {
        velocity.current.y -= PLAYER_CONFIG.gravity * delta;
    } else {
        velocity.current.y = 0;
        camera.position.y = 1.6;
    }

    if (jump && camera.position.y <= 1.6) {
        velocity.current.y = PLAYER_CONFIG.jumpStrength;
    }

    camera.position.addScaledVector(direction, delta);
    camera.position.addScaledVector(velocity.current, delta);
  });

  return null;
}
