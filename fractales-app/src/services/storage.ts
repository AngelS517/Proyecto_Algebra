import { FractalConfig } from '../types';

const STORAGE_KEYS = {
  SAVED_CONFIGS: 'ifs_saved_configs',
  SAVED_PRESETS: 'ifs_saved_presets',
  APP_SETTINGS: 'ifs_app_settings',
};

export interface SavedConfig {
  id: string;
  name: string;
  config: FractalConfig;
  createdAt: number;
}

export interface SavedPreset {
  id: string;
  name: string;
  config: FractalConfig;
  isBuiltIn: boolean;
  createdAt: number;
}

export interface AppSettings {
  backgroundColor: 'dark' | 'light';
  exportResolution: number;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const storageService = {
  saveConfig: (name: string, config: FractalConfig): SavedConfig => {
    const savedConfigs = storageService.getSavedConfigs();
    const newConfig: SavedConfig = {
      id: generateId(),
      name,
      config,
      createdAt: Date.now(),
    };
    savedConfigs.push(newConfig);
    localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify(savedConfigs));
    return newConfig;
  },

  getSavedConfigs: (): SavedConfig[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_CONFIGS);
    return data ? JSON.parse(data) : [];
  },

  deleteConfig: (id: string): void => {
    const savedConfigs = storageService.getSavedConfigs();
    const filtered = savedConfigs.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify(filtered));
  },

  updateConfig: (id: string, name: string): void => {
    const savedConfigs = storageService.getSavedConfigs();
    const index = savedConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
      savedConfigs[index].name = name;
      localStorage.setItem(STORAGE_KEYS.SAVED_CONFIGS, JSON.stringify(savedConfigs));
    }
  },

  savePreset: (name: string, config: FractalConfig): SavedPreset => {
    const savedPresets = storageService.getSavedPresets();
    const newPreset: SavedPreset = {
      id: generateId(),
      name,
      config,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    savedPresets.push(newPreset);
    localStorage.setItem(STORAGE_KEYS.SAVED_PRESETS, JSON.stringify(savedPresets));
    return newPreset;
  },

  getSavedPresets: (): SavedPreset[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_PRESETS);
    return data ? JSON.parse(data) : [];
  },

  deletePreset: (id: string): void => {
    const savedPresets = storageService.getSavedPresets();
    const filtered = savedPresets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_PRESETS, JSON.stringify(filtered));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : { backgroundColor: 'dark', exportResolution: 2 };
  },

  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  },
};