import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Plane({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Group>(null!);
  const [isFlying, setIsFlying] = useState(false);
  const { camera } = useThree();

  useFrame((state) => {
    if (!mesh.current) return;
    if (isFlying) {
      // Basic flight logic: move forward
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(mesh.current.quaternion);
      mesh.current.position.add(direction.multiplyScalar(0.5));
      
      // Follow camera
      camera.position.copy(mesh.current.position).add(new THREE.Vector3(0, 2, 5));
    }
  });

  return (
    <group ref={mesh} position={position} onClick={() => setIsFlying(!isFlying)}>
      {/* Basic body */}
      <mesh>
        <boxGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.2, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}
