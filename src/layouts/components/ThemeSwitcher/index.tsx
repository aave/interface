import { Trans } from '@lingui/macro';
import { ListItem, MenuItem } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { ThemeDarkIcon, ThemeLightIcon, ThemeSystemIcon } from 'src/components/icons/ThemeIcons';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

import { SettingsNavRow } from '../SettingsNavRow';
import { SettingsSubmenuList } from '../SettingsSubmenuList';

const ICON_SX = { fontSize: '1.125rem' };

// Keyed by MUI's own colour-scheme modes, so this map is the only list of them.
const themeMap = {
  system: { label: <Trans>System</Trans>, icon: <ThemeSystemIcon sx={ICON_SX} /> },
  light: { label: <Trans>Light</Trans>, icon: <ThemeLightIcon sx={ICON_SX} /> },
  dark: { label: <Trans>Dark</Trans>, icon: <ThemeDarkIcon sx={ICON_SX} /> },
};
type ThemeMode = keyof typeof themeMap;

const THEME_OPTIONS = (Object.keys(themeMap) as ThemeMode[]).map((key) => ({
  key,
  ...themeMap[key],
}));

interface ThemeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
  onClick: () => void;
}

export const ThemeListItem = ({ component = ListItem, onClick }: ThemeSwitcherProps) => {
  const { mode } = useColorScheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <SettingsNavRow
      component={component}
      label={<Trans>Theme</Trans>}
      value={themeMap[mode ?? 'system'].label}
      // Tracked from the row rather than its container, so the drawer counts too.
      onClick={() => {
        trackEvent(SETTINGS.THEME);
        onClick();
      }}
    />
  );
};

export const ThemesList = ({ component = ListItem, onClick }: ThemeSwitcherProps) => {
  const { mode, setMode } = useColorScheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <SettingsSubmenuList
      component={component}
      selectedKey={mode ?? 'system'}
      onBack={onClick}
      onSelect={(key) => {
        setMode(key as ThemeMode);
        trackEvent(SETTINGS.THEME_SELECTED, { theme: key });
      }}
      options={THEME_OPTIONS}
    />
  );
};
