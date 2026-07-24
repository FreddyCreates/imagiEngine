import { Instances, Instance } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export function Forest({ position = [0, 0, 0], areaSize = 3000, density = 5000 }: { position?: [number, number, number]; areaSize?: number; density?: number }) {
  const treeData = useMemo(() => {
    const data = [];
    for (let i = 0; i < density; i++) {
      const x = (Math.random() - 0.5) * areaSize;
      const z = (Math.random() - 0.5) * areaSize;
      
      // Avoid city center (rough estimate, city is around 3000x3000 from previous code)
      if (Math.abs(x) < 1600 && Math.abs(z) < 1600) continue;

      const height = 10 + Math.random() * 30;
      const type = Math.floor(Math.random() * 3); // 3 types of trees
      
      data.push({
        position: [x, height / 2, z] as [number, number, number],
        scale: [5 + Math.random() * 5, height, 5 + Math.random() * 5] as [number, number, number],
        type,
      });
    }
    return data;
  }, [areaSize, density]);

  return (
    <group position={position}>
      {/* Type 0: Tall slender trees */}
      <Instances range={treeData.filter(t => t.type === 0).length}>
        <coneGeometry args={[2, 10, 8]} />
        <meshStandardMaterial color="#2d5a27" />
        {treeData.filter(t => t.type === 0).map((t, i) => (
          <Instance key={i} position={t.position} scale={t.scale} />
        ))}
      </Instances>
      
      {/* Type 1: Wider canopy trees */}
      <Instances range={treeData.filter(t => t.type === 1).length}>
        <sphereGeometry args={[4, 8, 8]} />
        <meshStandardMaterial color="#1e3d1a" />
        {treeData.filter(t => t.type === 1).map((t, i) => (
          <Instance key={i} position={t.position} scale={t.scale} />
        ))}
      </Instances>
    </group>
  );
}
