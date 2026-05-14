import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Point } from '../types';
import { worldToCanvas, CanvasTransform } from '../utils/canvasUtils';

interface FractalCanvasProps {
  points: Point[];
  currentPoint: Point;
  transform: CanvasTransform;
  color: string;
  showCurrentPoint?: boolean;
}

export const FractalCanvas = forwardRef<HTMLCanvasElement, FractalCanvasProps>(({
  points,
  currentPoint,
  transform,
  color,
  showCurrentPoint = true,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const origin = worldToCanvas({ x: 0, y: 0 }, transform);
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvas.width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvas.height);
    ctx.stroke();

    ctx.fillStyle = color;
    for (let i = 0; i < points.length; i++) {
      const canvasPoint = worldToCanvas(points[i], transform);
      ctx.fillRect(canvasPoint.x, canvasPoint.y, 1, 1);
    }

    if (showCurrentPoint && points.length > 0) {
      const canvasPoint = worldToCanvas(currentPoint, transform);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [points, currentPoint, transform, color, showCurrentPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
});