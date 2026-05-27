import { useState, useEffect } from 'react';
import { FractalConfig } from '../types';
import { storageService, SavedConfig } from '../services/storage';

interface Props {
  fractal: FractalConfig;
  onFractalChange: (config: FractalConfig) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const SaveTab = ({ fractal, onFractalChange, canUndo, canRedo, onUndo, onRedo }: Props) => {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [configName, setConfigName] = useState('');

  useEffect(() => {
    setSavedConfigs(storageService.getSavedConfigs());
  }, []);

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

  return (
    <div>
      <div style={historyButtonsStyle}>
        <button onClick={onUndo} disabled={!canUndo} style={canUndo ? historyButtonStyle : disabledButtonStyle}>
          ↩ Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} style={canRedo ? historyButtonStyle : disabledButtonStyle}>
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
};

const historyButtonsStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '12px' };
const historyButtonStyle: React.CSSProperties = { flex: 1, padding: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px', color: '#e2e8f0', fontSize: '12px', cursor: 'pointer' };
const disabledButtonStyle: React.CSSProperties = { flex: 1, padding: '8px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', color: '#475569', fontSize: '12px', cursor: 'not-allowed' };
const inputGroupStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginBottom: '12px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '14px' };
const primaryButtonStyle: React.CSSProperties = { flex: 1, padding: '10px 16px', backgroundColor: '#2dd4bf', border: 'none', borderRadius: '6px', color: '#0f172a', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };
const savedListStyle: React.CSSProperties = { maxHeight: '150px', overflowY: 'auto' };
const savedItemStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '4px' };
const savedNameStyle: React.CSSProperties = { fontSize: '12px', color: '#e2e8f0' };
const savedActionsStyle: React.CSSProperties = { display: 'flex', gap: '4px' };
const loadButtonStyle: React.CSSProperties = { padding: '4px 8px', backgroundColor: '#334155', border: 'none', borderRadius: '4px', color: '#e2e8f0', fontSize: '11px', cursor: 'pointer' };
const deleteButtonStyle: React.CSSProperties = { padding: '4px 8px', backgroundColor: '#7f1d1d', border: 'none', borderRadius: '4px', color: '#fecaca', fontSize: '11px', cursor: 'pointer' };
const emptyTextStyle: React.CSSProperties = { fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '16px' };
