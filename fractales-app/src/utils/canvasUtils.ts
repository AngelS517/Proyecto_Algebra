import { Point } from '../types';

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export const defaultCanvasTransform: CanvasTransform = {
  scale: 50,
  offsetX: 0.5,
  offsetY: 0.5,
  width: 800,
  height: 600,
};

export const worldToCanvas = (
  point: Point,
  transform: CanvasTransform
): Point => {
  return {
    x: transform.width * transform.offsetX + point.x * transform.scale,
    y: transform.height * transform.offsetY - point.y * transform.scale,
  };
};

export const canvasToWorld = (
  point: Point,
  transform: CanvasTransform
): Point => {
  return {
    x: (point.x - transform.width * transform.offsetX) / transform.scale,
    y: (transform.height * transform.offsetY - point.y) / transform.scale,
  };
};

export const getDefaultTransform = (
  fractalName: string,
  width: number,
  height: number
): CanvasTransform => {
  const scales: Record<string, number> = {
    fern: 40,
    sierpinski: 180,
    dragon: 180,
    levy: 180,
    tree: 180,
  };

  return {
    scale: scales[fractalName] || 50,
    offsetX: 0.5,
    offsetY: 0.5,
    width,
    height,
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};