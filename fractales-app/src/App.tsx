import { useState, useCallback, useEffect, useRef } from 'react';
import { FractalCanvas } from './components/FractalCanvas';
import { Controls } from './components/Controls';
import { FractalComparator } from './components/FractalComparator';
import { useIFSAnimation } from './hooks/useIFSAnimation';
import { useCanvasTransform } from './hooks/useCanvasTransform';
import { getFractal, getFractalNames } from './data/fractals';
import { FractalConfig, Point } from './types';
import { getDefaultTransform, CanvasTransform } from './utils/canvasUtils';

const batchSizeDefault = 100;
const maxIterationsDefault = 10000;

const canvasTransformInit = (name: string) => getDefaultTransform(name, 800, 600);

export const App = () => {
  const [selectedFractal, setSelectedFractal] = useState<string>('fern');
  const [fractalConfig, setFractalConfig] = useState<FractalConfig>(() => getFractal('fern')!);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [batchSize, setBatchSize] = useState(batchSizeDefault);
  const [maxIterations, setMaxIterations] = useState(maxIterationsDefault);
  const [compareFractal, setCompareFractal] = useState('sierpinski');

  const fractalNames = getFractalNames();
  const canvasTransform = useCanvasTransform({
    initialTransform: canvasTransformInit(selectedFractal),
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    points,
    currentPoint,
    iteration,
    isRunning,
    start,
    pause,
    reset,
    setBatchSize: setHookBatchSize,
    setMaxIterations: setHookMaxIterations,
  } = useIFSAnimation({
    transforms: fractalConfig.transforms,
    initialPoint: fractalConfig.initialPoint,
    batchSize: batchSize,
    maxIterations: maxIterations,
  });

  useEffect(() => {
    reset();
    setHookBatchSize(batchSize);
    setHookMaxIterations(maxIterations);
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
      canvasTransform.setTransform(getDefaultTransform(name, 800, 600));
    }
  }, []);

  const handleFractalChange = useCallback((config: FractalConfig) => {
    setFractalConfig(config);
  }, []);

  const handleInitialPointChange = useCallback((point: Point) => {
    setFractalConfig(prev => ({ ...prev, initialPoint: point }));
  }, []);

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
        onReset={reset}
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
        onResetView={canvasTransform.resetTransform}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        points={points}
        transform={canvasTransform.transform}
        showCompare={showCompare}
        onToggleCompare={(show) => setShowCompare(show)}
      />

      <div style={canvasContainerStyle}>
        <FractalCanvas
          ref={canvasRef}
          points={points}
          currentPoint={currentPoint}
          transform={canvasTransform.transform}
          color={fractalConfig.color}
          showCurrentPoint={isRunning}
        />

        <div style={statsStyle}>
          <span>Puntos: {points.length.toLocaleString()}</span>
          <span> • </span>
          <span>Iteración: {iteration.toLocaleString()}</span>
        </div>

        {showCompare && (
          <FractalComparator
            configA={fractalConfig}
            configB={compareConfig}
            pointsCount={Math.min(points.length, 3000)}
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