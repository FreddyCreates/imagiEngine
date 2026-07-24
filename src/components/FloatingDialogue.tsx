import { Html } from '@react-three/drei';

export function FloatingDialogue({ text }: { text: string }) {
  if (!text) return null;
  
  return (
    <Html position={[0, 2.2, 0]} center>
      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
        {text}
      </div>
    </Html>
  );
}
