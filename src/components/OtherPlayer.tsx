import { useRef } from 'react';
import * as THREE from 'three';

export function OtherPlayer({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  if (!position) return null;

  return (
    <mesh ref={mesh} position={position}>
      <capsuleGeometry args={[0.3, 1, 4, 8]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
