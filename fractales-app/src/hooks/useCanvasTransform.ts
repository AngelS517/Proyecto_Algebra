import { useRef, useCallback, useEffect } from 'react';
import { clamp } from '../utils/canvasUtils';

interface UseCanvasTransformOptions {
  initialScale?: number;
  initialOffsetX?: number;
  initialOffsetY?: number;
  onChange?: (scale: number, offX: number, offY: number) => void;
}

interface UseCanvasTransformReturn {
  zoomIn: () => void;
  zoomOut: () => void;
  zoom: (delta: number, cx: number, cy: number) => void;
  pan: (dx: number, dy: number) => void;
  resetTransform: () => void;
  setTransform: (scale: number, offX: number, offY: number) => void;
}

const MIN = 5;
const MAX = 2000;
const FACTOR = 1.25;

export const useCanvasTransform = ({
  initialScale = 100,
  initialOffsetX = 0,
  initialOffsetY = 0,
  onChange,
}: UseCanvasTransformOptions = {}): UseCanvasTransformReturn => {
  const sRef = useRef(initialScale);
  const oxRef = useRef(initialOffsetX);
  const oyRef = useRef(initialOffsetY);

  useEffect(() => {
    sRef.current = initialScale;
    oxRef.current = initialOffsetX;
    oyRef.current = initialOffsetY;
    onChange?.(initialScale, initialOffsetX, initialOffsetY);
  }, [initialScale, initialOffsetX, initialOffsetY, onChange]);

  const notify = useCallback(() => {
    onChange?.(sRef.current, oxRef.current, oyRef.current);
  }, [onChange]);

  const zoomIn = useCallback(() => {
    sRef.current = clamp(sRef.current * FACTOR, MIN, MAX);
    notify();
  }, [notify]);

  const zoomOut = useCallback(() => {
    sRef.current = clamp(sRef.current / FACTOR, MIN, MAX);
    notify();
  }, [notify]);

  const zoom = useCallback((delta: number, cx: number, cy: number) => {
    const oldS = sRef.current;
    const newS = clamp(oldS * (delta > 0 ? FACTOR : 1 / FACTOR), MIN, MAX);
    const ratio = newS / oldS;

    sRef.current = newS;
    oxRef.current = cx - (cx - oxRef.current) * ratio;
    oyRef.current = cy - (cy - oyRef.current) * ratio;
    notify();
  }, [notify]);

  const pan = useCallback((dx: number, dy: number) => {
    oxRef.current += dx;
    oyRef.current += dy;
    notify();
  }, [notify]);

  const resetTransform = useCallback(() => {
    sRef.current = initialScale;
    oxRef.current = initialOffsetX;
    oyRef.current = initialOffsetY;
    notify();
  }, [initialScale, initialOffsetX, initialOffsetY, notify]);

  const setTransform = useCallback((scale: number, offX: number, offY: number) => {
    sRef.current = scale;
    oxRef.current = offX;
    oyRef.current = offY;
    notify();
  }, [notify]);

  return { zoomIn, zoomOut, zoom, pan, resetTransform, setTransform };
};