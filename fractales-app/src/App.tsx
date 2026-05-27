import { useState, useCallback, useEffect, useRef } from 'react';
import { FractalCanvas, FractalCanvasHandle } from './components/FractalCanvas';
import { Controls } from './components/Controls';
import { FractalComparator } from './components/FractalComparator';
import { useIFSAnimation } from './hooks/useIFSAnimation';
import { useCanvasTransform } from './hooks/useCanvasTransform';
import { useVisualTheme } from './hooks/useVisualTheme';
import { getFractal, getFractalNames } from './data/fractals';
import { FractalConfig, Point } from './types';
import { estimateBounds } from './utils/ifsEngine';

const batchSizeDefault = 100;
const maxIterationsDefault = 10000;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const computeAutoTransform = (
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  canvasW: number,
  canvasH: number,
  targetCoverage: number = 0.75,
  padding: number = 1.1
): { scale: number; offX: number; offY: number } => {
  const scaleX = (canvasW * targetCoverage) / ((bounds.maxX - bounds.minX) * padding);
  const scaleY = (canvasH * targetCoverage) / ((bounds.maxY - bounds.minY) * padding);
  const s = clamp(Math.min(scaleX, scaleY), 5, 2000);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { scale: s, offX: -cx * s, offY: cy * s };
};

export const App = () => {
  const [selectedFractal, setSelectedFractal] = useState<string>('fern');
  const [fractalConfig, setFractalConfig] = useState<FractalConfig>(() => getFractal('fern')!);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [batchSize, setBatchSize] = useState(batchSizeDefault);
  const [maxIterations, setMaxIterations] = useState(maxIterationsDefault);
  const [compareFractal, setCompareFractal] = useState('sierpinski');

  const fractalNames = getFractalNames();
  const canvasRef = useRef<FractalCanvasHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const { theme, updateTheme, resetTheme } = useVisualTheme();

  const syncCanvas = useCallback((s: number, x: number, y: number) => {
    canvasRef.current?.initializeTransform(s, x, y);
  }, []);

  const canvasTransform = useCanvasTransform({
    onChange: syncCanvas,
  });

  const {
    iteration,
    isRunning,
    start,
    pause,
    reset: animReset,
    setBatchSize: setHookBatchSize,
    setMaxIterations: setHookMaxIterations,
  } = useIFSAnimation({
    transforms: fractalConfig.transforms,
    initialPoint: fractalConfig.initialPoint,
    batchSize,
    maxIterations,
    onBatch: (newPoints) => {
      if (newPoints.length > 0) {
        canvasRef.current?.addPoints(newPoints);
        canvasRef.current?.setCurrentPoint(newPoints[newPoints.length - 1]);
      }
    },
  });

  useEffect(() => {
    const el = canvasRef.current?.getCanvasElement() ?? null;
    setCanvasElement(el);
  }, []);

  useEffect(() => {
    canvasRef.current?.reset();
    animReset();
    setHookBatchSize(batchSize);
    setHookMaxIterations(maxIterations);

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const bounds = estimateBounds(fractalConfig.transforms, fractalConfig.initialPoint);
      const { scale, offX, offY } = computeAutoTransform(bounds, rect.width, rect.height);
      canvasTransform.setTransform(scale, offX, offY);
    }
  }, [fractalConfig]);

  useEffect(() => {
    setHookBatchSize(batchSize);
  }, [batchSize]);

  useEffect(() => {
    setHookMaxIterations(maxIterations);
  }, [maxIterations]);

  const handleSelectFractal = useCallback((name: string) => {
    const fractal = getFractal(name);
    if (fractal) {
      setSelectedFractal(name);
      setFractalConfig(fractal);
    }
  }, []);

  const handleFractalChange = useCallback((config: FractalConfig) => {
    setFractalConfig(config);
  }, []);

  const handleInitialPointChange = useCallback((point: Point) => {
    setFractalConfig(prev => ({ ...prev, initialPoint: point }));
  }, []);

  const handleReset = useCallback(() => {
    canvasRef.current?.reset();
    animReset();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const bounds = estimateBounds(fractalConfig.transforms, fractalConfig.initialPoint);
      const { scale, offX, offY } = computeAutoTransform(bounds, rect.width, rect.height);
      canvasTransform.setTransform(scale, offX, offY);
    }
  }, [animReset, canvasTransform, fractalConfig]);

  const handleResetView = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const bounds = estimateBounds(fractalConfig.transforms, fractalConfig.initialPoint);
      const { scale, offX, offY } = computeAutoTransform(bounds, rect.width, rect.height);
      canvasTransform.setTransform(scale, offX, offY);
    }
  }, [canvasTransform, fractalConfig]);

  const compareConfig = getFractal(compareFractal) || getFractal('sierpinski')!;

  const handleToggleCompare = useCallback((show: boolean) => {
    setShowCompare(show);
  }, []);

  return (
    <div style={appStyle}>
      <Controls
        fractal={fractalConfig}
        onFractalChange={handleFractalChange}
        initialPoint={fractalConfig.initialPoint}
        onInitialPointChange={handleInitialPointChange}
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={handleReset}
        iteration={iteration}
        maxIterations={maxIterations}
        onMaxIterationsChange={setMaxIterations}
        batchSize={batchSize}
        onBatchSizeChange={setBatchSize}
        fractalNames={fractalNames}
        currentFractalName={selectedFractal}
        onSelectFractal={handleSelectFractal}
        onZoomIn={canvasTransform.zoomIn}
        onZoomOut={canvasTransform.zoomOut}
        onResetView={handleResetView}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        showCompare={showCompare}
        onToggleCompare={handleToggleCompare}
        visualTheme={theme}
        onVisualThemeChange={updateTheme}
        onVisualThemeReset={resetTheme}
        canvasElement={canvasElement}
      />

      <div ref={containerRef} style={canvasContainerStyle}>
        <FractalCanvas
          ref={canvasRef}
          color={fractalConfig.color}
          showCursor={isRunning}
          onZoom={(delta, cx, cy) => canvasTransform.zoom(delta, cx, cy)}
          bgColor={theme.bgColor}
          gridColor={theme.gridColor}
          gridOpacity={theme.gridOpacity}
          gridEnabled={theme.gridEnabled}
          axesColor={theme.axesColor}
          glowEnabled={theme.glowEnabled}
          glowIntensity={theme.glowIntensity}
        />

        <div style={statsStyle}>
          <span>Iteración: {iteration.toLocaleString()}</span>
        </div>

        {showCompare && (
          <FractalComparator
            configA={fractalConfig}
            configB={compareConfig}
            pointsCount={Math.min(iteration, 3000)}
            onClose={() => setShowCompare(false)}
          />
        )}
      </div>
    </div>
  );
};

const appStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  backgroundColor: '#0f172a',
  color: '#e2e8f0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const canvasContainerStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
};

const statsStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '16px',
  right: '16px',
  padding: '8px 12px',
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#94a3b8',
  fontFamily: 'monospace',
};

export default App;