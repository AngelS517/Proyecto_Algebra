import { useState, useEffect, useRef } from 'react';
import { FractalConfig, Point, AffineTransform } from '../types';
import { TransformEditor } from './TransformEditor';
import { storageService, SavedConfig } from '../services/storage';
import { exportService } from '../services/export';
import { getPreset, getAllPresets } from '../data/presets';
import { getFractal, getFractalNames } from '../data/fractals';

type TabType = 'editor' | 'save' | 'export' | 'stats' | 'presets' | 'compare';

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
  points: Point[];
  transform?: { scale: number; offsetX: number; offsetY: number; width: number; height: number };
  showCompare?: boolean;
  onToggleCompare?: (show: boolean) => void;
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
  points,
  transform,
  showCompare,
  onToggleCompare,
}: ControlsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [configName, setConfigName] = useState('');
  const [history, setHistory] = useState<FractalConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [compareFractal, setCompareFractal] = useState('sierpinski');
  const [backgroundColor, setBackgroundColor] = useState<'dark' | 'light'>('dark');
  const [exportResolution, setExportResolution] = useState(2);
  const [fileName, setFileName] = useState('fractal');

  useEffect(() => {
    setSavedConfigs(storageService.getSavedConfigs());
  }, []);

  useEffect(() => {
    if (historyIndex < history.length - 1) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(fractal)));
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (historyIndex === -1) {
      setHistory([JSON.parse(JSON.stringify(fractal))]);
      setHistoryIndex(0);
    }
  }, [fractal]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onFractalChange(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onFractalChange(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleTransformChange = (index: number, transform: FractalConfig['transforms'][0]) => {
    const newTransforms = [...fractal.transforms];
    newTransforms[index] = transform;
    onFractalChange({ ...fractal, transforms: newTransforms });
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) return;
    storageService.saveConfig(configName.trim(), fractal);
    setSavedConfigs(storageService.getSavedConfigs());
    setConfigName('');
  };

  const handleLoadConfig = (config: SavedConfig) => {
    onFractalChange(config.config);
  };

  const handleDeleteConfig = (id: string) => {
    storageService.deleteConfig(id);
    setSavedConfigs(storageService.getSavedConfigs());
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportService.exportToPNG(canvas, {
        backgroundColor: backgroundColor === 'dark' ? '#0f172a' : '#ffffff',
        resolution: exportResolution,
        points: points,
        transform: transform || { scale: 50, offsetX: 0.5, offsetY: 0.5, width: 800, height: 600 },
        color: fractal.color,
        fileName: fileName,
      });
    }
  };

  const handleExportJPG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportService.exportToJPGWithOptions(canvas, {
        backgroundColor: backgroundColor === 'dark' ? '#0f172a' : '#ffffff',
        quality: 0.95,
        fileName: fileName,
      });
    }
  };

  const handleSelectPreset = (name: string) => {
    const preset = getPreset(name);
    if (preset) {
      onFractalChange(preset);
    }
  };

  const builtinPresets = getAllPresets();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
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

      case 'save':
        return (
          <div>
            <div style={historyButtonsStyle}>
              <button onClick={handleUndo} disabled={!canUndo} style={canUndo ? historyButtonStyle : disabledButtonStyle}>
                ↩ Undo
              </button>
              <button onClick={handleRedo} disabled={!canRedo} style={canRedo ? historyButtonStyle : disabledButtonStyle}>
                Redo ↪
              </button>
            </div>

            <div style={inputGroupStyle}>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Nombre de configuración"
                style={inputStyle}
              />
              <button onClick={handleSaveConfig} style={primaryButtonStyle}>
                Guardar
              </button>
            </div>

            <div style={savedListStyle}>
              {savedConfigs.length === 0 ? (
                <p style={emptyTextStyle}>No hay configuraciones guardadas</p>
              ) : (
                savedConfigs.map(config => (
                  <div key={config.id} style={savedItemStyle}>
                    <span style={savedNameStyle}>{config.name}</span>
                    <div style={savedActionsStyle}>
                      <button onClick={() => handleLoadConfig(config)} style={loadButtonStyle}>
                        Cargar
                      </button>
                      <button onClick={() => handleDeleteConfig(config.id)} style={deleteButtonStyle}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'export':
        return (
          <div>
            <div style={exportSectionStyle}>
              <div style={exportPreviewStyle}>
                <div style={previewLabelStyle}>Vista previa del fractal</div>
                <div style={fractalNameStyle}>{fractal.name}</div>
                <div style={pointsCountStyle}>{points.length.toLocaleString()} puntos</div>
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
      
      case 'stats':
        return (
          <div>
            <div style={statsGridStyle}>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Iteraciones</span>
                <span style={statValueStyle}>{iteration.toLocaleString()}</span>
              </div>
              <div style={statItemStyle}>
                <span style={statLabelStyle}>Puntos dibujados</span>
                <span style={statValueStyle}>{points.length.toLocaleString()}</span>
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

      case 'presets':
        return (
          <div>
            <div style={presetGridStyle}>
              {builtinPresets.map((preset, i) => (
                <button key={i} onClick={() => handleSelectPreset(preset.name)} style={presetButtonStyle}>
                  <span style={presetNameStyle}>{preset.name}</span>
                  <span style={presetDescStyle}>{preset.description.substring(0, 25)}...</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'compare':
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
              onClick={() => onToggleCompare?.(!showCompare)}
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

      default:
        return null;
    }
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
          {fractalNames.map(fname => (
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
        <label style={labelStyle}>Iteraciones: {iteration.toLocaleString()} / {maxIterations.toLocaleString()}</label>
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
        <button onClick={onZoomIn} style={iconButtonStyle}>+</button>
        <button onClick={onZoomOut} style={iconButtonStyle}>-</button>
        <button onClick={onResetView} style={iconButtonStyle}>⟲</button>
      </div>

      <button onClick={onToggleAdvanced} style={toggleButtonStyle}>
        {showAdvanced ? '▼' : '▶'} Opciones avanzadas
      </button>

      {showAdvanced && (
        <div style={advancedContainerStyle}>
          <div style={tabsContainerStyle}>
            {(['editor', 'save', 'export', 'stats', 'presets', 'compare'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...tabButtonStyle,
                  ...(activeTab === tab ? activeTabStyle : {}),
                }}
              >
                {tab === 'editor' ? '✏️' : tab === 'save' ? '💾' : tab === 'export' ? '🖼️' : tab === 'stats' ? '📊' : tab === 'presets' ? '🎨' : '🆚'}
              </button>
            ))}
          </div>
          <div style={tabContentStyle}>
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '320px',
  minWidth: '320px',
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

const advancedContainerStyle: React.CSSProperties = {
  marginTop: '12px',
  borderTop: '1px solid #334155',
  paddingTop: '12px',
};

const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  marginBottom: '12px',
};

const tabButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 2px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#94a3b8',
  fontSize: '14px',
  cursor: 'pointer',
};

const activeTabStyle: React.CSSProperties = {
  backgroundColor: '#334155',
  color: '#e2e8f0',
  borderColor: '#2dd4bf',
};

const tabContentStyle: React.CSSProperties = {
  maxHeight: '400px',
  overflowY: 'auto',
};

const historyButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
};

const historyButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontSize: '12px',
  cursor: 'pointer',
};

const disabledButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '4px',
  color: '#475569',
  fontSize: '12px',
  cursor: 'not-allowed',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
};

const savedListStyle: React.CSSProperties = {
  maxHeight: '150px',
  overflowY: 'auto',
};

const savedItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
  marginBottom: '4px',
};

const savedNameStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#e2e8f0',
};

const savedActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
};

const loadButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#334155',
  border: 'none',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontSize: '11px',
  cursor: 'pointer',
};

const deleteButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#7f1d1d',
  border: 'none',
  borderRadius: '4px',
  color: '#fecaca',
  fontSize: '11px',
  cursor: 'pointer',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  textAlign: 'center',
  padding: '16px',
};

const optionGroupStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const optionLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontSize: '12px',
  color: '#94a3b8',
};

const fullButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  cursor: 'pointer',
  textAlign: 'center',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  marginBottom: '16px',
};

const statItemStyle: React.CSSProperties = {
  padding: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
};

const statLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  color: '#64748b',
  marginBottom: '4px',
};

const statValueStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  color: '#e2e8f0',
  fontWeight: '600',
};

const usageSectionStyle: React.CSSProperties = {
  marginTop: '16px',
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '8px',
};

const usageBarContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '6px',
};

const usageLabelStyle: React.CSSProperties = {
  width: '24px',
  fontSize: '11px',
  color: '#64748b',
};

const usageBarStyle: React.CSSProperties = {
  flex: 1,
  height: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
  overflow: 'hidden',
};

const usageBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#2dd4bf',
  borderRadius: '4px',
};

const usageValueStyle: React.CSSProperties = {
  width: '32px',
  fontSize: '11px',
  color: '#64748b',
  textAlign: 'right',
};

const presetGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const presetButtonStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
};

const presetNameStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#e2e8f0',
  fontWeight: '600',
  marginBottom: '2px',
};

const presetDescStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  color: '#64748b',
};

const compareInfoStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: '1.5',
};

const currentFractalStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '14px',
};

const exportSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const exportPreviewStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  textAlign: 'center',
};

const previewLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748b',
  marginBottom: '4px',
};

const fractalNameStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#e2e8f0',
  fontWeight: '600',
};

const pointsCountStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#94a3b8',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const formLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  fontWeight: '500',
};

const radioGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const radioLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#e2e8f0',
};

const radioSpanStyle: React.CSSProperties = {
  padding: '6px 10px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
};

const resolutionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
};

const resolutionButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#94a3b8',
  fontSize: '12px',
  cursor: 'pointer',
};

const resolutionActiveStyle: React.CSSProperties = {
  backgroundColor: '#2dd4bf',
  borderColor: '#2dd4bf',
  color: '#0f172a',
  fontWeight: '600',
};

const resolutionInfoStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#64748b',
  marginTop: '4px',
};

const getCanvasSize = (resolution: number): string => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    return `${canvas.width * resolution} x ${canvas.height * resolution} px`;
  }
  return `${800 * resolution} x ${600 * resolution} px`;
};

const exportButtonsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px',
};

const exportPngButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#2dd4bf',
  border: 'none',
  borderRadius: '8px',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const exportJpgButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const exportNoteStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  textAlign: 'center',
  padding: '8px',
  backgroundColor: '#1e293b',
  borderRadius: '4px',
};