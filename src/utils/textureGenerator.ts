import * as THREE from 'three';

export function createBuildingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base building color (dark metal/concrete)
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);

  // Add panel lines
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  for (let i = 0; i < 256; i += 64) {
    ctx.strokeRect(i, 0, 0, 256);
    ctx.strokeRect(0, i, 256, 0);
  }

  // Add realistic windows
  for (let y = 10; y < 256; y += 50) {
    for (let x = 10; x < 256; x += 50) {
      // Window frame
      ctx.fillStyle = '#050505';
      ctx.fillRect(x, y, 35, 40);
      
      // Window glass (randomly lit)
      ctx.fillStyle = Math.random() > 0.6 ? '#f0f0ff' : '#0a0a1a';
      ctx.fillRect(x + 5, y + 5, 25, 30);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4); // Scale texture to look detailed and tall
  return texture;
}
