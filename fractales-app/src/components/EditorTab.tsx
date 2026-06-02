import { FractalConfig } from '../types';
import { TransformEditor } from './TransformEditor';
import { getFractal } from '../data/fractals';

interface Props {
  fractal: FractalConfig;
  onFractalChange: (config: FractalConfig) => void;
}

export const EditorTab = ({ fractal, onFractalChange }: Props) => {
  const handleTransformChange = (index: number, transform: FractalConfig['transforms'][0]) => {
    console.log("Editando transformación:", index);
    const newTransforms = [...fractal.transforms];
    newTransforms[index] = transform;
    onFractalChange({ ...fractal, transforms: newTransforms });
  };

  const handleResetTransforms = () => {
    const originalFractal = getFractal('fern');

    if (originalFractal) {
      onFractalChange({
        ...fractal,
        transforms: structuredClone(originalFractal.transforms),
      });
    }
  };

  return (
    <div>
      <div style={sectionStyle}>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
          {fractal.description}
        </p>
        {/* <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
          Ecuación: [x,y] = [[a,b],[c,d]] * [x,y] + [e,f]
        </div> */}
      </div>
      {fractal.transforms.map((t, index) => (
        <TransformEditor
          key={index}
          transform={t}
          index={index}
          onChange={handleTransformChange}
        />
      ))}

      {/* <button
        onClick={handleResetTransforms}
        style={resetButtonStyle}
      >
        🔄 Restaurar transformaciones originales
      </button> */}
    </div>
  );
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const resetButtonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '12px',
  padding: '10px',
  backgroundColor: '#dc2626',
  border: 'none',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
};