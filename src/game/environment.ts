export const GRID_SIZE = 2000;
export const SKY_COLORS = {
  sunPosition: [1, 0.5, 0.5] as [number, number, number],
  turbidity: 5,
  rayleigh: 2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
};
export const STARS_CONFIG = {
  radius: 1000,
  depth: 500,
  count: 5000, // Reduce star count for daytime
  factor: 4,
  saturation: 0.5,
  fade: true,
};
