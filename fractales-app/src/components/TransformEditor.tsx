import { FractalConfig, Point } from '../types';

interface TransformEditorProps {
  transform: FractalConfig['transforms'][0];
  index: number;
  onChange: (index: number, transform: FractalConfig['transforms'][0]) => void;
}

export const TransformEditor = ({ transform, index, onChange }: TransformEditorProps) => {
  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange(index, { ...transform, [field]: numValue });
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px',
    }}>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
        Transformación {index + 1}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>a</span>
          <input
            type="number"
            step="0.01"
            value={transform.a}
            onChange={(e) => handleChange('a', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>b</span>
          <input
            type="number"
            step="0.01"
            value={transform.b}
            onChange={(e) => handleChange('b', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>c</span>
          <input
            type="number"
            step="0.01"
            value={transform.c}
            onChange={(e) => handleChange('c', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>d</span>
          <input
            type="number"
            step="0.01"
            value={transform.d}
            onChange={(e) => handleChange('d', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>e (tx)</span>
          <input
            type="number"
            step="0.01"
            value={transform.e}
            onChange={(e) => handleChange('e', e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          <span style={{ fontSize: '11px', color: '#64748b' }}>f (ty)</span>
          <input
            type="number"
            step="0.01"
            value={transform.f}
            onChange={(e) => handleChange('f', e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>
      <label style={{ marginTop: '8px', display: 'block' }}>
        <span style={{ fontSize: '11px', color: '#64748b' }}>Probabilidad</span>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={transform.probability}
          onChange={(e) => handleChange('probability', e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
        />
      </label>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontSize: '12px',
  fontFamily: 'monospace',
};