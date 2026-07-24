export const MOTORSPORT_FONTS = [
  'Orbitron',
  'Rajdhani',
  'Teko',
  'Oxanium',
  'Russo One',
] as const;

export type MotorsportFont = (typeof MOTORSPORT_FONTS)[number];
