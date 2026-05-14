import { useState, useEffect, useRef, useMemo } from 'react';
import { FractalConfig, Point } from '../types';
import { worldToCanvas, CanvasTransform } from '../utils/canvasUtils';
import { generatePointsBatch } from '../utils/ifsEngine';
import { getFractal, fractals } from '../data/fractals';

interface FractalComparatorProps {
  configA: FractalConfig;
  configB: FractalConfig;
  pointsCount: number;
  onClose?: () => void;
}

export const FractalComparator = ({ configA, configB, pointsCount, onClose }: FractalComparatorProps) => {
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  
  const [pointsA, setPointsA] = useState<Point[]>([]);
  const [pointsB, setPointsB] = useState<Point[]>([]);
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 50,
    offsetX: 0.5,
    offsetY: 0.5,
    width: 350,
    height: 250,
  });

  const fractalKeys = Object.keys(fractals);
  
  const [selectAKey, setSelectAKey] = useState<string>(() => {
    const found = fractalKeys.find(k => getFractal(k)?.name === configA.name);
    return found || fractalKeys[0];
  });
  
  const [selectBKey, setSelectBKey] = useState<string>(() => {
    const found = fractalKeys.find(k => getFractal(k)?.name === configB.name);
    return found || fractalKeys[1];
  });

  const fractalA = useMemo(() => getFractal(selectAKey) || configA, [selectAKey, configA]);
  const fractalB = useMemo(() => getFractal(selectBKey) || configB, [selectBKey, configB]);

  useEffect(() => {
    const newPointsA = generatePointsBatch(fractalA.transforms, fractalA.initialPoint, pointsCount, 0).points;
    const newPointsB = generatePointsBatch(fractalB.transforms, fractalB.initialPoint, pointsCount, 0).points;
    setPointsA(newPointsA);
    setPointsB(newPointsB);
  }, [fractalA, fractalB, pointsCount]);

  useEffect(() => {
    if (!canvasARef.current || pointsA.length === 0) return;
    const ctx = canvasARef.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 350, 250);

    const origin = worldToCanvas({ x: 0, y: 0 }, transform);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(350, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, 250);
    ctx.stroke();

    ctx.fillStyle = fractalA.color;
    for (const point of pointsA) {
      const cp = worldToCanvas(point, transform);
      if (cp.x >= 0 && cp.x <= 350 && cp.y >= 0 && cp.y <= 250) {
        ctx.fillRect(cp.x, cp.y, 1, 1);
      }
    }
  }, [pointsA, fractalA.color, transform]);

  useEffect(() => {
    if (!canvasBRef.current || pointsB.length === 0) return;
    const ctx = canvasBRef.current.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 350, 250);

    const origin = worldToCanvas({ x: 0, y: 0 }, transform);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(350, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, 250);
    ctx.stroke();

    ctx.fillStyle = fractalB.color;
    for (const point of pointsB) {
      const cp = worldToCanvas(point, transform);
      if (cp.x >= 0 && cp.x <= 350 && cp.y >= 0 && cp.y <= 250) {
        ctx.fillRect(cp.x, cp.y, 1, 1);
      }
    }
  }, [pointsB, fractalB.color, transform]);

  const handleZoom = (factor: number) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(10, Math.min(500, prev.scale * factor)),
    }));
  };

  const getName = (key: string) => getFractal(key)?.name || key;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>🆚 Comparador de Fractales</h2>
          <button onClick={onClose} style={closeButtonStyle}>✕ Cerrar</button>
        </div>

        <div style={controlsRowStyle}>
          <div style={controlGroupStyle}>
            <label style={controlLabelStyle}>Fractal A</label>
            <select
              value={selectAKey}
              onChange={(e) => setSelectAKey(e.target.value)}
              style={selectStyle}
            >
              {fractalKeys.map(key => (
                <option key={key} value={key}>
                  {getName(key)}
                </option>
              ))}
            </select>
          </div>

          <div style={zoomGroupStyle}>
            <button onClick={() => handleZoom(1.3)} style={zoomButtonStyle}>+</button>
            <button onClick={() => handleZoom(0.7)} style={zoomButtonStyle}>-</button>
            <button onClick={() => setTransform({ scale: 50, offsetX: 0.5, offsetY: 0.5, width: 350, height: 250 })} style={zoomButtonStyle}>⟲</button>
          </div>

          <div style={controlGroupStyle}>
            <label style={controlLabelStyle}>Fractal B</label>
            <select
              value={selectBKey}
              onChange={(e) => setSelectBKey(e.target.value)}
              style={selectStyle}
            >
              {fractalKeys.map(key => (
                <option key={key} value={key}>
                  {getName(key)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={canvasesRowStyle}>
          <div style={canvasContainerStyle}>
            <div style={canvasLabelStyle}>A</div>
            <canvas
              ref={canvasARef}
              width={350}
              height={250}
              style={canvasStyle}
            />
            <div style={canvasNameStyle}>{fractalA.name}</div>
          </div>

          <div style={vsContainerStyle}>
            <span style={vsTextStyle}>VS</span>
          </div>

          <div style={canvasContainerStyle}>
            <div style={canvasLabelStyle}>B</div>
            <canvas
              ref={canvasBRef}
              width={350}
              height={250}
              style={canvasStyle}
            />
            <div style={canvasNameStyle}>{fractalB.name}</div>
          </div>
        </div>

        <div style={statsBarStyle}>
          <span style={statTextStyle}>
            📊 Puntos: {pointsCount.toLocaleString()} | 
            🔍 Zoom: {transform.scale.toFixed(0)}x | 
            📐 A: {fractalA.transforms.length}T | B: {fractalB.transforms.length}T
          </span>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #334155',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  maxWidth: '900px',
  width: '95%',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#e2e8f0',
  margin: 0,
};

const closeButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#7f1d1d',
  border: 'none',
  borderRadius: '6px',
  color: '#fecaca',
  fontSize: '13px',
  cursor: 'pointer',
  fontWeight: '500',
};

const controlsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '16px',
  marginBottom: '20px',
};

const controlGroupStyle: React.CSSProperties = {
  flex: 1,
};

const controlLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
  fontWeight: '500',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '14px',
  cursor: 'pointer',
};

const zoomGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
};

const zoomButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '16px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const canvasesRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px',
};

const canvasContainerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const canvasLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2dd4bf',
  textAlign: 'center',
};

const canvasStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  border: '2px solid #334155',
};

const canvasNameStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center',
};

const vsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 8px',
};

const vsTextStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#f472b6',
  textShadow: '0 0 10px rgba(244, 114, 182, 0.5)',
};

const statsBarStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '12px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
};

const statTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#94a3b8',
};