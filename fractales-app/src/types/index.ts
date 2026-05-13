export interface Point {
  x: number;
  y: number;
}

export interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  probability: number;
}

export interface FractalConfig {
  name: string;
  description: string;
  transforms: AffineTransform[];
  initialPoint: Point;
  defaultIterations: number;
  color: string;
}

export interface IFSState {
  config: FractalConfig;
  currentPoint: Point;
  points: Point[];
  iteration: number;
  isRunning: boolean;
  animationSpeed: number;
}