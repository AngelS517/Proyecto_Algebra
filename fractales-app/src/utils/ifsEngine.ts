import { Point, AffineTransform } from '../types';

export const applyTransform = (
  point: Point,
  transform: AffineTransform
): Point => {
  const newX = transform.a * point.x + transform.b * point.y + transform.e;
  const newY = transform.c * point.x + transform.d * point.y + transform.f;
  return { x: newX, y: newY };
};

export const selectTransform = (
  transforms: AffineTransform[]
): AffineTransform => {
  const rand = Math.random();
  let cumulative = 0;

  for (const transform of transforms) {
    cumulative += transform.probability;
    if (rand <= cumulative) {
      return transform;
    }
  }

  return transforms[transforms.length - 1];
};

export const generatePoints = (
  transforms: AffineTransform[],
  initialPoint: Point,
  numIterations: number,
  skipFirst: number = 100
): Point[] => {
  const points: Point[] = [];
  let currentPoint = { ...initialPoint };

  for (let i = 0; i < skipFirst; i++) {
    const transform = selectTransform(transforms);
    currentPoint = applyTransform(currentPoint, transform);
  }

  for (let i = 0; i < numIterations; i++) {
    const transform = selectTransform(transforms);
    currentPoint = applyTransform(currentPoint, transform);
    points.push({ ...currentPoint });
  }

  return points;
};

export const generatePointsBatch = (
  transforms: AffineTransform[],
  initialPoint: Point,
  batchSize: number,
  skipFirst: number = 100
): { points: Point[]; newInitialPoint: Point } => {
  const points: Point[] = [];
  let currentPoint = { ...initialPoint };

  for (let i = 0; i < skipFirst; i++) {
    const transform = selectTransform(transforms);
    currentPoint = applyTransform(currentPoint, transform);
  }

  for (let i = 0; i < batchSize; i++) {
    const transform = selectTransform(transforms);
    currentPoint = applyTransform(currentPoint, transform);
    points.push({ ...currentPoint });
  }

  return { points, newInitialPoint: currentPoint };
};

export const getTransformMatrix = (
  transform: AffineTransform
): number[][] => {
  return [
    [transform.a, transform.b, transform.e],
    [transform.c, transform.d, transform.f],
  ];
};

export const composeTransforms = (
  t1: AffineTransform,
  t2: AffineTransform
): AffineTransform => {
  const a = t1.a * t2.a + t1.b * t2.c;
  const b = t1.a * t2.b + t1.b * t2.d;
  const c = t1.c * t2.a + t1.d * t2.c;
  const d = t1.c * t2.b + t1.d * t2.d;
  const e = t1.e * t2.a + t1.f * t2.c + t2.e;
  const f = t1.e * t2.b + t1.f * t2.d + t2.f;

  return {
    a, b, c, d, e, f,
    probability: (t1.probability + t2.probability) / 2,
  };
};

export const findFixedPoint = (
  transform: AffineTransform,
  tolerance: number = 1e-10,
  maxIterations: number = 100
): Point => {
  let x = 0, y = 0;

  for (let i = 0; i < maxIterations; i++) {
    const newX = transform.a * x + transform.b * y + transform.e;
    const newY = transform.c * x + transform.d * y + transform.f;

    if (Math.abs(newX - x) < tolerance && Math.abs(newY - y) < tolerance) {
      return { x: newX, y: newY };
    }

    x = newX;
    y = newY;
  }

  return { x, y };
};

export const estimateBounds = (
  transforms: AffineTransform[],
  initialPoint: Point,
  numSamples: number = 20000
): { minX: number; maxX: number; minY: number; maxY: number } => {
  let x = initialPoint.x;
  let y = initialPoint.y;

  // El fractor es independiente del punto de partida
  
  for (let i = 0; i < 200; i++) {
    const t = selectTransform(transforms);
    const nx = t.a * x + t.b * y + t.e;
    const ny = t.c * x + t.d * y + t.f;
    x = nx; y = ny;
  }

  // Now on the attractor — seed bounds from current position
  let minX = x, maxX = x, minY = y, maxY = y;

  for (let i = 0; i < numSamples; i++) {
    const t = selectTransform(transforms);
    const nx = t.a * x + t.b * y + t.e;
    const ny = t.c * x + t.d * y + t.f;
    x = nx; y = ny;
    if (nx < minX) minX = nx;
    if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny;
    if (ny > maxY) maxY = ny;
  }

  const padX = (maxX - minX) * 0.1 || 0.5;
  const padY = (maxY - minY) * 0.1 || 0.5;
  return {
    minX: minX - padX,
    maxX: maxX + padX,
    minY: minY - padY,
    maxY: maxY + padY,
  };
};