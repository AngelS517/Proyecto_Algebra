import { Point, AffineTransform } from '../types';

// Normaliza las probabilidades para que sumen 1
export const normalizeProbabilities = (
  transforms: AffineTransform[]
): AffineTransform[] => {

  const total = transforms.reduce(
    (sum, transform) => sum + transform.probability,
    0
  );

  if (total === 0) {
    throw new Error('La suma de probabilidades no puede ser 0');
  }

  return transforms.map(transform => ({
    ...transform,
    probability: transform.probability / total
  }));
};


// Aplica la transformación afín a un punto
//
// x' = ax + by + e
// y' = cx + dy + f
//
// Aquí es donde se aplica el álgebra lineal
export const applyTransform = (
  point: Point,
  transform: AffineTransform
): Point => {

  const newX =
    transform.a * point.x +
    transform.b * point.y +
    transform.e;

  const newY =
    transform.c * point.x +
    transform.d * point.y +
    transform.f;

  return {
    x: newX,
    y: newY
  };
};


// Selecciona una transformación usando probabilidades
export const selectTransform = (
  transforms: AffineTransform[]
): AffineTransform => {

  const random = Math.random();
  let cumulative = 0;

  for (const transform of transforms) {

    cumulative += transform.probability;

    if (random <= cumulative) {
      return transform;
    }
  }

  // Seguridad por errores decimales
  return transforms[transforms.length - 1];
};


// Genera todos los puntos del fractal
//
// El proceso es:
// 1. Elegir transformación
// 2. Aplicarla al punto actual
// 3. Guardar el nuevo punto
// 4. Repetir miles de veces
export const generatePoints = (
  transforms: AffineTransform[],
  initialPoint: Point,
  numIterations: number,
  skipFirst: number = 100
): Point[] => {

  const normalizedTransforms =
    normalizeProbabilities(transforms);

  const points: Point[] = [];

  let currentPoint = { ...initialPoint };

  // Las primeras iteraciones se descartan
  // porque el sistema todavía no converge
  for (let i = 0; i < skipFirst; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    currentPoint =
      applyTransform(currentPoint, transform);
  }

  // Generación real del fractal
  for (let i = 0; i < numIterations; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    currentPoint =
      applyTransform(currentPoint, transform);

    points.push({
      x: currentPoint.x,
      y: currentPoint.y
    });
  }

  return points;
};


// Genera puntos por bloques para evitar
// que el navegador se congele
export const generatePointsBatch = (
  transforms: AffineTransform[],
  initialPoint: Point,
  batchSize: number,
  skipFirst: number = 100
): {
  points: Point[];
  newInitialPoint: Point;
} => {

  const normalizedTransforms =
    normalizeProbabilities(transforms);

  const points: Point[] = [];

  let currentPoint = { ...initialPoint };

  // Calentamiento inicial
  for (let i = 0; i < skipFirst; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    currentPoint =
      applyTransform(currentPoint, transform);
  }

  // Generación del lote
  for (let i = 0; i < batchSize; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    currentPoint =
      applyTransform(currentPoint, transform);

    points.push({
      x: currentPoint.x,
      y: currentPoint.y
    });
  }

  return {
    points,
    newInitialPoint: currentPoint
  };
};


// Convierte la transformación en matriz
export const getTransformMatrix = (
  transform: AffineTransform
): number[][] => {

  return [
    [transform.a, transform.b, transform.e],
    [transform.c, transform.d, transform.f],
    [0, 0, 1]
  ];
};


// Combina dos transformaciones afines
// usando multiplicación matricial
export const composeTransforms = (
  t1: AffineTransform,
  t2: AffineTransform
): AffineTransform => {

  const a =
    t1.a * t2.a +
    t1.b * t2.c;

  const b =
    t1.a * t2.b +
    t1.b * t2.d;

  const c =
    t1.c * t2.a +
    t1.d * t2.c;

  const d =
    t1.c * t2.b +
    t1.d * t2.d;

  const e =
    t1.e * t2.a +
    t1.f * t2.c +
    t2.e;

  const f =
    t1.e * t2.b +
    t1.f * t2.d +
    t2.f;

  return {
    a,
    b,
    c,
    d,
    e,
    f,
    probability:
      (t1.probability + t2.probability) / 2
  };
};


// Busca un punto fijo de la transformación
//
// Un punto fijo cumple:
//
// f(x) = x
export const findFixedPoint = (
  transform: AffineTransform,
  tolerance: number = 1e-10,
  maxIterations: number = 100
): Point => {

  let x = 0;
  let y = 0;

  for (let i = 0; i < maxIterations; i++) {

    const newX =
      transform.a * x +
      transform.b * y +
      transform.e;

    const newY =
      transform.c * x +
      transform.d * y +
      transform.f;

    // Verifica si ya convergió
    if (
      Math.abs(newX - x) < tolerance &&
      Math.abs(newY - y) < tolerance
    ) {
      return {
        x: newX,
        y: newY
      };
    }

    x = newX;
    y = newY;
  }

  return { x, y };
};


// Estima los límites del fractal
// para centrarlo y escalarlo correctamente
export const estimateBounds = (
  transforms: AffineTransform[],
  initialPoint: Point,
  numSamples: number = 20000
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} => {

  const normalizedTransforms =
    normalizeProbabilities(transforms);

  let x = initialPoint.x;
  let y = initialPoint.y;

  // Acerca el punto al atractor
  for (let i = 0; i < 200; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    const nx =
      transform.a * x +
      transform.b * y +
      transform.e;

    const ny =
      transform.c * x +
      transform.d * y +
      transform.f;

    x = nx;
    y = ny;
  }

  let minX = x;
  let maxX = x;
  let minY = y;
  let maxY = y;

  // Recorre el fractal calculando límites
  for (let i = 0; i < numSamples; i++) {

    const transform =
      selectTransform(normalizedTransforms);

    const nx =
      transform.a * x +
      transform.b * y +
      transform.e;

    const ny =
      transform.c * x +
      transform.d * y +
      transform.f;

    x = nx;
    y = ny;

    if (nx < minX) minX = nx;
    if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny;
    if (ny > maxY) maxY = ny;
  }

  // Margen extra para que no quede pegado al borde
  const padX = (maxX - minX) * 0.1 || 0.5;
  const padY = (maxY - minY) * 0.1 || 0.5;

  return {
    minX: minX - padX,
    maxX: maxX + padX,
    minY: minY - padY,
    maxY: maxY + padY,
  };
};