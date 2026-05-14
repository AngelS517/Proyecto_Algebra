import { FractalConfig } from '../types';

export const fernVariations: Record<string, FractalConfig> = {
  fernClassic: {
    name: 'Helecho Clásico',
    description: 'El helecho original de Barnsley',
    transforms: [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, probability: 0.01 },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.60, probability: 0.85 },
      { a: 0.20, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.60, probability: 0.07 },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, probability: 0.07 },
    ],
    initialPoint: { x: 0, y: 0 },
    defaultIterations: 10000,
    color: '#2dd4bf',
  },
  fernNarrow: {
    name: 'Helecho Estrecho',
    description: 'Variación del helecho con estructura más esbelta',
    transforms: [
      { a: 0, b: 0, c: 0, d: 0.25, e: 0, f: -0.14, probability: 0.02 },
      { a: 0.95, b: 0.005, c: -0.005, d: 0.93, e: -0.002, f: 0.5, probability: 0.86 },
      { a: 0.035, b: -0.2, c: 0.16, d: 0.04, e: -0.09, f: 0.4, probability: 0.06 },
      { a: -0.04, b: 0.16, c: 0.16, d: 0.04, e: 0.07, f: 0.4, probability: 0.06 },
    ],
    initialPoint: { x: 0, y: 0 },
    defaultIterations: 10000,
    color: '#34d399',
  },
  fernGolden: {
    name: 'Helecho Dorado',
    description: 'Variación con tonalidad dorada',
    transforms: [
      { a: 0, b: 0, c: 0, d: 0.18, e: 0, f: 0, probability: 0.01 },
      { a: 0.87, b: 0.01, c: -0.01, d: 0.87, e: 0, f: 1.80, probability: 0.85 },
      { a: 0.18, b: -0.28, c: 0.24, d: 0.20, e: 0, f: 1.60, probability: 0.07 },
      { a: -0.16, b: 0.26, c: 0.26, d: 0.22, e: 0, f: 0.5, probability: 0.07 },
    ],
    initialPoint: { x: 0, y: 0 },
    defaultIterations: 10000,
    color: '#fbbf24',
  },
  fernSpiky: {
    name: 'Helecho Espinoso',
    description: 'Variación con apariencia más puntiaguda',
    transforms: [
      { a: 0, b: 0, c: 0, d: 0.12, e: 0, f: 0, probability: 0.01 },
      { a: 0.80, b: 0.08, c: -0.08, d: 0.80, e: 0, f: 1.50, probability: 0.85 },
      { a: 0.25, b: -0.35, c: 0.30, d: 0.25, e: 0, f: 1.50, probability: 0.07 },
      { a: -0.20, b: 0.35, c: 0.35, d: 0.25, e: 0, f: 0.35, probability: 0.07 },
    ],
    initialPoint: { x: 0, y: 0 },
    defaultIterations: 10000,
    color: '#a78bfa',
  },
};

export const getPresetNames = (): string[] => [...Object.keys(fernVariations)];

export const getPreset = (name: string): FractalConfig | undefined => fernVariations[name];

export const getAllPresets = (): FractalConfig[] => Object.values(fernVariations);