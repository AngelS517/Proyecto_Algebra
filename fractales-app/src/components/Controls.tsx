import { FractalConfig, Point } from '../types';
import { TransformEditor } from './TransformEditor';

interface ControlsProps {
  fractal: FractalConfig;
  onFractalChange: (fractal: FractalConfig) => void;
  initialPoint: Point;
  onInitialPointChange: (point: Point) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  iteration: number;
  maxIterations: number;
  onMaxIterationsChange: (max: number) => void;
  batchSize: number;
  onBatchSizeChange: (size: number) => void;
  fractalNames: string[];
  currentFractalName: string;
  onSelectFractal: (name: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const Controls = ({
  fractal,
  onFractalChange,
  initialPoint,
  onInitialPointChange,
  isRunning,
  onStart,
  onPause,
  onReset,
  iteration,
  maxIterations,
  onMaxIterationsChange,
  batchSize,
  onBatchSizeChange,
  fractalNames,
  currentFractalName,
  onSelectFractal,
  onZoomIn,
  onZoomOut,
  onResetView,
  showAdvanced,
  onToggleAdvanced,
}: ControlsProps) => {
  const handleTransformChange = (index: number, transform: FractalConfig['transforms'][0]) => {
    const newTransforms = [...fractal.transforms];
    newTransforms[index] = transform;
    onFractalChange({ ...fractal, transforms: newTransforms });
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Generador de Fractales IFS</h2>

      <div style={sectionStyle}>
        <label style={labelStyle}>Fractal</label>
        <select
          value={currentFractalName}
          onChange={(e) => onSelectFractal(e.target.value)}
          style={selectStyle}
        >
          {fractalNames.map((fname) => (
            <option key={fname} value={fname}>
              {fname.charAt(0).toUpperCase() + fname.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Punto inicial</label>
        <div style={rowStyle}>
          <input
            type="number"
            step="0.1"
            value={initialPoint.x}
            onChange={(e) => onInitialPointChange({ ...initialPoint, x: parseFloat(e.target.value) || 0 })}
            style={inputStyle}
            placeholder="X"
          />
          <input
            type="number"
            step="0.1"
            value={initialPoint.y}
            onChange={(e) => onInitialPointChange({ ...initialPoint, y: parseFloat(e.target.value) || 0 })}
            style={inputStyle}
            placeholder="Y"
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Iteraciones: {iteration} / {maxIterations}</label>
        <input
          type="range"
          min="100"
          max="50000"
          step="100"
          value={maxIterations}
          onChange={(e) => onMaxIterationsChange(parseInt(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Velocidad (puntos/frame)</label>
        <input
          type="range"
          min="1"
          max="500"
          step="1"
          value={batchSize}
          onChange={(e) => onBatchSizeChange(parseInt(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={buttonGroupStyle}>
        {!isRunning ? (
          <button onClick={onStart} style={primaryButtonStyle}>
            Iniciar
          </button>
        ) : (
          <button onClick={onPause} style={secondaryButtonStyle}>
            Pausar
          </button>
        )}
        <button onClick={onReset} style={secondaryButtonStyle}>
          Reiniciar
        </button>
      </div>

      <div style={buttonGroupStyle}>
        <button onClick={onZoomIn} style={iconButtonStyle}>
          +
        </button>
        <button onClick={onZoomOut} style={iconButtonStyle}>
          -
        </button>
        <button onClick={onResetView} style={iconButtonStyle}>
          ⟲
        </button>
      </div>

      <button onClick={onToggleAdvanced} style={toggleButtonStyle}>
        {showAdvanced ? '▼' : '▶'} Opciones avanzadas
      </button>

      {showAdvanced && (
        <div style={advancedStyle}>
          <div style={sectionStyle}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
              {fractal.description}
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
              Ecuación: [x,y] = [[a,b],[c,d]] * [x,y] + [e,f]
            </div>
          </div>

          {fractal.transforms.map((transform, index) => (
            <TransformEditor
              key={index}
              transform={transform}
              index={index}
              onChange={handleTransformChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '280px',
  minWidth: '280px',
  backgroundColor: '#0f172a',
  padding: '16px',
  overflowY: 'auto',
  maxHeight: '100vh',
  borderRight: '1px solid #1e293b',
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#e2e8f0',
  marginBottom: '20px',
  fontFamily: 'system-ui, sans-serif',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  color: '#94a3b8',
  marginBottom: '6px',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '14px',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '14px',
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  accentColor: '#2dd4bf',
};

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
};

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 16px',
  backgroundColor: '#2dd4bf',
  border: 'none',
  borderRadius: '6px',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 16px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '14px',
  cursor: 'pointer',
};

const iconButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '18px',
  cursor: 'pointer',
};

const toggleButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'transparent',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#94a3b8',
  fontSize: '12px',
  cursor: 'pointer',
  textAlign: 'left',
};

const advancedStyle: React.CSSProperties = {
  marginTop: '12px',
};