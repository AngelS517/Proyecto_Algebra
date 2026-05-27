import { useState } from 'react';
import { FractalConfig } from '../types';

interface Props {
  fractal: FractalConfig;
  fractalNames: string[];
  showCompare: boolean;
  onToggleCompare: (show: boolean) => void;
}

export const CompareTab = ({ fractal, fractalNames, showCompare, onToggleCompare }: Props) => {
  const [compareFractal, setCompareFractal] = useState('sierpinski');

  return (
    <div>
      <div style={compareInfoStyle}>
        <p style={infoTextStyle}>
          Selecciona un fractal para comparar con el actual.
        </p>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Fractal actual</label>
        <div style={currentFractalStyle}>{fractal.name}</div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Comparar con</label>
        <select
          value={compareFractal}
          onChange={(e) => setCompareFractal(e.target.value)}
          style={selectStyle}
        >
          {fractalNames.map(name => (
            <option key={name} value={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onToggleCompare(!showCompare)}
        style={{
          ...fullButtonStyle,
          backgroundColor: showCompare ? '#f472b6' : '#2dd4bf',
          color: showCompare ? '#fff' : '#0f172a',
        }}
      >
        {showCompare ? '🔴 Salir del modo comparador' : '🟢 Activar modo comparador'}
      </button>
    </div>
  );
};

const compareInfoStyle: React.CSSProperties = { marginBottom: '12px' };
const infoTextStyle: React.CSSProperties = { fontSize: '12px', color: '#64748b', lineHeight: '1.5' };
const sectionStyle: React.CSSProperties = { marginBottom: '16px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' };
const currentFractalStyle: React.CSSProperties = { padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px', color: '#e2e8f0', fontSize: '14px' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '14px', cursor: 'pointer' };
const fullButtonStyle: React.CSSProperties = { width: '100%', padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', textAlign: 'center' };
