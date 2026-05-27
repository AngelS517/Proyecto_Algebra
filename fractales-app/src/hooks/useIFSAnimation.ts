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
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const iterRef = useRef(0);
  const runningRef = useRef(false);
  const maxRef = useRef(initialMaxIterations);
  const batchRef = useRef(initialBatchSize);
  const pointRef = useRef<Point>({ ...initialPoint });
  const transformsRef = useRef(transforms);
  const initialRef = useRef(initialPoint);
  const rafRef = useRef<number | null>(null);
  const onBatchRef = useRef(onBatch);

  useEffect(() => { transformsRef.current = transforms; }, [transforms]);
  useEffect(() => { initialRef.current = initialPoint; }, [initialPoint]);
  useEffect(() => { onBatchRef.current = onBatch; }, [onBatch]);
  useEffect(() => { maxRef.current = initialMaxIterations; }, [initialMaxIterations]);
  useEffect(() => { batchRef.current = initialBatchSize; }, [initialBatchSize]);

  const loop = useCallback(() => {
    if (!runningRef.current) return;

    const remaining = maxRef.current - iterRef.current;
    if (remaining <= 0) {
      runningRef.current = false;
      setIsRunning(false);
      return;
    }

    const size = Math.min(batchRef.current, remaining);
    const result = generatePointsBatch(transformsRef.current, pointRef.current, size, 0);

    pointRef.current = result.newInitialPoint;
    iterRef.current += size;

    setIteration(iterRef.current);
    setProgress((iterRef.current / maxRef.current) * 100);

    if (result.points.length > 0) {
      onBatchRef.current?.(result.points, iterRef.current);
    }

    if (iterRef.current < maxRef.current && runningRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      runningRef.current = false;
      setIsRunning(false);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, loop]);

  const start = useCallback(() => {
    runningRef.current = true;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    iterRef.current = 0;
    pointRef.current = { ...initialRef.current };
    setIteration(0);
    setProgress(0);
    onBatchRef.current?.([], 0);
  }, []);

  return {
    iteration,
    isRunning,
    start,
    pause,
    reset,
    setBatchSize: (s) => { batchRef.current = s; },
    setMaxIterations: (m) => { maxRef.current = m; },
    progress,
  };
};