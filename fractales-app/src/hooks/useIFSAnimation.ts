import { useState, useEffect, useCallback, useRef } from 'react';
import { Point, AffineTransform } from '../types';
import { generatePointsBatch } from '../utils/ifsEngine';

interface UseIFSAnimationOptions {
  transforms: AffineTransform[];
  initialPoint: Point;
  batchSize: number;
  maxIterations: number;
  onBatch?: (newPoints: Point[], totalIteration: number) => void;
}

interface UseIFSAnimationReturn {
  iteration: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setBatchSize: (size: number) => void;
  setMaxIterations: (max: number) => void;
  progress: number;
}

export const useIFSAnimation = ({
  transforms,
  initialPoint,
  batchSize: initialBatchSize,
  maxIterations: initialMaxIterations,
  onBatch,
}: UseIFSAnimationOptions): UseIFSAnimationReturn => {

  // Estado visual de la animación
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Referencias internas para evitar renders innecesarios
  const iterRef = useRef(0);
  const runningRef = useRef(false);

  // Configuración dinámica
  const maxRef = useRef(initialMaxIterations);
  const batchRef = useRef(initialBatchSize);

  // Punto actual del fractal
  const pointRef = useRef<Point>({ ...initialPoint });

  // Guarda el punto inicial original
  // para poder reiniciar correctamente
  const originalPointRef = useRef<Point>({ ...initialPoint });

  // Referencias auxiliares
  const transformsRef = useRef(transforms);
  const initialRef = useRef(initialPoint);
  const rafRef = useRef<number | null>(null);
  const onBatchRef = useRef(onBatch);

  // Actualiza transformaciones
  useEffect(() => {
    transformsRef.current = transforms;
  }, [transforms]);

  // Actualiza punto inicial dinámicamente
  // cuando el usuario cambia X o Y
  useEffect(() => {

    initialRef.current = initialPoint;

    // Reinicia el punto actual
    // desde el nuevo origen
    pointRef.current = {
      ...initialPoint
    };

    // También actualiza el origen original
    originalPointRef.current = {
      ...initialPoint
    };

  }, [initialPoint]);

  // Actualiza callback
  useEffect(() => {
    onBatchRef.current = onBatch;
  }, [onBatch]);

  // Actualiza máximo de iteraciones
  useEffect(() => {
    maxRef.current = initialMaxIterations;
  }, [initialMaxIterations]);

  // Actualiza tamaño de lote
  useEffect(() => {
    batchRef.current = initialBatchSize;
  }, [initialBatchSize]);

  // Bucle principal de animación
  const loop = useCallback(() => {

    if (!runningRef.current) return;

    const remaining =
      maxRef.current - iterRef.current;

    // Finaliza animación
    if (remaining <= 0) {

      runningRef.current = false;
      setIsRunning(false);

      return;
    }

    // Evita generar más puntos
    // de los necesarios
    const size = Math.min(
      batchRef.current,
      remaining
    );

    // Genera nuevo bloque de puntos
    const result = generatePointsBatch(
      transformsRef.current,
      pointRef.current,
      size,
      0 // Importante para visualizar crecimiento desde el origen
    );

    // Actualiza punto actual
    pointRef.current = result.newInitialPoint;

    // Actualiza iteraciones
    iterRef.current += size;

    // Actualiza estados visuales
    setIteration(iterRef.current);

    setProgress(
      (iterRef.current / maxRef.current) * 100
    );

    // Envía nuevos puntos al canvas
    if (result.points.length > 0) {

      onBatchRef.current?.(
        result.points,
        iterRef.current
      );
    }

    // Continúa animación
    if (
      iterRef.current < maxRef.current &&
      runningRef.current
    ) {

      rafRef.current =
        requestAnimationFrame(loop);

    } else {

      runningRef.current = false;
      setIsRunning(false);
    }

  }, []);

  // Controla el ciclo de animación
  useEffect(() => {

    if (isRunning) {
      rafRef.current =
        requestAnimationFrame(loop);
    }

    return () => {

      if (rafRef.current !== null) {

        cancelAnimationFrame(rafRef.current);

        rafRef.current = null;
      }
    };

  }, [isRunning, loop]);

  // Inicia animación
  const start = useCallback(() => {

    runningRef.current = true;

    setIsRunning(true);

  }, []);

  // Pausa animación
  const pause = useCallback(() => {

    runningRef.current = false;

    setIsRunning(false);

    if (rafRef.current !== null) {

      cancelAnimationFrame(rafRef.current);

      rafRef.current = null;
    }

  }, []);

  // Reinicia completamente el sistema
  const reset = useCallback(() => {

    runningRef.current = false;

    setIsRunning(false);

    if (rafRef.current !== null) {

      cancelAnimationFrame(rafRef.current);

      rafRef.current = null;
    }

    // Reinicia iteraciones
    iterRef.current = 0;

    // Vuelve al punto inicial original
    pointRef.current = {
      ...originalPointRef.current
    };

    // Reinicia interfaz
    setIteration(0);

    setProgress(0);

    // Limpia canvas
    onBatchRef.current?.([], 0);

  }, []);

  return {
    iteration,
    isRunning,
    start,
    pause,
    reset,

    // Permite cambiar batch dinámicamente
    setBatchSize: (s) => {
      batchRef.current = s;
    },

    // Permite cambiar iteraciones máximas
    setMaxIterations: (m) => {
      maxRef.current = m;
    },

    progress,
  };
};