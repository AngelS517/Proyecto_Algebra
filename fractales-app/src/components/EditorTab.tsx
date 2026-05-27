import { FractalConfig } from '../types';
import { TransformEditor } from './TransformEditor';

interface Props {
  fractal: FractalConfig;
  onFractalChange: (config: FractalConfig) => void;
}

export const EditorTab = ({ fractal, onFractalChange }: Props) => {
  const handleTransformChange = (index: number, transform: FractalConfig['transforms'][0]) => {
    const newTransforms = [...fractal.transforms];
    newTransforms[index] = transform;
    onFractalChange({ ...fractal, transforms: newTransforms });
  };

  return (
    <div>
      <div style={sectionStyle}>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
          {fractal.description}
        </p>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
          Ecuación: [x,y] = [[a,b],[c,d]] * [x,y] + [e,f]
        </div>
      </div>
      {fractal.transforms.map((t, index) => (
        <TransformEditor
          key={index}
          transform={t}
          index={index}
          onChange={handleTransformChange}
        />
      ))}
    </div>
  );
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '16px',
};
