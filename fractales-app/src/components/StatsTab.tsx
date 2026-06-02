import { FractalConfig, Point } from '../types';

interface Props {
  iteration: number;
  points?: Point[];
  fractal: FractalConfig;
}

export const StatsTab = ({ iteration, points, fractal }: Props) => {
  return (
    <div>
      <span style={statLabelStyle}>Estadisticas del fractal</span>
      <div style={statsGridStyle}>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Iteraciones</span>
          <span style={statValueStyle}>{iteration.toLocaleString()}</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Puntos dibujados</span>
          <span style={statValueStyle}>{(points?.length || iteration).toLocaleString()}</span>
        </div>
        <div style={statItemStyle}>
          <span style={statLabelStyle}>Transformaciones</span>
          <span style={statValueStyle}>{fractal.transforms.length}</span>
        </div>
      </div>

      <div style={usageSectionStyle}>
        <h4 style={chartTitleStyle}>Uso de transformaciones</h4>
        {fractal.transforms.map((t, i) => (
          <div key={i} style={usageBarContainerStyle}>
            <span style={usageLabelStyle}>T{i + 1}</span>
            <div style={usageBarStyle}>
              <div style={{ ...usageBarFillStyle, width: `${(t.probability * 100).toFixed(1)}%` }} />
            </div>
            <span style={usageValueStyle}>{(t.probability * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const statsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' };
const statItemStyle: React.CSSProperties = { padding: '8px', backgroundColor: '#1e293b', borderRadius: '4px' };
const statLabelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', color: '#64748b', marginBottom: '4px' };
const statValueStyle: React.CSSProperties = { display: 'block', fontSize: '14px', color: '#e2e8f0', fontWeight: '600' };
const usageSectionStyle: React.CSSProperties = { marginTop: '16px' };
const chartTitleStyle: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', marginBottom: '8px' };
const usageBarContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' };
const usageLabelStyle: React.CSSProperties = { width: '24px', fontSize: '11px', color: '#64748b' };
const usageBarStyle: React.CSSProperties = { flex: 1, height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' };
const usageBarFillStyle: React.CSSProperties = { height: '100%', backgroundColor: '#2dd4bf', borderRadius: '4px' };
const usageValueStyle: React.CSSProperties = { width: '32px', fontSize: '11px', color: '#64748b', textAlign: 'right' };
