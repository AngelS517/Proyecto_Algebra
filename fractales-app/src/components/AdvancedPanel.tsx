import { useState, useEffect, useRef, useCallback } from 'react';
import { FractalConfig, Point, AffineTransform } from '../types';
import { storageService, SavedConfig } from '../services/storage';
import { exportService } from '../services/export';
import { statisticsService, FractalStats } from '../services/statistics';
import { getPresetNames, getPreset, getAllPresets } from '../data/presets';
import { useHistory } from '../hooks/useHistory';
import { getDefaultTransform, CanvasTransform } from '../utils/canvasUtils';

interface AdvancedPanelProps {
  fractal: FractalConfig;
  onFractalChange: (config: FractalConfig) => void;
  points: Point[];
  iteration: number;
  isRunning: boolean;
  transform: CanvasTransform;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

type TabType = 'save' | 'export' | 'stats' | 'presets' | 'compare';

const initialTransformUsage = (transforms: AffineTransform[]): number[] =>
  transforms.map(() => 0);

export const AdvancedPanel = ({
  fractal,
  onFractalChange,
  points,
  iteration,
  isRunning,
  transform,
  canvasRef,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: AdvancedPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('save');
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [configName, setConfigName] = useState('');
  const [stats, setStats] = useState<FractalStats | null>(null);
  const [generationTime, setGenerationTime] = useState(0);
  const [transformUsage, setTransformUsage] = useState<number[]>(initialTransformUsage(fractal.transforms));
  const [showCompare, setShowCompare] = useState(false);
  const [compareConfig, setCompareConfig] = useState<FractalConfig | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<'dark' | 'light'>('dark');

  const startTimeRef = useRef<number>(0);
  const history = useHistory<FractalConfig>(fractal);

  useEffect(() => {
    setSavedConfigs(storageService.getSavedConfigs());
  }, []);

  useEffect(() => {
    setTransformUsage(initialTransformUsage(fractal.transforms));
  }, [fractal.transforms]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
    } else if (points.length > 0 && startTimeRef.current > 0) {
      const time = performance.now() - startTimeRef.current;
      setGenerationTime(Math.round(time));
    }
  }, [isRunning, points.length]);

