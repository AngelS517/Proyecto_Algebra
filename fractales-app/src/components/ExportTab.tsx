import { useState } from 'react';
import { FractalConfig, Point } from '../types';
import { exportService } from '../services/export';

interface Props {
  points?: Point[];
  iteration: number;
  fractal: FractalConfig;
  canvasElement?: HTMLCanvasElement | null;
}

export const ExportTab = ({ points, iteration, fractal, canvasElement }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState<'dark' | 'light'>('dark');
  const [exportResolution, setExportResolution] = useState(2);
  const [fileName, setFileName] = useState('fractal');

  const handleExportPNG = () => {
    const canvas = canvasElement ?? document.querySelector('canvas');
    if (canvas) {
      exportService.exportToPNG(canvas, {
        backgroundColor: backgroundColor === 'dark' ? '#0f172a' : '#ffffff',
        resolution: exportResolution,
        points: points,
        transform: { scale: 50, offsetX: 0.5, offsetY: 0.5, width: 800, height: 600 },
        color: fractal.color,
        fileName: fileName,
      });
    }
  };

  const handleExportJPG = () => {
    const canvas = canvasElement ?? document.querySelector('canvas');
    if (canvas) {
      exportService.exportToJPGWithOptions(canvas, {
        backgroundColor: backgroundColor === 'dark' ? '#0f172a' : '#ffffff',
        quality: 0.95,
        fileName: fileName,
      });
    }
  };

  const getCanvasSize = (resolution: number): string => {
    const canvas = canvasElement ?? document.querySelector('canvas');
    if (canvas) {
      return `${canvas.width * resolution} x ${canvas.height * resolution} px`;
    }
    return `${800 * resolution} x ${600 * resolution} px`;
  };

  return (
    <div>
      <div style={exportSectionStyle}>
        <div style={exportPreviewStyle}>
          <div style={previewLabelStyle}>Vista previa del fractal</div>
          <div style={fractalNameStyle}>{fractal.name}</div>
          <div style={pointsCountStyle}>{(points?.length || iteration).toLocaleString()} puntos</div>
        </div>

        <div style={formGroupStyle}>
          <label style={formLabelStyle}>Nombre del archivo</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={inputStyle}
            placeholder="mi-fractal"
          />
        </div>

        <div style={formGroupStyle}>
          <label style={formLabelStyle}>Fondo</label>
          <div style={radioGroupStyle}>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="bgColor"
                value="dark"
                checked={backgroundColor === 'dark'}
                onChange={() => setBackgroundColor('dark')}
              />
              <span style={radioSpanStyle}>🌙 Oscuro</span>
            </label>
            <label style={radioLabelStyle}>
              <input
                type="radio"
                name="bgColor"
                value="light"
                checked={backgroundColor === 'light'}
                onChange={() => setBackgroundColor('light')}
              />
              <span style={radioSpanStyle}>☀️ Claro</span>
            </label>
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={formLabelStyle}>Resolución</label>
          <div style={resolutionButtonsStyle}>
            {[1, 2, 3, 4].map(res => (
              <button
                key={res}
                onClick={() => setExportResolution(res)}
                style={{
                  ...resolutionButtonStyle,
                  ...(exportResolution === res ? resolutionActiveStyle : {}),
                }}
              >
                {res}x
              </button>
            ))}
          </div>
          <div style={resolutionInfoStyle}>
            <span>Tamaño: {getCanvasSize(exportResolution)}</span>
          </div>
        </div>

        <div style={exportButtonsStyle}>
          <button onClick={handleExportPNG} style={exportPngButtonStyle}>
            📥 Exportar PNG
          </button>
          <button onClick={handleExportJPG} style={exportJpgButtonStyle}>
            📥 Exportar JPG
          </button>
        </div>

        <div style={exportNoteStyle}>
          💡 PNG recomendado para máxima calidad
        </div>
      </div>
    </div>
  );
};

const exportSectionStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const exportPreviewStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center' };
const previewLabelStyle: React.CSSProperties = { fontSize: '10px', color: '#64748b', marginBottom: '4px' };
const fractalNameStyle: React.CSSProperties = { fontSize: '14px', color: '#e2e8f0', fontWeight: '600' };
const pointsCountStyle: React.CSSProperties = { fontSize: '11px', color: '#94a3b8' };
const formGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const formLabelStyle: React.CSSProperties = { fontSize: '12px', color: '#94a3b8', fontWeight: '500' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '14px' };
const radioGroupStyle: React.CSSProperties = { display: 'flex', gap: '8px' };
const radioLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px', color: '#e2e8f0' };
const radioSpanStyle: React.CSSProperties = { padding: '6px 10px', backgroundColor: '#1e293b', borderRadius: '4px' };
const resolutionButtonsStyle: React.CSSProperties = { display: 'flex', gap: '6px' };
const resolutionButtonStyle: React.CSSProperties = { flex: 1, padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' };
const resolutionActiveStyle: React.CSSProperties = { backgroundColor: '#2dd4bf', borderColor: '#2dd4bf', color: '#0f172a', fontWeight: '600' };
const resolutionInfoStyle: React.CSSProperties = { fontSize: '10px', color: '#64748b', marginTop: '4px' };
const exportButtonsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' };
const exportPngButtonStyle: React.CSSProperties = { width: '100%', padding: '14px', backgroundColor: '#2dd4bf', border: 'none', borderRadius: '8px', color: '#0f172a', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const exportJpgButtonStyle: React.CSSProperties = { width: '100%', padding: '14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const exportNoteStyle: React.CSSProperties = { fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '8px', backgroundColor: '#1e293b', borderRadius: '4px' };
