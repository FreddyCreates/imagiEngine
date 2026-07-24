import { useState, useEffect, useRef } from 'react';
import { pipeline } from '@huggingface/transformers';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useNPCBrain(npcId: string, npcType: 'basic' | 'fast', worldState: any) {
  const [brain, setBrain] = useState({ backstory: "", goal: "", action: "" });
  const brainRef = useRef(brain);
  const [loading, setLoading] = useState(false);
  const generator = useRef<any>(null);

  useEffect(() => {
    // Load Firestore memory
    async function loadMemory() {
      const docRef = doc(db, 'npc_memory', npcId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newBrain = { ...brainRef.current, ...docSnap.data() } as any;
        setBrain(newBrain);
        brainRef.current = newBrain;
      } else {
        const initialMemory = { 
            backstory: npcType === 'fast' ? "Corrupted fast unit." : "Basic unit.", 
            goal: "Idle." 
        };
        const newBrain = { ...brainRef.current, ...initialMemory };
        setBrain(newBrain);
        brainRef.current = newBrain;
      }
    }
    loadMemory();

    async function initPipeline() {
      if (!generator.current) {
        try {
          generator.current = await pipeline('text-generation', 'Xenova/gpt2');
        } catch (err) {
          // Autonomous fallback generator when local ONNX model isn't available
          generator.current = async () => {
            const actions = [
              "Patrolling sector perimeter...",
              "Scanning surroundings for target signals...",
              "Guarding tactical zone...",
              "Analyzing player vector movement...",
              "Observing operational field..."
            ];
            const action = actions[Math.floor(Math.random() * actions.length)];
            return [{ generated_text: `Action:${action}` }];
          };
        }
      }
    }
    initPipeline();
  }, [npcId, npcType]);

  useEffect(() => {
    async function think() {
      if (!generator.current) return;
      
      setLoading(true);
      try {
        const prompt = `NPC (${npcType}). Memory: ${brainRef.current.backstory}. Goal: ${brainRef.current.goal}. World: ${JSON.stringify(worldState)}. Action:`;
        const result = await generator.current(prompt, { max_new_tokens: 20 });
        
        const newAction = result[0].generated_text.split("Action:")[1]?.trim() || "Observing...";
        
        const newBrain = { ...brainRef.current, action: newAction };
        setBrain(newBrain);
        brainRef.current = newBrain;
        await setDoc(doc(db, 'npc_memory', npcId), newBrain);
      } catch (e) {
        console.error("Brain malfunction", e);
      } finally {
        setLoading(false);
      }
    }
    
    const interval = setInterval(think, 10000); 
    // Initial call
    setTimeout(think, 1000);
    return () => clearInterval(interval);
  }, [npcId, npcType, worldState]);

  return { brain, loading };
}