  useEffect(() => {
    if (iteration > 0) {
      const newStats = statisticsService.calculateStats(
        iteration,
        generationTime,
        points.length,
        transformUsage,
        fractal.transforms
      );
      setStats(newStats);
    }
  }, [iteration, generationTime, points.length, transformUsage, fractal.transforms]);

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

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportService.exportToPNG(canvas, {
        backgroundColor: backgroundColor === 'dark' ? '#0f172a' : '#ffffff',
        resolution: 3,
        points: points,
        transform: transform,
        color: fractal.color,
      });
    }
  }, [points, transform, fractal.color, backgroundColor]);

  const handleExportJPG = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportService.exportToJPG(canvas, 0.95);
    }
  }, []);

  const handleSelectPreset = (name: string) => {
    const preset = getPreset(name);
    if (preset) {
      onFractalChange(preset);
      history.setState(preset);
    }
  };

  const handleSavePreset = () => {
    const name = prompt('Nombre del preset:');
    if (name) {
      storageService.savePreset(name, fractal);
    }
  };

  const handleUndo = () => {
    history.undo();
    onFractalChange(history.state);
    onUndo?.();
  };

  const handleRedo = () => {
    history.redo();
    onFractalChange(history.state);
    onRedo?.();
  };

  const presetNames = getPresetNames();
  const builtinPresets = getAllPresets();

  return (
    <div style={containerStyle}>
      <div style={tabsContainerStyle}>
        {(['save', 'export', 'stats', 'presets', 'compare'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabButtonStyle,
              ...(activeTab === tab ? activeTabStyle : {}),
            }}
          >
            {tab === 'save' ? '💾' : tab === 'export' ? '🖼️' : tab === 'stats' ? '📊' : tab === 'presets' ? '🎨' : '🆚'}
          </button>
        ))}
      </div>

      <div style={panelContentStyle}>
        {activeTab === 'save' && (
          <div>
            <h3 style={sectionTitleStyle}>Guardar/Cargar Configuración</h3>

            <div style={historyButtonsStyle}>
              <button onClick={handleUndo} disabled={!history.canUndo} style={historyButtonStyle}>
                ↩ Undo
              </button>
              <button onClick={handleRedo} disabled={!history.canRedo} style={historyButtonStyle}>
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
        )}

        {activeTab === 'export' && (
          <div>
            <h3 style={sectionTitleStyle}>Exportar Imagen</h3>

            <div style={optionGroupStyle}>
              <label style={optionLabelStyle}>
                <span>Fondo</span>
                <select
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value as 'dark' | 'light')}
                  style={selectStyle}
                >
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                </select>
              </label>
            </div>

            <div style={exportButtonsStyle}>
              <button onClick={handleExportPNG} style={exportButtonStyle}>
                📥 Exportar PNG (Alta-res)
              </button>
              <button onClick={handleExportJPG} style={exportButtonStyle}>
                📥 Exportar JPG
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h3 style={sectionTitleStyle}>Estadísticas en Tiempo Real</h3>

            {stats ? (
              <div style={statsGridStyle}>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Iteraciones</span>
                  <span style={statValueStyle}>{stats.iterationCount.toLocaleString()}</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Tiempo de generación</span>
                  <span style={statValueStyle}>{stats.generationTimeMs} ms</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Densidad de puntos</span>
                  <span style={statValueStyle}>{stats.pointsPerArea.toFixed(4)}</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statLabelStyle}>Transformación más usada</span>
                  <span style={statValueStyle}>T{stats.mostUsedTransform + 1}</span>
                </div>
              </div>
            ) : (
              <p style={emptyTextStyle}>Inicia la generación para ver estadísticas</p>
            )}

            <div style={usageChartStyle}>
              <h4 style={chartTitleStyle}>Uso de transformaciones</h4>
              {fractal.transforms.map((t, i) => (
                <div key={i} style={usageBarContainerStyle}>
                  <span style={usageLabelStyle}>T{i + 1}</span>
                  <div style={usageBarStyle}>
                    <div
                      style={{
                        ...usageBarFillStyle,
                        width: `${(t.probability * 100).toFixed(1)}%`,
                      }}
                    />
                  </div>
                  <span style={usageValueStyle}>{(t.probability * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div>
            <h3 style={sectionTitleStyle}>Presets Avanzados</h3>

            <div style={presetGridStyle}>
              {builtinPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectPreset(preset.name)}
                  style={presetButtonStyle}
                >
                  <span style={presetNameStyle}>{preset.name}</span>
                  <span style={presetDescStyle}>{preset.description.substring(0, 30)}...</span>
                </button>
              ))}
            </div>

            <button onClick={handleSavePreset} style={savePresetButtonStyle}>
              ➕ Guardar preset actual
            </button>
          </div>
        )}

        {activeTab === 'compare' && (
          <div>
            <h3 style={sectionTitleStyle}>Comparador de Fractales</h3>
            <p style={infoTextStyle}>
              El modo comparador divide la pantalla para ver dos fractales lado a lado.
              Los controles de zoom y movimiento se sincronizan.
            </p>
            <button
              onClick={() => setShowCompare(!showCompare)}
              style={{
                ...toggleCompareButtonStyle,
                backgroundColor: showCompare ? '#f472b6' : '#1e293b',
              }}
            >
              {showCompare ? '🔴 Salir del modo comparador' : '🟢 Activar modo comparador'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '260px',
  minWidth: '260px',
  backgroundColor: '#0f172a',
  padding: '16px',
  overflowY: 'auto',
  maxHeight: '100vh',
  borderLeft: '1px solid #1e293b',
};

const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  marginBottom: '16px',
};

const tabButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 4px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#94a3b8',
  fontSize: '16px',
  cursor: 'pointer',
};

const activeTabStyle: React.CSSProperties = {
  backgroundColor: '#334155',
  color: '#e2e8f0',
  borderColor: '#2dd4bf',
};

const panelContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#e2e8f0',
  marginBottom: '12px',
};

const historyButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
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

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontSize: '12px',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#2dd4bf',
  border: 'none',
  borderRadius: '4px',
  color: '#0f172a',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
};

const savedListStyle: React.CSSProperties = {
  maxHeight: '200px',
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

const selectStyle: React.CSSProperties = {
  padding: '8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontSize: '12px',
};

const exportButtonsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const exportButtonStyle: React.CSSProperties = {
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

const usageChartStyle: React.CSSProperties = {
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
  marginBottom: '12px',
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

const savePresetButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#334155',
  border: '1px solid #475569',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '12px',
  cursor: 'pointer',
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  marginBottom: '12px',
  lineHeight: '1.5',
};

const toggleCompareButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
};