import { PointerLockControls, Sky, Stars } from '@react-three/drei';
import { SKY_COLORS, STARS_CONFIG } from '../game/environment';
import { Player } from './Player';
import { City } from './City';
import { Ground } from './Ground';
import { Forest } from './Forest';
import { NPC } from './NPC';
import { OtherPlayer } from './OtherPlayer';
import { Plane } from './Plane';
import { Airport } from './Airport';
import { usePlayerPresence } from '../hooks/usePlayerPresence';

export function World({ isMenuOpen, showEditor, setScore, setActiveDialogue, teleportTarget }: { isMenuOpen: boolean, showEditor: boolean, setScore: any, setActiveDialogue: any, teleportTarget?: [number, number, number] | null }) {
  const players = usePlayerPresence();

  return (
    <>
      <fog attach="fog" args={["#a0c0e0", 10, 1500]} />
      {!showEditor && !isMenuOpen && <PointerLockControls />}
      <Sky
        distance={450000}
        sunPosition={SKY_COLORS.sunPosition}
        turbidity={SKY_COLORS.turbidity}
        rayleigh={SKY_COLORS.rayleigh}
        mieCoefficient={SKY_COLORS.mieCoefficient}
        mieDirectionalG={SKY_COLORS.mieDirectionalG}
      />
      <Stars {...STARS_CONFIG} />
      <ambientLight intensity={0.7} />
      <directionalLight position={SKY_COLORS.sunPosition} intensity={1.5} castShadow />
      
      <Player isMenuOpen={isMenuOpen} teleportTarget={teleportTarget} />
      
      {/* Real-time players */}
      {Object.entries(players).map(([id, data]) => (
        <OtherPlayer key={id} position={data.position} />
      ))}
      
      <Plane position={[0, 2, 10]} />
      <Airport position={[0, 0, 0]} />
      
      <City position={[-500, 0, -500]} />
      <City position={[500, 0, 500]} />
      <Forest position={[-200, 0, 200]} />
      <Forest position={[200, 0, -200]} />
      <Forest position={[-600, 0, 600]} />
      
      {/* Some extra world objects for realism */}
      <mesh position={[10, 2, -10]} castShadow>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial color="orange" />
      </mesh>
      <mesh position={[-15, 1, 5]} castShadow>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="green" />
      </mesh>
      
      <NPC position={[10, 0, 10]} onHit={() => setScore((s: number) => s + 10)} setDialogue={setActiveDialogue} type="basic" />
      <NPC position={[-10, 0, 10]} onHit={() => setScore((s: number) => s + 20)} setDialogue={setActiveDialogue} type="fast" />
      <NPC position={[0, 0, 15]} onHit={() => setScore((s: number) => s + 10)} setDialogue={setActiveDialogue} type="basic" />
      
      <Ground />
    </>
  );
}
