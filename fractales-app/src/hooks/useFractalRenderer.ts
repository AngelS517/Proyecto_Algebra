import { useRef, useCallback, useEffect } from 'react';
import { Point } from '../types';
import { worldToCanvas, CanvasTransform } from '../utils/canvasUtils';

interface UseFractalRendererOptions {
  transform: CanvasTransform;
  color: string;
  showCurrentPoint: boolean;
}

interface UseFractalRendererReturn {
  addPoints: (newPoints: Point[]) => void;
  setCurrentPoint: (point: Point) => void;
  reset: () => void;
  setTransform: (transform: CanvasTransform) => void;
  getPointsCount: () => number;
}

export const useFractalRenderer = ({
  transform: initialTransform,
  color,
  showCurrentPoint,
}: UseFractalRendererOptions): UseFractalRendererReturn => {
  const pointsRef = useRef<Point[]>([]);
  const currentPointRef = useRef<Point>({ x: 0, y: 0 });
  const transformRef = useRef(initialTransform);
  const colorRef = useRef(color);
  const showCurrentPointRef = useRef(showCurrentPoint);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef(0);
  const lastPointsCountRef = useRef(0);
  const needsRedrawRef = useRef(true);
  
  const dprRef = useRef(1);
  const canvasWidthRef = useRef(0);
  const canvasHeightRef = useRef(0);

  useEffect(() => {
    colorRef.current = color;
    needsRedrawRef.current = true;
  }, [color]);

  useEffect(() => {
    showCurrentPointRef.current = showCurrentPoint;
    needsRedrawRef.current = true;
  }, [showCurrentPoint]);

  useEffect(() => {
    transformRef.current = initialTransform;
    needsRedrawRef.current = true;
  }, [initialTransform]);

  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 45, g: 212, b: 191 };
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const transform = transformRef.current;
    const origin = worldToCanvas({ x: 0, y: 0 }, transform);
    
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    const gridLines = Math.ceil(Math.max(width, height) / gridSize);

    ctx.beginPath();
    for (let i = -gridLines; i <= gridLines; i++) {
      const worldX = i * gridSize / transform.scale;
      const canvasX = worldToCanvas({ x: worldX, y: 0 }, transform).x;
      if (canvasX >= -10 && canvasX <= width + 10) {
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
      }
    }

    for (let i = -gridLines; i <= gridLines; i++) {
      const worldY = i * gridSize / transform.scale;
      const canvasY = worldToCanvas({ x: 0, y: worldY }, transform).y;
      if (canvasY >= -10 && canvasY <= height + 10) {
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
      }
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();
  }, []);

  const drawPoints = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const points = pointsRef.current;
    const transform = transformRef.current;
    const color = colorRef.current;
    
    if (points.length === 0) return;

    const rgb = hexToRgb(color);
    const maxPointsToDraw = Math.min(points.length, 30000);
    
    ctx.fillStyle = color;
    
    const batchSize = 500;
    let drawn = 0;
    
    for (let batchStart = 0; batchStart < maxPointsToDraw && drawn < batchSize; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, maxPointsToDraw);
      
      for (let i = batchStart; i < batchEnd; i++) {
        const canvasPoint = worldToCanvas(points[i], transform);
        
        if (canvasPoint.x >= -2 && canvasPoint.x <= width + 2 &&
            canvasPoint.y >= -2 && canvasPoint.y <= height + 2) {
          const intensity = Math.min(1, 0.4 + (i / maxPointsToDraw) * 0.6);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity})`;
          ctx.fillRect(canvasPoint.x, canvasPoint.y, 1, 1);
        }
        drawn++;
      }
    }
  }, [hexToRgb]);

  const drawCurrentPoint = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showCurrentPointRef.current) return;
    
    const points = pointsRef.current;
    if (points.length === 0) return;

    const transform = transformRef.current;
    const color = colorRef.current;
    const canvasPoint = worldToCanvas(currentPointRef.current, transform);

    if (canvasPoint.x < -10 || canvasPoint.x > width + 10 ||
        canvasPoint.y < -10 || canvasPoint.y > height + 10) return;

    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }, []);

  const drawBorderGlow = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(45, 212, 191, 0.1)');
    gradient.addColorStop(0.5, 'rgba(45, 212, 191, 0)');
    gradient.addColorStop(1, 'rgba(45, 212, 191, 0.1)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvasWidthRef.current;
    const height = canvasHeightRef.current;

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    drawGrid(ctx, width, height);
    drawPoints(ctx, width, height);
    drawCurrentPoint(ctx, width, height);
    drawBorderGlow(ctx, width, height);

    lastRenderTimeRef.current = performance.now();
  }, [drawGrid, drawPoints, drawCurrentPoint, drawBorderGlow]);

  const animationLoop = useCallback(() => {
    const currentPointsCount = pointsRef.current.length;
    
    if (currentPointsCount !== lastPointsCountRef.current || needsRedrawRef.current) {
      render();
      lastPointsCountRef.current = currentPointsCount;
      needsRedrawRef.current = false;
    }

    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [render]);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvasRef.current === canvas) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    canvasRef.current = canvas;

    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      dprRef.current = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dprRef.current;
      canvas.height = rect.height * dprRef.current;
      canvasWidthRef.current = rect.width;
      canvasHeightRef.current = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dprRef.current, dprRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [animationLoop]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const addPoints = useCallback((newPoints: Point[]) => {
    if (newPoints.length === 0) return;
    
    const currentLength = pointsRef.current.length;
    const maxStored = 60000;
    
    if (currentLength + newPoints.length > maxStored) {
      const keepStart = Math.max(0, currentLength - (maxStored - newPoints.length));
      pointsRef.current = [...pointsRef.current.slice(keepStart), ...newPoints];
    } else {
      pointsRef.current = [...pointsRef.current, ...newPoints];
    }
    
    needsRedrawRef.current = true;
  }, []);

  const setCurrentPoint = useCallback((point: Point) => {
    currentPointRef.current = point;
    needsRedrawRef.current = true;
  }, []);

  const reset = useCallback(() => {
    pointsRef.current = [];
    currentPointRef.current = { x: 0, y: 0 };
    lastPointsCountRef.current = 0;
    needsRedrawRef.current = true;
  }, []);

  const setTransform = useCallback((newTransform: CanvasTransform) => {
    transformRef.current = newTransform;
    needsRedrawRef.current = true;
  }, []);

  const getPointsCount = useCallback(() => {
    return pointsRef.current.length;
  }, []);

  return {
    addPoints,
    setCurrentPoint,
    reset,
    setTransform,
    getPointsCount,
  };
};