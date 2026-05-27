export interface VisualTheme {
  bgColor: string;
  gridColor: string;
  gridOpacity: number;
  gridEnabled: boolean;
  axesColor: string;
  fractalColor: string;
  glowEnabled: boolean;
  glowIntensity: number;
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
};