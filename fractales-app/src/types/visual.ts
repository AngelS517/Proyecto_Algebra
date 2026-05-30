export interface VisualTheme {
  bgColor: string;
  gridColor: string;
  gridOpacity: number;
  gridEnabled: boolean;
  axesColor: string;
  fractalColor: string;
  glowEnabled: boolean;
  glowIntensity: number;
  gradientStart: string;
  gradientEnd: string;
}

export interface VisualTheme {
  bgColor: string;
  gridColor: string;
  gridOpacity: number;
  gridEnabled: boolean;
  axesColor: string;
  fractalColor: string;
  glowEnabled: boolean;
  glowIntensity: number;
  gradientStart: string;
  gradientEnd: string;
}

export const defaultVisualTheme: VisualTheme = {
  bgColor: '#0a0e1a',
  gridColor: '#1e293b',
  gridOpacity: 0.25,
  gridEnabled: true,
  axesColor: '#2dd4bf',
  fractalColor: '#2dd4bf',
  glowEnabled: true,
  glowIntensity: 0.4,
  gradientStart: '#2dd4bf',
  gradientEnd: '#0ea5e9',
};