import {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react';

import { Point } from '../types';

export interface FractalCanvasHandle {
  addPoints: (pts: Point[]) => void;
  setCurrentPoint: (p: Point) => void;
  reset: () => void;
  setScale: (s: number) => void;
  setOffset: (x: number, y: number) => void;
  initializeTransform: (s: number, x: number, y: number) => void;
  getPointsCount: () => number;
  getCanvasElement: () => HTMLCanvasElement | null;
}

interface Props {
  color: string;
  showCursor?: boolean;
  onZoom?: (delta: number, cx: number, cy: number) => void;

  bgColor?: string;
  gridColor?: string;
  gridOpacity?: number;
  gridEnabled?: boolean;

  axesColor?: string;

  glowEnabled?: boolean;
  glowIntensity?: number;

  gradientStart?: string;
  gradientEnd?: string;
}

const MAX_VISIBLE = 80000;
const MAX_STORED = 120000;

// Convierte HEX → RGB
const hexToRgb = (h: string) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);

  return r
    ? {
      r: parseInt(r[1], 16),
      g: parseInt(r[2], 16),
      b: parseInt(r[3], 16)
    }
    : { r: 45, g: 212, b: 191 };
};

// Fondo
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bgColor: string
) => {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);
};

// Cuadrícula dinámica
function drawGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: number,
  ox: number,
  oy: number,
  gridColor: string,
  gridOpacity: number
) {
  const worldW = W / s;
  const rawStep = worldW / 20;

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let nice = 10;
  if (residual < 1.5) nice = 1;
  else if (residual < 3.5) nice = 2;
  else if (residual < 7.5) nice = 5;

  const stepWorld = nice * magnitude;

  const gLeft = Math.floor((-W / 2 - ox) / stepWorld);
  const gRight = Math.ceil((W / 2 - ox) / stepWorld);

  const gTop = Math.floor((-H / 2 - oy) / stepWorld);
  const gBot = Math.ceil((H / 2 - oy) / stepWorld);

  const gc = hexToRgb(gridColor);

  ctx.strokeStyle = `rgba(${gc.r},${gc.g},${gc.b},${gridOpacity})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let i = gLeft; i <= gRight; i++) {
    const x = W / 2 + ox + i * stepWorld * s;

    if (x >= 0 && x <= W) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
  }

  for (let i = gTop; i <= gBot; i++) {
    const y = H / 2 + oy - i * stepWorld * s;

    if (y >= 0 && y <= H) {
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
  }

  ctx.stroke();
}

// Ejes cartesianos
function drawAxes(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  ox: number,
  oy: number,
  axesColor: string
) {
  const ax = W / 2 + ox;
  const ay = H / 2 + oy;

  const ac = hexToRgb(axesColor);

  ctx.strokeStyle = `rgba(${ac.r},${ac.g},${ac.b},0.25)`;
  ctx.lineWidth = 1.5;

  ctx.beginPath();

  ctx.moveTo(0, ay);
  ctx.lineTo(W, ay);

  ctx.moveTo(ax, 0);
  ctx.lineTo(ax, H);

  ctx.stroke();
}

// Render principal de puntos
function drawPoints(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: number,
  ox: number,
  oy: number,
  pts: Point[],
  total: number,
  startColor: string,
  endColor: string
) {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  const stride = Math.ceil(total / MAX_VISIBLE);

  for (let i = 0; i < total; i += stride) {
    const { x, y } = pts[i];

    const cx = W / 2 + ox + x * s;
    const cy = H / 2 + oy - y * s;

    const t = i / total;

    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);

    const alpha = 0.6 + t * 0.4;

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

    ctx.beginPath();
    ctx.arc(cx, cy, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Glow visual
function drawGlow(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: number,
  ox: number,
  oy: number,
  pts: Point[],
  total: number,
  color: string,
  glowIntensity: number
) {
  const stride = Math.ceil(total / MAX_VISIBLE);
  const drawnCount = Math.ceil(total / stride);

  const glowStart = Math.max(0, drawnCount - 500);

  const rgb = hexToRgb(color);
  const gi = glowIntensity;

  ctx.save();

  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${gi})`;
  ctx.shadowBlur = 4;

  let drawIdx = 0;

  for (let i = 0; i < total; i += stride) {
    if (drawIdx >= glowStart) {
      const { x, y } = pts[i];

      const cx = W / 2 + ox + x * s;
      const cy = H / 2 + oy - y * s;

      const hueShift = (drawIdx / drawnCount) * 80;

      ctx.fillStyle = `hsla(${180 + hueShift}, 100%, 70%, ${Math.min(1, gi + 0.2)})`;

      const glowRadius = Math.max(0.6, 3 - s * 0.004);

      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    drawIdx++;
  }

  ctx.restore();
}

// Cursor actual
function drawCursor(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: number,
  ox: number,
  oy: number,
  cursorPt: Point,
  color: string
) {
  const cx = W / 2 + ox + cursorPt.x * s;
  const cy = H / 2 + oy - cursorPt.y * s;

  ctx.save();

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export const FractalCanvas = forwardRef<FractalCanvasHandle, Props>(
  (
    {
      color,
      gradientStart = '#2dd4bf',
      gradientEnd = '#8b5cf6',
      showCursor = true,
      onZoom,

      bgColor = '#0a0e1a',
      gridColor = '#1e293b',
      gridOpacity = 0.25,
      gridEnabled = true,

      axesColor = '#2dd4bf',

      glowEnabled = true,
      glowIntensity = 0.4
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const ptsRef = useRef<Point[]>([]);
    const cursorRef = useRef<Point>({ x: 0, y: 0 });

    const colorRef = useRef(color);

    const gradientStartRef = useRef(gradientStart);
    const gradientEndRef = useRef(gradientEnd);

    const bgRef = useRef(bgColor);

    const gridColorRef = useRef(gridColor);
    const gridOpacityRef = useRef(gridOpacity);
    const gridEnabledRef = useRef(gridEnabled);

    const axesColorRef = useRef(axesColor);

    const glowEnabledRef = useRef(glowEnabled);
    const glowIntensityRef = useRef(glowIntensity);

    const showRef = useRef(showCursor);

    const dirtyRef = useRef(true);
    const dprRef = useRef(1);
    const frameRef = useRef(0);

    // Transformaciones visuales
    const scaleRef = useRef(50);

    const offXRef = useRef(0);
    const offYRef = useRef(0);

    // Movimiento del plano
    const isDraggingRef = useRef(false);

    useEffect(() => {
      colorRef.current = color;
      dirtyRef.current = true;
    }, [color]);

    useEffect(() => {
      gradientStartRef.current = gradientStart;
      dirtyRef.current = true;
    }, [gradientStart]);

    useEffect(() => {
      gradientEndRef.current = gradientEnd;
      dirtyRef.current = true;
    }, [gradientEnd]);

    useEffect(() => {
      bgRef.current = bgColor;
      dirtyRef.current = true;
    }, [bgColor]);

    useEffect(() => {
      gridColorRef.current = gridColor;
      dirtyRef.current = true;
    }, [gridColor]);

    useEffect(() => {
      gridOpacityRef.current = gridOpacity;
      dirtyRef.current = true;
    }, [gridOpacity]);

    useEffect(() => {
      gridEnabledRef.current = gridEnabled;
      dirtyRef.current = true;
    }, [gridEnabled]);

    useEffect(() => {
      axesColorRef.current = axesColor;
      dirtyRef.current = true;
    }, [axesColor]);

    useEffect(() => {
      glowEnabledRef.current = glowEnabled;
      dirtyRef.current = true;
    }, [glowEnabled]);

    useEffect(() => {
      glowIntensityRef.current = glowIntensity;
      dirtyRef.current = true;
    }, [glowIntensity]);

    useEffect(() => {
      showRef.current = showCursor;
    }, [showCursor]);

    // Render principal
    const draw = useCallback(() => {
      const cvs = canvasRef.current;
      if (!cvs) return;

      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      const dpr = dprRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;

      const W = cvs.width / dpr;
      const H = cvs.height / dpr;

      const s = scaleRef.current;

      const ox = offXRef.current;
      const oy = offYRef.current;

      drawBackground(ctx, W, H, bgRef.current);

      if (gridEnabledRef.current) {
        drawGrid(
          ctx,
          W,
          H,
          s,
          ox,
          oy,
          gridColorRef.current,
          gridOpacityRef.current
        );
      }

      drawAxes(ctx, W, H, ox, oy, axesColorRef.current);

      const pts = ptsRef.current;
      const total = pts.length;

      if (total === 0) return;

      drawPoints(
        ctx,
        W,
        H,
        s,
        ox,
        oy,
        pts,
        total,
        gradientStartRef.current,
        gradientEndRef.current
      );

      if (glowEnabledRef.current) {
        drawGlow(
          ctx,
          W,
          H,
          s,
          ox,
          oy,
          pts,
          total,
          colorRef.current,
          glowIntensityRef.current
        );
      }

      if (showRef.current) {
        drawCursor(
          ctx,
          W,
          H,
          s,
          ox,
          oy,
          cursorRef.current,
          colorRef.current
        );
      }
    }, []);

    // Loop visual optimizado
    const renderLoop = useCallback(() => {
      if (dirtyRef.current) {
        draw();
        dirtyRef.current = false;
      }

      frameRef.current = requestAnimationFrame(renderLoop);
    }, [draw]);

    // Resize automático
    useEffect(() => {
      const cvs = canvasRef.current;
      if (!cvs) return;

      const resize = () => {
        const rect = cvs.getBoundingClientRect();

        dprRef.current = window.devicePixelRatio || 1;

        cvs.width = rect.width * dprRef.current;
        cvs.height = rect.height * dprRef.current;

        dirtyRef.current = true;
      };

      resize();

      window.addEventListener('resize', resize);

      frameRef.current = requestAnimationFrame(renderLoop);

      return () => {
        window.removeEventListener('resize', resize);

        cancelAnimationFrame(frameRef.current);
      };
    }, [renderLoop]);

    // Zoom con rueda
    const wheel = useCallback(
      (e: React.WheelEvent) => {
        if (!onZoom) return;

        e.preventDefault();

        const rect = canvasRef.current?.getBoundingClientRect();

        if (rect) {
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;

          onZoom(e.deltaY > 0 ? -1 : 1, cx, cy);
        }
      },
      [onZoom]
    );

    // Inicia movimiento del plano
    const mouseDown = useCallback(() => {
      isDraggingRef.current = true;
    }, []);

    // Movimiento de cámara
    const mouseMove = useCallback((e: React.MouseEvent) => {
      if (!isDraggingRef.current) return;

      const sensitivity = 1.5;

      offXRef.current += e.movementX * sensitivity;
      offYRef.current += e.movementY * sensitivity;

      dirtyRef.current = true;
    }, []);

    // Finaliza movimiento
    const mouseUp = useCallback(() => {
      isDraggingRef.current = false;
    }, []);

    useImperativeHandle(ref, () => ({
      addPoints(pts: Point[]) {
        if (pts.length === 0) return;

        const cur = ptsRef.current;

        cur.push(...pts);

        if (cur.length > MAX_STORED) {
          cur.splice(0, cur.length - MAX_STORED);
        }

        dirtyRef.current = true;
      },

      setCurrentPoint(p: Point) {
        cursorRef.current = p;
        dirtyRef.current = true;
      },

      reset() {
        ptsRef.current = [];
        cursorRef.current = { x: 0, y: 0 };

        dirtyRef.current = true;
      },

      setScale(s: number) {
        scaleRef.current = s;
        dirtyRef.current = true;
      },

      setOffset(x: number, y: number) {
        offXRef.current = x;
        offYRef.current = y;

        dirtyRef.current = true;
      },

      initializeTransform(s: number, x: number, y: number) {
        scaleRef.current = s;

        offXRef.current = x;
        offYRef.current = y;

        dirtyRef.current = true;
      },

      getPointsCount: () => ptsRef.current.length,

      getCanvasElement: () => canvasRef.current
    }));

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',

          cursor: isDraggingRef.current ? 'grabbing' : 'grab'
        }}
        onWheel={wheel}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onMouseLeave={mouseUp}
      />
    );
  }
);

FractalCanvas.displayName = 'FractalCanvas';