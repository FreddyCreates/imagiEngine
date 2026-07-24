import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export function Gun({ onShoot }: { onShoot: () => void }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  
  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(0.5));
    mesh.current.quaternion.copy(camera.quaternion);
  });
  
  return (
    <mesh ref={mesh} onClick={onShoot}>
      <boxGeometry args={[0.05, 0.05, 0.4]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}
