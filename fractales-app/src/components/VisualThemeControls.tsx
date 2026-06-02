import { VisualTheme, defaultVisualTheme } from '../types/visual';

interface Props {
  theme: VisualTheme;
  onChange: (patch: Partial<VisualTheme>) => void;
  onReset: () => void;
}

export const VisualThemeControls = ({ theme, onChange, onReset }: Props) => {
  return (
    <div style={containerStyle}>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
        Personaliza los colores y estilos de tu fractal
      </span>
      {/* Background */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Fondo</label>
        <div style={rowStyle}>
          <input
            type="color"
            value={theme.bgColor}
            onChange={e => onChange({ bgColor: e.target.value })}
            style={colorInputStyle}
          />
          {/* <span style={valueStyle}>{theme.bgColor}</span> */}
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Color inicial fractal</label>

        <input
          type="color"
          value={theme.gradientStart}
          onChange={(e) =>
            onChange({ gradientStart: e.target.value })
          }
          style={colorInputStyle}
        />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Color final fractal</label>

        <input
          type="color"
          value={theme.gradientEnd}
          onChange={(e) =>
            onChange({ gradientEnd: e.target.value })
          }
          style={colorInputStyle}
        />
      </div>

      {/* Grid */}
      <div style={sectionStyle}>
        <div style={rowStyle}>
          <label style={labelStyle}>Cuadrícula</label>
          <input
            type="checkbox"
            checked={theme.gridEnabled}
            onChange={e => onChange({ gridEnabled: e.target.checked })}
            style={checkboxStyle}
          />
        </div>
        {theme.gridEnabled && (
          <>
            <div style={rowStyle}>
              <input
                type="color"
                value={theme.gridColor}
                onChange={e => onChange({ gridColor: e.target.value })}
                style={colorInputStyle}
              />
              {/* <span style={valueStyle}>{theme.gridColor}</span> */}
            </div>
            <div style={sliderRowStyle}>
              <span style={sliderLabelStyle}>Opacidad</span>
              <input
                className="custom-slider"
                type="range"
                min="0"
                max="100"
                value={Math.round(theme.gridOpacity * 100)}
                onChange={e => onChange({ gridOpacity: parseInt(e.target.value) / 100 })}
                style={sliderStyle}
              />
              <span style={valueStyle}>{Math.round(theme.gridOpacity * 100)}%</span>
            </div>
          </>
        )}
      </div>

      {/* Axes */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Ejes X/Y</label>
        <div style={rowStyle}>
          <input
            type="color"
            value={theme.axesColor}
            onChange={e => onChange({ axesColor: e.target.value })}
            style={colorInputStyle}
          />
          {/* <span style={valueStyle}>{theme.axesColor}</span> */}
        </div>
      </div>

      {/* Glow */}
      <div style={sectionStyle}>
        <div style={rowStyle}>
          <label style={labelStyle}>Brillo (glow)</label>
          <input
            type="checkbox"
            checked={theme.glowEnabled}
            onChange={e => onChange({ glowEnabled: e.target.checked })}
            style={checkboxStyle}
          />
        </div>
        {theme.glowEnabled && (
          <div style={sliderRowStyle}>
            <span style={sliderLabelStyle}>Intensidad</span>
            <input
              className="custom-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round(theme.glowIntensity * 100)}
              onChange={e => onChange({ glowIntensity: parseInt(e.target.value) / 100 })}
              style={sliderStyle}
            />
            <span style={valueStyle}>{Math.round(theme.glowIntensity * 100)}%</span>
          </div>
        )}
      </div>

      {/* Reset */}
      <button onClick={onReset} style={resetButtonStyle}>
        Restaurar colores por defecto
      </button>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#94a3b8',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const sliderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingLeft: '4px',
};

const sliderLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  minWidth: '60px',
};

const colorInputStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  padding: '0',
  border: '1px solid #334155',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  accentColor: '#2dd4bf',
  cursor: 'pointer',
};

const sliderStyle: React.CSSProperties = {
  flex: 1,
  cursor: 'pointer',
  accentColor: '#2dd4bf',
};

const valueStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  fontFamily: 'monospace',
  minWidth: '36px',
};

const resetButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '12px',
  cursor: 'pointer',
  marginTop: '4px',
};