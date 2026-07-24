import * as THREE from 'three';

export function Airport({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Runway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 200]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Hangars */}
      <mesh position={[40, 5, 0]} castShadow>
        <boxGeometry args={[20, 10, 40]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[-40, 5, 0]} castShadow>
        <boxGeometry args={[20, 10, 40]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  );
}
