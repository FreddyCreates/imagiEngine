import { Plane } from '@react-three/drei';

export function Ground() {
  return (
    <>
      {/* Grass/Forest Floor */}
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10000, 10000]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#1a331a" />
      </Plane>
      
      {/* Main Roads (Crossing) */}
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10000, 80]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222" />
      </Plane>
      <Plane rotation={[-Math.PI / 2, 0, 0]} args={[80, 10000]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222" />
      </Plane>
    </>
  );
}
