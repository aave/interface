import { Trans } from '@lingui/macro';
import { ListItem, MenuItem } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

import { SettingSwitchRow } from './SettingSwitchRow';

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const DarkModeSwitcher = ({ component = ListItem }: DarkModeSwitcherProps) => {
  const { mode, systemMode, setMode } = useColorScheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  // `mode` can be 'system'; resolve it to the concrete scheme for the toggle state.
  const resolvedMode = (mode === 'system' ? systemMode : mode) ?? 'light';
  const isDark = resolvedMode === 'dark';

  return (
    <SettingSwitchRow
      component={component}
      label={<Trans>Dark mode</Trans>}
      checked={isDark}
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      onSwitchClick={() => trackEvent(SETTINGS.DARK_MODE, { mode: resolvedMode })}
    />
  );
};
