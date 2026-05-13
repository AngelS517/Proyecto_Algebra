import { useState, useEffect, useCallback, useRef } from 'react';
import { Point, AffineTransform } from '../types';
import { generatePointsBatch } from '../utils/ifsEngine';

interface UseIFSAnimationOptions {
  transforms: AffineTransform[];
  initialPoint: Point;
  batchSize: number;
  maxIterations: number;
}

interface UseIFSAnimationReturn {
  points: Point[];
  currentPoint: Point;
  iteration: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setBatchSize: (size: number) => void;
  setMaxIterations: (max: number) => void;
}

export const useIFSAnimation = ({
  transforms,
  initialPoint,
  batchSize: initialBatchSize,
  maxIterations: initialMaxIterations,
}: UseIFSAnimationOptions): UseIFSAnimationReturn => {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentPoint, setCurrentPoint] = useState<Point>(initialPoint);
  const [iteration, setIteration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBatchSize, setCurrentBatchSize] = useState(initialBatchSize);
  const [maxIterations, setMaxIterations] = useState(initialMaxIterations);

  const transformsRef = useRef(transforms);
  const initialPointRef = useRef(initialPoint);
  const animationRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point>(initialPoint);

  useEffect(() => {
    transformsRef.current = transforms;
  }, [transforms]);

  useEffect(() => {
    initialPointRef.current = initialPoint;
  }, [initialPoint]);

  const reset = useCallback(() => {
    setPoints([]);
    setCurrentPoint(initialPointRef.current);
    setIteration(0);
    lastPointRef.current = initialPointRef.current;
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const generateBatch = useCallback(() => {
    if (iteration >= maxIterations) {
      setIsRunning(false);
      return;
    }

    const remaining = maxIterations - iteration;
    const size = Math.min(currentBatchSize, remaining);

    const result = generatePointsBatch(
      transformsRef.current,
      lastPointRef.current,
      size,
      0
    );

    lastPointRef.current = result.newInitialPoint;
    setCurrentPoint(result.newInitialPoint);

    setPoints(prev => [...prev, ...result.points]);
    setIteration(prev => prev + size);
  }, [transforms, iteration, maxIterations, currentBatchSize]);

  useEffect(() => {
    if (isRunning && iteration < maxIterations) {
      animationRef.current = requestAnimationFrame(() => {
        generateBatch();
      });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, generateBatch, iteration, maxIterations]);

  return {
    points,
    currentPoint,
    iteration,
    isRunning,
    start,
    pause,
    reset,
    setBatchSize: setCurrentBatchSize,
    setMaxIterations,
  };
};