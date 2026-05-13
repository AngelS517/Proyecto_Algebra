import { FractalConfig } from '../types';

export const fern: FractalConfig = {
  name: 'Helecho de Barnsley',
  description: 'Un fractal que se asemeja a una hoja de helecho, generado por 4 transformaciones afines',
  transforms: [
    { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, probability: 0.01 },
    { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.60, probability: 0.85 },
    { a: 0.20, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.60, probability: 0.07 },
    { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, probability: 0.07 },
  ],
  initialPoint: { x: 0, y: 0 },
  defaultIterations: 10000,
  color: '#2dd4bf',
};

export const sierpinski: FractalConfig = {
  name: 'Triángulo de Sierpinski',
  description: 'Un fractal geométrico clásica formado por subdividir un triángulo en partes más pequeñas',
  transforms: [
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, probability: 0.33 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0, probability: 0.33 },
    { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25, f: 0.5, probability: 0.34 },
  ],
  initialPoint: { x: 0, y: 0 },
  defaultIterations: 10000,
  color: '#f472b6',
};

export const dragon: FractalConfig = {
  name: 'Curva del Dragón',
  description: 'Una curva fractal que se asemeja a un dragón mitológico',
  transforms: [
    { a: 0.5, b: -0.5, c: 0.5, d: 0.5, e: 0, f: 0, probability: 0.5 },
    { a: -0.5, b: -0.5, c: 0.5, d: -0.5, e: 1, f: 0, probability: 0.5 },
  ],
  initialPoint: { x: 0, y: 0 },
  defaultIterations: 10000,
  color: '#a78bfa',
};

export const levy: FractalConfig = {
  name: 'Curva de Lévy',
  description: 'Una curva fractal que se asemeja a la letra C',
  transforms: [
    { a: 0.5, b: -0.5, c: 0.5, d: 0.5, e: 0, f: 0, probability: 0.5 },
    { a: 0.5, b: 0.5, c: -0.5, d: 0.5, e: 0.5, f: 0.5, probability: 0.5 },
  ],
  initialPoint: { x: 0, y: 0 },
  defaultIterations: 10000,
  color: '#fb923c',
};

export const tree: FractalConfig = {
  name: 'Árbol Fractal',
  description: 'Un árbol generado por transformaciones afines que simula ramas',
  transforms: [
    { a: 0, b: 0, c: 0, d: 0.5, e: 0, f: 0, probability: 0.05 },
    { a: 0.42, b: -0.42, c: 0.42, d: 0.42, e: 0, f: 0.2, probability: 0.4 },
    { a: 0.42, b: 0.42, c: -0.42, d: 0.42, e: 0, f: 0.2, probability: 0.4 },
    { a: 0.1, b: 0, c: 0, d: 0.1, e: 0, f: 0.2, probability: 0.15 },
  ],
  initialPoint: { x: 0, y: 0 },
  defaultIterations: 10000,
  color: '#4ade80',
};

export const fractals: Record<string, FractalConfig> = {
  fern,
  sierpinski,
  dragon,
  levy,
  tree,
};

export const getFractalNames = (): string[] => Object.keys(fractals);

export const getFractal = (name: string): FractalConfig | undefined => fractals[name];