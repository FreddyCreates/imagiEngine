import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Gun } from './Gun';

export function Shooting({ onHit }: { onHit: (npcId: string) => void }) {
  const { camera, scene } = useThree();

  const handleShoot = () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); // Center of screen
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    for (const intersect of intersects) {
      if (intersect.object.userData.isNPC) {
        onHit(intersect.object.userData.npcId);
        break; // Hit one NPC
      }
    }
  };

  return <Gun onShoot={handleShoot} />;
}
