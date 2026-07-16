import { Trans } from '@lingui/macro';
import { ListItem, MenuItem, useTheme } from '@mui/material';
import { useContext } from 'react';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

import { ColorModeContext } from '../AppGlobalStyles';
import { SettingSwitchRow } from './SettingSwitchRow';

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const DarkModeSwitcher = ({ component = ListItem }: DarkModeSwitcherProps) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <SettingSwitchRow
      component={component}
      label={<Trans>Dark mode</Trans>}
      checked={theme.palette.mode === 'dark'}
      onClick={colorMode.toggleColorMode}
      onSwitchClick={() => trackEvent(SETTINGS.DARK_MODE, { mode: theme.palette.mode })}
    />
  );
};
