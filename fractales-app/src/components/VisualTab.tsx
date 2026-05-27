import { VisualTheme } from '../types/visual';
import { VisualThemeControls } from './VisualThemeControls';

interface Props {
  theme: VisualTheme;
  onChange: (patch: Partial<VisualTheme>) => void;
  onReset: () => void;
}

export const VisualTab = ({ theme, onChange, onReset }: Props) => {
  return (
    <VisualThemeControls
      theme={theme}
      onChange={onChange}
      onReset={onReset}
    />
  );
};
