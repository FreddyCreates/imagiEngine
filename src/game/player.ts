export const PLAYER_CONFIG = {
  speed: 10.0,
  jumpStrength: 10.0,
  gravity: 9.8,
  sensitivity: 0.002,
};

export type PlayerState = {
  position: [number, number, number];
  velocity: [number, number, number];
};
