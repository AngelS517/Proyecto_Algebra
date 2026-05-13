import { useState, useCallback } from 'react';
import { Point } from '../types';
import { CanvasTransform, defaultCanvasTransform, clamp } from '../utils/canvasUtils';

interface UseCanvasTransformOptions {
  initialTransform?: CanvasTransform;
}

interface UseCanvasTransformReturn {
  transform: CanvasTransform;
  zoomIn: () => void;
  zoomOut: () => void;
  pan: (dx: number, dy: number) => void;
  resetTransform: () => void;
  setTransform: (transform: CanvasTransform) => void;
}

export const useCanvasTransform = ({
  initialTransform = defaultCanvasTransform,
}: UseCanvasTransformOptions = {}): UseCanvasTransformReturn => {
  const [transform, setTransform] = useState<CanvasTransform>(initialTransform);

  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: clamp(prev.scale * 1.2, 10, 500),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: clamp(prev.scale / 1.2, 10, 500),
    }));
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    setTransform(prev => ({
      ...prev,
      offsetX: clamp(prev.offsetX + dx / prev.width, 0, 1),
      offsetY: clamp(prev.offsetY + dy / prev.height, 0, 1),
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransform(initialTransform);
  }, [initialTransform]);

  return {
    transform,
    zoomIn,
    zoomOut,
    pan,
    resetTransform,
    setTransform,
  };
};