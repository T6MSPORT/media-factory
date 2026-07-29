export const MOTORSPORT_FONTS = [
  'Orbitron',
  'Rajdhani',
  'Teko',
  'Oxanium',
  'Russo One',
] as const;

export type MotorsportFont = (typeof MOTORSPORT_FONTS)[number];

export const MEDIA_FACTORY_UI_COLORS = {
  primary: '#ef3b3b',
  secondary: '#111317',
  accent: '#ffffff',
} as const;
