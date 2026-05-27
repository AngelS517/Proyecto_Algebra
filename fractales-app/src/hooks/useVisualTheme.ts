import { useState, useCallback } from 'react';
import { VisualTheme, defaultVisualTheme } from '../types/visual';

export const useVisualTheme = (initial?: Partial<VisualTheme>) => {
  const [theme, setTheme] = useState<VisualTheme>({ ...defaultVisualTheme, ...initial });

  const updateTheme = useCallback((patch: Partial<VisualTheme>) => {
    setTheme(prev => ({ ...prev, ...patch }));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme({ ...defaultVisualTheme });
  }, []);

  return { theme, updateTheme, resetTheme };
};