import { Instances, Instance } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { createBuildingTexture } from '../utils/textureGenerator';

export function City({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const gridSize = 40; 
  const blockSize = 80;
  
  const buildingTexture = useMemo(() => createBuildingTexture(), []);

  const buildingData = useMemo(() => {
    const standard = [];
    const towers = [];
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Create street layout
        if (x % 5 === 0 || z % 5 === 0) continue;

        const posX = (x - gridSize / 2) * blockSize;
        const posZ = (z - gridSize / 2) * blockSize;
        
        // Randomize height and width for variety
        const height = 30 + Math.random() * 200;
        const width = 20 + Math.random() * 20;

        const data = {
          position: [posX, height / 2, posZ] as [number, number, number],
          scale: [width, height, width] as [number, number, number],
          color: new THREE.Color().setHSL(0.6, 0.1, 0.4 + Math.random() * 0.2),
          emissive: Math.random() > 0.6 ? "#00ffff" : "#000000",
        };

        if (Math.random() > 0.8) towers.push(data);
        else standard.push(data);
      }
    }
    return { standard, towers };
  }, []);

  const BuildingInstances = ({ data, color }: { data: any[], color?: string }) => (
    <Instances range={data.length}>
      <boxGeometry />
      <meshStandardMaterial 
        roughness={0.2} 
        metalness={0.7} 
        map={buildingTexture}
        emissiveMap={buildingTexture}
      />
      
      {data.map((b, i) => (
        <Instance 
          key={i}
          position={b.position}
          scale={b.scale}
          color={color || b.color}
        />
      ))}
    </Instances>
  );

  return (
    <group position={position}>
      {/* City Blocks using Instances */}
      <BuildingInstances data={buildingData.standard} />
      <BuildingInstances data={buildingData.towers} color="#a0a0d0" />
    </group>
  );
}
